# Implementation Plan for Zero-Gravity Sumo Game

This document provides a step-by-step guide for implementing the base version of the Zero-Gravity Sumo game using AI generation with Cursor. The focus is on rapid development with minimal investment, targeting a quick deployment to GitHub Pages for immediate playability. Each step is small, specific, and includes a test to ensure correct implementation. The plan prioritizes essential features for a functional, catchy base game that encourages instant play and long sessions, aligning with the goal of quick ROI through ads.

The tech stack is HTML/CSS/JS + Three.js + Pusher or Ably, ensuring a lightweight, browser-based game. This plan avoids advanced features (e.g., full bot AI tuning, audio) to focus on core mechanics and multiplayer syncing.

---

## Step 1: Set up the project structure
- Work in the existing directory named `ZeroGravitySumo`.
- Create subdirectories: `assets/`, `scripts/`, and `styles/`.
- Create an `index.html` file with basic HTML5 boilerplate (e.g., `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`).
- **Test:** Open `index.html` in a browser; it should load a blank page without errors in the console.

---

## Step 2: Integrate Three.js
- Add the Three.js library to `index.html` via CDN (e.g., `<script src="https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.min.js"></script>`).
- Create a `scripts/scene.js` file.
- In `scene.js`, set up a basic Three.js scene: add a `Scene`, a `PerspectiveCamera` (FOV 75, near 0.1, far 1000), and a `WebGLRenderer`.
- Add a simple cube (`BoxGeometry`, `MeshBasicMaterial`) to the scene at position (0, 0, 0).
- Render the scene in a loop and append the renderer's DOM element to the `<body>`.
- **Test:** Open `index.html`; a colored cube should be visible and rendered correctly.

---

## Step 3: Implement the game arena
- In `scene.js`, create a spherical safe zone using `SphereGeometry` (radius 50) and `MeshBasicMaterial` (wireframe or transparent, e.g., `opacity: 0.3`).
- Position the safe zone at the scene's center (0, 0, 0).
- Add the safe zone to the scene.
- **Test:** Reload the page; a wireframe or transparent sphere (radius 50) should appear at the center.

---

## Step 4: Create the player's spaceship
- In `scripts/scene.js`, create a simple spaceship using `ConeGeometry` (radius 1, height 2) and `MeshBasicMaterial` (e.g., green color).
- Position the spaceship randomly within the safe zone (e.g., x, y, z between -20 and 20).
- Add keyboard controls: WASD or arrow keys to rotate (left, right, up, down).
- Implement continuous forward movement at base speed (e.g., 2 units/second).
- Add Thrust Boost with Space key (4x speed for 2 seconds, 10-second cooldown).
- Add the spaceship to the scene.
- **Test:** Reload the page; a green cone should appear, move continuously forward, rotate with keys, and boost with Space.

---

## Step 5: Implement zero-gravity physics
- Create a `scripts/physics.js` file.
- In `physics.js`, implement continuous movement:
  - Base velocity of 2 units/second in ship's facing direction
  - Thrust boost increases velocity to 8 units/second temporarily
  - Apply 0.99 damping factor to lateral velocities only (maintain forward speed)
- Use a fixed time step (16ms) to update the spaceship's position and velocity in the render loop.
- Link this logic to `scene.js` for the player's spaceship.
- **Test:** Ship should move continuously forward and respond to direction changes and boost.

---

## Step 6: Add collision detection
- In `physics.js`, implement sphere collision detection: treat spaceships as spheres (radius 1.5 units) and check for overlaps using distance between positions.
- On collision, calculate new velocities using conservation of momentum (assume equal mass for simplicity).
- Add a second spaceship (e.g., a duplicate of the player's) at a different position for testing.
- **Test:** Move the player's spaceship into the second one; they should bounce off each other realistically.

---

## Step 7: Manage the safe zone boundaries
- In `physics.js`, check each spaceship's distance from (0, 0, 0) every frame.
- If distance exceeds 50 units, remove the spaceship from the scene.
- For now, don't respawn ships—just remove them.
- **Test:** Thrust the spaceship outside the sphere; it should disappear when beyond 50 units.

---

## Step 8: Implement the game loop
- In `scene.js`, create a game loop using `requestAnimationFrame`.
- In the loop, update spaceship positions (via `physics.js`), process keyboard inputs, and check boundaries.
- Ensure the loop runs at a consistent 60 FPS (cap updates with the 16ms time step).
- **Test:** Reload the page; the spaceship should move and respond to controls smoothly without stuttering.

---

## Step 9: Add AI bots
- Create a `scripts/bots.js` file.
- Define a bot class with a finite state machine: states 'stay_center' (thrust toward 0, 0, 0), 'avoid' (thrust away from the nearest ship), and 'attack' (thrust toward a random ship).
- Add basic heuristics: switch to 'avoid' if another ship is within 5 units, 'attack' with 20% chance per second, else 'stay_center'.
- Instantiate one bot with a red spaceship model and add it to the scene.
- **Test:** Reload; the bot should move toward the center, avoid the player if close, or occasionally chase.

---

## Step 10: Integrate real-time communication
- Create a `scripts/network.js` file.
- Add Pusher or Ably via CDN in `index.html` (e.g., `<script src="https://js.pusher.com/8.2/pusher.min.js"></script>`).
- In `network.js`, initialize Pusher/Ably with a public key and subscribe to a channel (e.g., `zero-gravity-sumo`).
- Send the player's position and velocity (e.g., `{id, x, y, z, vx, vy, vz}`) every 100ms.
- Receive updates and apply them to other ships (add a second player ship for testing).
- **Test:** Open two browser tabs; moving one player should update the other tab's ship position.

---

## Step 11: Implement the user interface
- Create a `styles/ui.css` file and link it in `index.html`.
- In `index.html`, add a `<div>` overlay with:
  - Score ("Wins: 0")
  - Boost cooldown bar (100x10px, bottom-center)
  - 2-minute timer (counting down from 120 seconds)
  - Mobile controls: direction joystick (bottom-left) and boost button (bottom-right)
- In `scripts/ui.js`, update the timer every second and increment wins when a ship is eliminated.
- Use CSS media queries for desktop/mobile responsiveness.
- **Test:** Reload; the UI should display correctly, controls should work on both desktop/mobile, timer should count down, and wins should increase on eliminations.

---

## Step 12: Optimize performance
- In `scene.js`, limit scene objects to 10 ships max (player + bots).
- In `physics.js`, use an array to track ships and avoid recalculating distances unnecessarily.
- Test in Chrome and Firefox on desktop/mobile; adjust if FPS drops below 60.
- **Test:** Play for 1 minute; the game should run smoothly without noticeable lag.

---

## Step 13: Manage assets
- Create an `assets.js` file.
- Use Three.js `GLTFLoader` (add via CDN) to load a simple spaceship model asynchronously from `assets/ship.glb` (use a placeholder if unavailable).
- Cache the loaded model and reuse it for all ships.
- Fallback to `ConeGeometry` if loading fails.
- **Test:** Reload; the game should start quickly, and ships should use the loaded model or fallback shape.

---

## Deployment
- Commit all files to the Git repository.
- Push to a GitHub repository and enable GitHub Pages in the settings (use the `main` branch).
- **Test:** Visit the GitHub Pages URL; the game should load and be playable instantly.

---
