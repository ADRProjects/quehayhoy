# QueHayHoy 🇨🇺

**QueHayHoy** is an ultra-low data web application tailored specifically for Cuba's internet infrastructure (ETECSA). It provides street-accurate informal exchange rates and crowdsourced power outage reporting without requiring a VPN, accounts, or logins.

## Features
- **El Fula / Divisas**: Real-time peer-to-peer informal exchange rates (USD cash, MLC, EUR) across Western, Central, and Eastern Cuba.
- **La Corriente**: Anonymous 1-click outage reports with a 25-report confirmation threshold, a lightweight CSS Grid schematic map, and Macro-Region filtering.
- **Cuban IP Geo-Lock**: Outage reporting is strictly restricted at the Cloudflare Edge to IP addresses originating from Cuba (`country === "CU"`), preventing international spam and tampering. Anyone globally can still view the map and currency rates.
- **Sub-30KB Footprint**: Pure HTML/CSS/Vanilla JS with zero external dependencies. Loads instantly on 2G/3G connections.