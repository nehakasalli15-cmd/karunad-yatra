require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, app: "Karunad Yatra" });
});

/* -----------------------------------------------------------
   Tourist Places (the single source of truth — hotels and
   restaurants are only ever shown *inside* a destination page,
   there are no standalone hotel/restaurant listing pages)
----------------------------------------------------------- */
app.get("/api/places", async (req, res) => {
  try {
    const category = req.query.category || "";
    let query = "SELECT * FROM tourist_places WHERE 1=1";
    const params = [];

    if (category && category.toLowerCase() !== "all") {
      query += " AND category = ?";
      params.push(category);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/places/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tourist_places WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Place not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

/* -----------------------------------------------------------
   Hotels & Restaurants — destination-scoped only. These feed
   the "Nearby hotels / Nearby restaurants" sections on a
   destination's own page (place.html).
----------------------------------------------------------- */
app.get("/api/hotels/destination/:destId", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM hotels WHERE destination_id = ? ORDER BY rating DESC",
      [req.params.destId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/restaurants/destination/:destId", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM restaurants WHERE destination_id = ? ORDER BY rating DESC",
      [req.params.destId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// Crowd Status
app.get("/api/crowd/:placeId", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM crowd_status WHERE destination_id = ?", [req.params.placeId]);
    if (rows.length === 0) return res.status(404).json({ error: "Crowd status not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// Global Search (destinations only, since that's the only listing page now)
app.get("/api/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    if (!q) return res.json({ places: [] });

    const likeQ = `%${q}%`;
    const [places] = await db.query(
      "SELECT * FROM tourist_places WHERE name LIKE ? OR city LIKE ? OR district LIKE ? OR category LIKE ?",
      [likeQ, likeQ, likeQ, likeQ]
    );
    res.json({ places });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// Chatbot
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const lowerMessage = message.toLowerCase();
    let reply = "I am a simple tourism assistant. I can help you find places to visit in Karnataka and what's nearby them.";

    if (lowerMessage.includes("best places") || lowerMessage.includes("visit")) {
      const [places] = await db.query("SELECT name FROM tourist_places LIMIT 5");
      reply = `Some great places to visit in Karnataka include: ${places.map(p => p.name).join(", ")}.`;
    } else if (lowerMessage.includes("hotel") || lowerMessage.includes("stay")) {
      const [hotels] = await db.query("SELECT name, location FROM hotels ORDER BY rating DESC LIMIT 3");
      reply = `Here are some highly-rated hotels: ${hotels.map(h => h.name + ' in ' + h.location).join(", ")}. Open any destination page to see hotels near it.`;
    } else if (lowerMessage.includes("food") || lowerMessage.includes("restaurant")) {
      const [restaurants] = await db.query("SELECT name, location FROM restaurants ORDER BY rating DESC LIMIT 3");
      reply = `You might like these restaurants: ${restaurants.map(r => r.name + ' in ' + r.location).join(", ")}. Open any destination page to see restaurants near it.`;
    }

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and email are required." });

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    let user;
    if (users.length === 0) {
      const [result] = await db.query("INSERT INTO users (name, email) VALUES (?, ?)", [name, email]);
      user = { id: result.insertId, name, email };
    } else {
      user = users[0];
    }
    res.json({ message: "Login successful", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

/* -----------------------------------------------------------
   Trip Planner
   - orders selected destinations by geographic proximity so
     the route makes sense (nearest-neighbour on lat/lng)
   - spreads them across the number of days requested
   - attaches the top-rated nearby hotel + restaurant per day
   - produces a transparent, itemised cost estimate
----------------------------------------------------------- */
function toRad(v) { return (v * Math.PI) / 180; }

function distanceKm(a, b) {
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function orderByProximity(places) {
  if (places.length <= 2) return places;
  const remaining = [...places];
  const route = [remaining.shift()];
  while (remaining.length) {
    const last = route[route.length - 1];
    let bestIdx = 0;
    let bestDist = Infinity;
    remaining.forEach((p, i) => {
      const d = distanceKm(last, p);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    route.push(remaining.splice(bestIdx, 1)[0]);
  }
  return route;
}

function avgPrice(range) {
  if (!range) return 0;
  const nums = String(range).match(/\d+/g);
  if (!nums) return 0;
  const arr = nums.map(Number);
  return arr.length > 1 ? (arr[0] + arr[1]) / 2 : arr[0];
}

app.post("/api/trip-plan", async (req, res) => {
  try {
    const { placeIds = [], days = 2, budget = 5000 } = req.body;
    if (!Array.isArray(placeIds) || placeIds.length === 0) {
      return res.status(400).json({ error: "Select at least one destination." });
    }

    const numDays = Math.max(1, Math.min(30, Number(days) || 1));
    const numBudget = Math.max(0, Number(budget) || 0);

    const [places] = await db.query("SELECT * FROM tourist_places WHERE id IN (?)", [placeIds]);
    if (places.length === 0) return res.status(404).json({ error: "No matching destinations found." });

    const ordered = orderByProximity(places);
    const perDay = Math.max(1, Math.ceil(ordered.length / numDays));
    const groups = [];
    for (let i = 0; i < ordered.length; i += perDay) groups.push(ordered.slice(i, i + perDay));
    while (groups.length < numDays) groups.push([]);

    const itinerary = [];
    const hotelCosts = [];
    const foodCosts = [];

    for (let d = 0; d < groups.length; d++) {
      const group = groups[d];
      const stops = [];
      let dayHotel = null;
      const dayRestaurants = [];

      for (const p of group) {
        const [hotels] = await db.query(
          "SELECT * FROM hotels WHERE destination_id = ? ORDER BY rating DESC LIMIT 1",
          [p.id]
        );
        const [restaurants] = await db.query(
          "SELECT * FROM restaurants WHERE destination_id = ? ORDER BY rating DESC LIMIT 1",
          [p.id]
        );
        const hotel = hotels[0] || null;
        const restaurant = restaurants[0] || null;

        if (hotel && (!dayHotel || hotel.rating > dayHotel.rating)) dayHotel = hotel;
        if (restaurant) dayRestaurants.push(restaurant);

        stops.push({
          place_id: p.id,
          name: p.name,
          district: p.district,
          category: p.category,
          activities: [
            `Explore ${p.name}`,
            "Photography & sightseeing",
            restaurant ? `Try local food at ${restaurant.name}` : null
          ].filter(Boolean),
          suggested_hotel: hotel ? { name: hotel.name, rating: hotel.rating, price_range: hotel.price_range } : null,
          suggested_restaurant: restaurant
            ? { name: restaurant.name, rating: restaurant.rating, price_range: restaurant.price_range }
            : null
        });
      }

      if (dayHotel) hotelCosts.push(avgPrice(dayHotel.price_range));
      dayRestaurants.slice(0, 2).forEach(r => foodCosts.push(avgPrice(r.price_range)));

      itinerary.push({
        day: d + 1,
        stops: stops.length
          ? stops
          : [
              {
                name: "Free day",
                district: "-",
                category: "Leisure",
                activities: ["Rest, local shopping, or revisit a favourite spot"],
                suggested_hotel: null,
                suggested_restaurant: null
              }
            ]
      });
    }

    const nights = Math.max(0, numDays - 1);
    const avgHotelNight = hotelCosts.length ? hotelCosts.reduce((a, b) => a + b, 0) / hotelCosts.length : 0;
    const avgFoodDay = foodCosts.length ? (foodCosts.reduce((a, b) => a + b, 0) / foodCosts.length) * 2 : 600;

    const hotelTotal = Math.round(avgHotelNight * nights);
    const foodTotal = Math.round(avgFoodDay * numDays);
    const miscTotal = Math.round((hotelTotal + foodTotal) * 0.15); // transport, entry fees, misc

    const estimatedCostPerPerson = hotelTotal + foodTotal + miscTotal;
    const diff = numBudget - estimatedCostPerPerson;
    const budgetNote =
      diff >= 0
        ? `Within budget, with about ₹${diff.toLocaleString()} to spare per person.`
        : `This plan runs about ₹${Math.abs(diff).toLocaleString()} over budget per person — try fewer days or destinations.`;

    res.json({
      days: numDays,
      budget: numBudget,
      itinerary,
      costBreakdown: { hotel: hotelTotal, food: foodTotal, misc: miscTotal },
      estimatedCostPerPerson,
      budgetNote,
      note: "Estimates are approximate, based on average hotel and restaurant price ranges for the selected destinations."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/emergency", (req, res) => {
  res.json([
    { name: "Police", number: "112" },
    { name: "Ambulance", number: "108" },
    { name: "Fire & Rescue", number: "101" },
    { name: "Tourism Helpline", number: "1363" }
  ]);
});

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Karunad Yatra running at http://localhost:${PORT}`);
});
