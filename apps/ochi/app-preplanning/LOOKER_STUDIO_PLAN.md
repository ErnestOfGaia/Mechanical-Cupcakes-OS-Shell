# OCHI Task 2: Looker Studio Preplanning Guide

This document outlines the configuration required for the Looker Studio Desktop Dashboard, ensuring it aligns with the "Data Five" schema and the "Loud AI" logic.

## 📊 1. Data Source Setup
- **Connector**: BigQuery (or Google Sheets if using the pilot warehouse).
- **Primary Date Dimension**: `week_start_date`.
- **Metrics**: 
    - `gas_index_or`
    - `hwy6_condition_score`
    - `tt_pulse_index`
    - `search_interest_volume`
    - `master_multiplier`

## 🧪 2. Calculated Fields (Looker Studio)
To translate raw numbers into "Loud AI" labels, create the following fields:

| Field Name | Formula |
| :--- | :--- |
| **Hwy 6 Label** | `CASE WHEN hwy6_condition_score = 0 THEN "RESTRICTED" WHEN hwy6_condition_score = 1 THEN "ADVISORY" ELSE "OPEN" END` |
| **Volume Sentiment** | `CASE WHEN master_multiplier > 0.7 THEN "HIGH" WHEN master_multiplier >= 0.4 THEN "MODERATE" ELSE "LOW" END` |
| **Multiplier (%)** | `master_multiplier * 100` |

## 🎨 3. Color-Coding Logic (Conditional Formatting)
Apply these rules to the **Master Multiplier Scorecard** and the **Volume Sentiment** field:

- **🟢 GREEN (High Volume)**: `master_multiplier > 0.70`
    - *Logic*: All arterials fluid, search intent high.
- **🟡 YELLOW (Moderate/Advisory)**: `master_multiplier >= 0.40 AND master_multiplier <= 0.70`
    - *Logic*: Weather/Traffic advisory or rising fuel pressure.
- **🔴 RED (Low Volume/Restricted)**: `master_multiplier < 0.40`
    - *Logic*: Hwy 6 closure or severe economic friction.

## 📐 4. Desktop Layout Strategy
- **Header**: OCHI Logo (Left), "Pacific City Pilot" (Subheader), Date Range Picker (Right).
- **Hero Section**: Large Center Scorecard for **Master Multiplier** with a "Volume Sentiment" label.
- **The Data Five Row**: Five equal-width scorecards with sparklines showing the 4-week trend.
- **Logic Annotation Panel**: A dedicated section for "Loud AI" annotations. 
    - *Pro Tip*: Use a "Table" with a single cell showing the latest weekly insight from a `logic_note` field in your data.

## 🚀 5. "Loud AI" Integration
Every scorecard should include a small "i" icon or a sub-label that explains the metric's lead-time.
- *Example*: Under Hwy 6 Status, add: *"90-minute lead time on regional arrivals."*
