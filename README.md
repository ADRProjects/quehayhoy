# QueHayHoy 🇨🇺

**QueHayHoy** is an ultra-low data web application tailored specifically for Cuba's internet infrastructure (ETECSA). It provides street-accurate informal exchange rates and crowdsourced power outage reporting without requiring a VPN, accounts, or logins.

## Features
- **El Fula / Divisas**: Real-time peer-to-peer informal exchange rates (USD cash, MLC, EUR) across Western, Central, and Eastern Cuba.
- **La Corriente**: Anonymous 1-click outage reports with a 25-report confirmation threshold, a lightweight CSS Grid schematic map, and Macro-Region filtering.
- **Cuban IP Geo-Lock**: Outage reporting is strictly restricted at the Cloudflare Edge to IP addresses originating from Cuba (`country === "CU"`), preventing international spam and tampering. Anyone globally can still view the map and currency rates.
- **Sub-30KB Footprint**: Pure HTML/CSS/Vanilla JS with zero external dependencies. Loads instantly on 2G/3G connections.
- **Embedded Favicon & OpenGraph**: Instant social preview generation on WhatsApp and Telegram.

## GitHub Pages Deployment
1. Create a repository named `quehayhoy` on your GitHub account.
2. Commit `index.html`, `data.json`, and `og-image.svg` to the `main` branch.
3. In GitHub, go to **Settings > Pages > Branch: `main` > Save**.
4. Your site will immediately be live at: `https://<your-username>.github.io/quehayhoy/`

## Backend Setup (Cloudflare Worker + D1)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages**.
2. Create a Worker and paste `worker.js`.
3. Under **Storage & Databases**, create a D1 database named `reports` and execute:
   ```sql
   CREATE TABLE reports (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       municipio TEXT NOT NULL,
       status TEXT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   CREATE INDEX idx_reports_time ON reports(created_at);
   ```
4. Bind the database to the worker with variable name `DB`.
5. Update `API_ENDPOINT` in `index.html` with your Worker URL.
