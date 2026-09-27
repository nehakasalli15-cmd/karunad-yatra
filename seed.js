const db = require('./db');

const placesData = [
  {name: "Bengaluru", dist: "Bengaluru", cat: "Heritage", lat: 12.9716, lng: 77.5946},
  {name: "Mysuru", dist: "Mysuru", cat: "Heritage", lat: 12.2958, lng: 76.6394},
  {name: "Coorg", dist: "Kodagu", cat: "Hill Station", lat: 12.3375, lng: 75.8069},
  {name: "Hampi", dist: "Vijayanagara", cat: "Heritage", lat: 15.3350, lng: 76.4600},
  {name: "Gokarna", dist: "Uttara Kannada", cat: "Beaches", lat: 14.5500, lng: 74.3188},
  {name: "Udupi", dist: "Udupi", cat: "Spiritual", lat: 13.3409, lng: 74.7421},
  {name: "Mangaluru", dist: "Dakshina Kannada", cat: "Beaches", lat: 12.9141, lng: 74.8560},
  {name: "Shivamogga", dist: "Shivamogga", cat: "Nature", lat: 13.9299, lng: 75.5681},
  {name: "Jog Falls", dist: "Shivamogga", cat: "Waterfalls", lat: 14.2295, lng: 74.8153},
  {name: "Kabini", dist: "Mysuru", cat: "Wildlife", lat: 11.9566, lng: 76.2625},
  {name: "Bandipur", dist: "Chamarajanagar", cat: "Wildlife", lat: 11.6669, lng: 76.6285},
  {name: "Nagarhole", dist: "Kodagu", cat: "Wildlife", lat: 12.0294, lng: 76.1558},
  {name: "Sakleshpur", dist: "Hassan", cat: "Hill Station", lat: 12.9723, lng: 75.7831},
  {name: "Dandeli", dist: "Uttara Kannada", cat: "Nature", lat: 15.2447, lng: 74.6212},
  {name: "Badami", dist: "Bagalkot", cat: "Heritage", lat: 15.9145, lng: 75.6791},
  {name: "Aihole", dist: "Bagalkot", cat: "Heritage", lat: 16.0184, lng: 75.8797},
  {name: "Pattadakal", dist: "Bagalkot", cat: "Heritage", lat: 15.9507, lng: 75.8154},
  {name: "Belur", dist: "Hassan", cat: "Heritage", lat: 13.1627, lng: 75.8601},
  {name: "Halebidu", dist: "Hassan", cat: "Heritage", lat: 13.2127, lng: 75.9935},
  {name: "Chitradurga", dist: "Chitradurga", cat: "Heritage", lat: 14.2263, lng: 76.4022},
  {name: "Murudeshwar", dist: "Uttara Kannada", cat: "Spiritual", lat: 14.0940, lng: 74.4849},
  {name: "Kudremukh", dist: "Chikkamagaluru", cat: "Hill Station", lat: 13.2383, lng: 75.2599},
  {name: "Nandi Hills", dist: "Chikkaballapur", cat: "Hill Station", lat: 13.3702, lng: 77.6835},
  {name: "BR Hills", dist: "Chamarajanagar", cat: "Wildlife", lat: 11.9902, lng: 77.1396},
  {name: "Agumbe", dist: "Shivamogga", cat: "Nature", lat: 13.5049, lng: 75.0934},
  {name: "Chikkamagaluru", dist: "Chikkamagaluru", cat: "Hill Station", lat: 13.3161, lng: 75.7720},
  {name: "Vijayapura", dist: "Vijayapura", cat: "Heritage", lat: 16.8302, lng: 75.7100},
  {name: "Bidar", dist: "Bidar", cat: "Heritage", lat: 17.9104, lng: 77.5199},
  {name: "Kalaburagi", dist: "Kalaburagi", cat: "Heritage", lat: 17.3297, lng: 76.8343},
  {name: "Karwar", dist: "Uttara Kannada", cat: "Beaches", lat: 14.8045, lng: 74.1321},
  {name: "Sringeri", dist: "Chikkamagaluru", cat: "Spiritual", lat: 13.4208, lng: 75.2547},
  {name: "Kollur", dist: "Udupi", cat: "Spiritual", lat: 13.8649, lng: 74.8105},
  {name: "Kemmangundi", dist: "Chikkamagaluru", cat: "Hill Station", lat: 13.5482, lng: 75.7592},
  {name: "Maravanthe", dist: "Udupi", cat: "Beaches", lat: 13.7146, lng: 74.6393},
  {name: "Yana", dist: "Uttara Kannada", cat: "Nature", lat: 14.5807, lng: 74.5621},
  {name: "Srirangapatna", dist: "Mandya", cat: "Heritage", lat: 12.4187, lng: 76.6946},
  {name: "Talakadu", dist: "Mysuru", cat: "Heritage", lat: 12.1931, lng: 77.0267},
  {name: "Somnathpur", dist: "Mysuru", cat: "Heritage", lat: 12.2740, lng: 76.8845},
  {name: "Shravanabelagola", dist: "Hassan", cat: "Spiritual", lat: 12.8590, lng: 76.4862},
  {name: "Shivanasamudra", dist: "Mandya", cat: "Waterfalls", lat: 12.3021, lng: 77.1690}
];

