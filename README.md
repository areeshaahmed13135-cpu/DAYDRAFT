# 🌌 My Sandbox Day

> **The Perfect Day, Your Perfect Self.** A minimal, aesthetic vanilla web ecosystem designed to gameify personal evolution by tracking the exact alignment between your current actions and your absolute peak self.

Built around a unique dusk palette inspired by *Diurnal*, featuring a canvas-free **procedural sky** that shifts smoothly based on your real-world clock, a side-by-side behavioral planner, and an automated proximity tracking engine.

---

## ⚡ Core Engine Features

*   **The Alter Ego Blueprint:** Design an idealized identity. Construct a strict chronological template from 6:00 AM to 11:00 PM mapping specific habits to primary foundational pillars (**Wellness**, **Hobby**, **Social**, **Growth**, **Rest**).
*   **Tactile Canvas Engine:** Fully supports seamless **Drag-and-Drop** or intuitive **Tap-to-Assign** mechanics to rapidly plot, realign, or flush your ideal timeline configuration.
*   **The Proximity Engine:** End your day with a definitive **Vibe Check**. The app aggregates your completed blocks, runs exponential moving averages over your logs, and displays your proximity to your absolute best self as a real-time percentage.
*   **Passive Decay Metrics:** Features built-in streak protections and state-decay tracking. If you leave the app unlogged for more than 24 hours, your proximity metrics automatically decay, gamifying consistency.
*   **Zero Dependencies:** Crafted in semantic `HTML5`, standard architectural `CSS3`, and modern reactive `Vanilla JavaScript`. No build tools, packages, or compilers required.

---

## 🛠️ App Architecture

The system state is handled via a single, consolidated data footprint stored inside `localStorage` under the key `sandbox_day_v1`. 

### State Matrix Signature
The application maintains the following state vector shape:
```json
{
  "alterEgo": { "name": "Cozy Artist Me", "emoji": "🎨", "vibe": "Night Owl Dreamer" },
  "blueprint": [{ "hour": 8, "blockId": "meditate" }],
  "progress": { 
    "xp": { "wellness": 45, "hobby": 0, "social": 15, "growth": 0, "rest": 0 }, 
    "streak": 3, 
    "lastLogDate": "2026-08-29" 
  },
  "today": { "date": "2026-08-29", "completed": [8] },
  "journal": [{ "date": "2026-08-29", "pct": 85, "mood": "🤩", "note": "Aligned completely." }]
}
```

---

## 🚀 Quick Start

### Run Locally
Since the ecosystem runs completely free of external compilation requirements, you can run it instantly from your machine:

1. Clone or download the project files.
2. Open your terminal in the target directory and start a local server wrapper:
   ```bash
   # Using Python 3+
   python3 -m http.server 8080
   
   # Using NodeJS (alternative)
   npx serve .
   ```
3. Point your local web browser to `http://localhost:8080`.

---

## 🎨 Design Systems Language

*   **Typography:** The application binds `Fraunces` for elegant, presentation-level text flourishes and `Space Grotesk` for technical data tables and interface controls.
*   **Sky Matrix Transitions:** The procedural sky maps mathematical vector floats smoothly over 24 hours:
    *   `05:00 - 08:00` 🌅 Dawn Break Transitions
    *   `08:00 - 17:00` ☀️ High Performance Day Sunlight
    *   `17:00 - 20:00` 🌆 Golden Dusk Phase
    *   `20:00 - 05:00` 🌌 Void Space Deep Night Navigation
