# Karunad Yatra — Karnataka Tourism App

## What changed from your original files
1. **Removed the standalone Hotels and Restaurants pages/nav links.** Hotels and
   restaurants now only ever appear *inside* a destination's own page
   (`place.html`), under "Hotels near this destination" / "Restaurants near
   this destination" — exactly like you asked.
2. **Trip Planner rebuilt properly.** `/api/trip-plan` now:
   - orders your selected destinations by geographic proximity (nearest-neighbour
     on lat/lng) so the route makes sense instead of using whatever order you
     clicked them in,
   - spreads them across the number of days you asked for,
   - attaches the top-rated nearby hotel and restaurant to each day,
   - returns an itemised cost estimate (hotel / food / transport & misc) and
     tells you plainly whether you're within or over budget.
   The planner page (`planner.html`) was rewritten to render this richer
   response.
3. **Backend cleaned up.** Removed the now-unused `/api/hotels`,
   `/api/hotels/:id`, `/api/restaurants`, `/api/restaurants/:id` list/detail
   endpoints (nothing calls them anymore) and kept only the destination-scoped
   ones that `place.html` actually uses. `/api/search` no longer returns hotel/
   restaurant matches since there's nowhere left to show them separately.
4. **Static files reorganised** into `public/css/style.css` and
   `public/js/common.js` (previously loose alongside the HTML) for a more
   standard project layout.
5. `db.js` and `schema.sql` are unchanged — your existing database will work
   as-is.

## Project structure
```
karunad-yatra/
├── server.js          # Express app + all API routes
├── db.js              # MySQL connection pool
├── schema.sql          # Tables + sample data
├── .env.example        # Copy to .env and fill in your DB credentials
└── public/
    ├── index.html
    ├── destinations.html
    ├── place.html       # destination detail + nearby hotels/restaurants
    ├── planner.html      # trip planner
    ├── css/style.css
    └── js/common.js
```

## Running it
You said you already have `node_modules`/`package.json` set up — just drop
`server.js`, `db.js` and the `public/` folder into your existing project
folder (replacing the old versions), then:

```
cp .env.example .env      # fill in your MySQL credentials
mysql -u root -p < schema.sql
node server.js
```

Visit `http://localhost:5000`.

## Still worth doing later
- The chatbot and crowd indicator are simple placeholders — fine for a demo,
  but swap in a real NLP/weather-style data source if this needs to be more
  than a college project.
- No authentication/session beyond a name+email "login" — add real auth if
  you ever put this somewhere public.