const hotelTypes = ["Resort", "Luxury Hotel", "Budget Hotel", "Homestay"];
const cuisines = ["South Indian", "North Indian", "Continental", "Seafood", "Udupi", "Kodava"];

async function seed() {
  console.log("Connecting to database...");
  await db.query("SET FOREIGN_KEY_CHECKS = 0;");
  await db.query("TRUNCATE TABLE crowd_status;");
  await db.query("TRUNCATE TABLE restaurants;");
  await db.query("TRUNCATE TABLE hotels;");
  await db.query("TRUNCATE TABLE tourist_places;");
  await db.query("SET FOREIGN_KEY_CHECKS = 1;");

  console.log("Inserting 40 places...");
  for (const place of placesData) {
    const [res] = await db.query(
      "INSERT INTO tourist_places (name, city, district, description, category, best_time, duration, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [place.name, place.name, place.dist, `A beautiful ${place.cat.toLowerCase()} destination in Karnataka. Famous for its culture, scenery, and welcoming atmosphere. Highly recommended for tourists.`, place.cat, "Oct-Mar", "2-3 Days", place.lat, place.lng]
    );
    const placeId = res.insertId;

    // Insert 8 hotels
    for (let i = 1; i <= 8; i++) {
      const type = hotelTypes[Math.floor(Math.random() * hotelTypes.length)];
      const rating = (3 + Math.random() * 2).toFixed(1);
      const price = (1000 + Math.floor(Math.random() * 9000)) + "-" + (11000 + Math.floor(Math.random() * 5000));
      await db.query(
        "INSERT INTO hotels (name, location, destination_id, price_range, rating, hotel_type, facilities, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [`${place.name} ${type} ${i}`, place.name, placeId, price, rating, type, "WiFi, Pool, Restaurant, Spa", place.lat + (Math.random()*0.02 - 0.01), place.lng + (Math.random()*0.02 - 0.01)]
      );
    }

    // Insert 7 restaurants
    for (let i = 1; i <= 7; i++) {
      const cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
      const rating = (3.5 + Math.random() * 1.5).toFixed(1);
      await db.query(
        "INSERT INTO restaurants (name, location, destination_id, cuisine, price_range, rating, famous_dishes, opening_hours, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [`${place.name} Eats ${i}`, place.name, placeId, cuisine, "300-800", rating, "Local Thali, Special Dosa", "8 AM - 10 PM", place.lat + (Math.random()*0.02 - 0.01), place.lng + (Math.random()*0.02 - 0.01)]
      );
    }

    // Crowd status
    const levels = ["Low", "Moderate", "High"];
    await db.query(
      "INSERT INTO crowd_status (destination_id, crowd_level, estimated_count) VALUES (?, ?, ?)",
      [placeId, levels[Math.floor(Math.random() * levels.length)], Math.floor(Math.random() * 5000)]
    );
  }

  console.log("Database seeded successfully with 40 places and their associated hotels and restaurants!");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
