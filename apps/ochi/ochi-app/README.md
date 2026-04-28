# OCHI Dashboard (Pacific City Pilot)

Oregon Coastal Hospitality Intelligence (OCHI) is a predictive forecasting tool for hospitality stakeholders.

## 🏛 Project DNA
- **Identity**: Clean, Utilitarian, "Technical Chic".
- **Zero-Branding Policy**: No avian metaphors, no "Hoot" mascots.
- **Goal**: Correlation of "Gatekeeper" metrics (Hwy 6, Gas, Search, TLT) into a single **Master Multiplier**.

## 🏗 Build Phase Instructions
1. **Scaffolding**: Use Next.js 15+ and Tailwind 4. Keep the UI mobile-first with large touch targets.
2. **Data Pipeline**: 
   - Use **Google Jules** (Python) for automated scraping of ODOT (Hwy 6) and AAA (Gas Prices).
   - Sync data to **Google Sheets/BigQuery** as the central source of truth.
   - Implement "Loud AI" logic annotations to explain the Master Multiplier's derivation.
3. **MCOS Shell Integration**:
   - The app must own its canvas (Zero-Branding) but respect the **MCOS Top Bar** for navigation.
   - The Shell is injected via `layout.tsx` (see MCOS Shell implementation plan).

## 📊 The "Data Five" Pulse
1. **Hwy 6 Status**: Primary gatekeeper. Open/Closed/Restricted.
2. **Gas Price Index**: Regional fuel trends.
3. **Search Interest**: Google Trends for "Cape Kiwanda" / "Pacific City".
4. **TLT Pulse**: Historical Lodging Tax patterns.
5. **OCHI Forecast**: Weighted algorithm output (0.0 - 1.0).

## 🚀 Deployment & Visualization
- **Dashboard Visualization**: See the [Looker Studio Preplanning Guide](../app-preplanning/LOOKER_STUDIO_PLAN.md) for Task 2 setup.
- **Environment**: Dockerized Node environment.
- **Domain**: `ochi.mechanicalcupcakes.fun`
