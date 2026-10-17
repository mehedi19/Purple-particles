# 🌌 Purple Neon Wave Particle Globe

A highly interactive, WebGL-based visual experience built with **Three.js**. This project recreates a macro, depth-of-field perspective of a glowing, cosmic particle sphere. It features a sharp, structured grid of neon dots that responds to mouse interactions with a high-frequency shimmer and expansion effect.

![Preview](https://img.shields.io/badge/Three.js-WebGL-blueviolet) ![Preview](https://img.shields.io/badge/Vercel-Ready-black)

## ✨ Features

*   **Macro Perspective:** The camera is positioned extremely close to a massive 3D sphere, creating a "rolling wave" horizon effect.
*   **Simulated Depth of Field:** Uses a secondary layer of soft, additive-blended "bokeh" particles to fake a camera lens blur in the foreground and background.
*   **Neon Gradient:** A mathematically generated color map transitioning from deep purple, to bright magenta, to glowing white at the horizon edge.
*   **Interactive Hover:** Moving your mouse over the grid triggers a 5% expansion and a rapid, randomized jitter (shimmer effect) on all 37,500 particles.
*   **Drag to Rotate:** Built-in `OrbitControls` allow you to click and drag the view to explore the curve of the wave.

## 🛠️ Tech Stack

*   **Three.js** (v0.160.0) - For 3D rendering and particle physics.
*   **HTML5 / CSS3** - For structure and full-screen styling.
*   **Vanilla JavaScript** - For interaction logic and animation loops.
*   **Vercel** - For zero-configuration hosting.

## 🚀 Local Setup

Because this project uses ES Modules and Import Maps, you cannot just double-click the `index.html` file due to browser CORS policies. You need to serve it locally.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
