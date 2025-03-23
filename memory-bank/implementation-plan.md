# Implementation Plan for Zero-Gravity Sumo Game

This document provides a step-by-step guide for implementing the base version of the Zero-Gravity Sumo game using AI generation with Cursor. The focus is on rapid development with minimal investment, targeting a quick deployment to GitHub Pages for immediate playability. Each step is small, specific, and includes a test to ensure correct implementation. The plan prioritizes essential features for a functional, catchy base game that encourages instant play and long sessions, aligning with the goal of quick ROI through ads.

The tech stack is HTML/CSS/JS + Three.js, ensuring a lightweight, browser-based game. This plan avoids advanced features (e.g., full bot AI tuning, audio) to focus on core mechanics and multiplayer syncing.

## Technical Specifications

### Physics Parameters
- **Thrust Force**:
  - Normal Thrust: 0.5 units/s² in ship's facing direction
  - Boost Thrust: 2.0 units/s² for 2-second duration
- **Collision Response**:
  - Equal mass (1.0 unit) for all ships
  - Velocity exchange formula:
    ```
    v1new = v1 - ((v1 - v2) * (p1 - p2)) / mod(p1 - p2) ^ 2) * (p1 - p2)
    v2new = v2 - ((v1 - v2) * (p1 - p2)) / mod(p1 - p2) ^ 2) * (p1 - p2)
    ```
- **Damping**: 0.99 factor applied per frame

### Bot AI Parameters
- **State Changes**: Evaluate every 1 second
- **Thresholds**:
  - Avoid: Within 5 units of another ship
  - Attack: 20% chance per second if no ships within 5 units
  - Stay Center: Default state
- **Boost**: 5-second duration, 10-second cooldown (same as player)

### UI/UX Specifications
- **HUD Elements**:
  - Score: Top-left, 20px margin, Arial 24px bold white
  - Boost Bar: Bottom-center, 100x10px, green/red
  - Timer: Top-right, 20px margin, Arial 24px bold white
- **Colors**:
  - Primary: #00FF00 (green)
  - Secondary: #FF0000 (red)
  - HUD Background: rgba(0,0,0,0.2)
- **Transitions**: 0.5s fade animations

### Performance Requirements
- Minimum 30 FPS on mobile
- Maximum 5s initial load time
- Optimizations:
  - 50 unit render distance
  - Basic lighting shaders
  - LOD beyond 30 units

### Asset Specifications
- Ship Model: GLTF (.glb), <50KB
- LOD Levels:
  - High: <30 units from camera
  - Low: >30 units from camera
- Fallback: ConeGeometry with solid colors

### Camera Parameters
- Follow Distance: 10 units behind
- Height Offset: 5 units above
- Smoothing: 
  - Position: 0.1 lerp factor
  - Rotation: 0.05 lerp factor
- Collision Shake: 0.5 units amplitude, 0.3s duration

---

### **Step 1: Set up the project structure**

* Create subdirectories: assets/, scripts/, and styles/.  
* Create an index.html file with basic HTML5 boilerplate (e.g., \<\!DOCTYPE html\>, \<html\>, \<head\>, \<body\>).  
* **Test:** Open index.html in a browser; it should load a blank page without errors in the console.

---

### **Step 2: Integrate Three.js**

* Add the Three.js library to index.html.  
* Create a scripts/scene.js file.  
* In scene.js, set up a basic Three.js scene: add a Scene, a PerspectiveCamera (FOV 75, near 0.1, far 1000), and a WebGLRenderer.  
* Add a simple cube (BoxGeometry, MeshBasicMaterial) to the scene at position (0, 0, 0).  
* Render the scene in a loop and append the renderer's DOM element to the \<body\>.  
* **Test:** Open index.html; a colored cube should be visible and rendered correctly.

---

### **Step 3: Implement the game arena**

* In scene.js, create a spherical safe zone using SphereGeometry (radius 50) and MeshBasicMaterial (wireframe or transparent, opacity: 0.3).  
* Position the safe zone at the scene's center (0, 0, 0).  
* Add the safe zone to the scene.  
* **Test:** Reload the page; a wireframe or transparent sphere (radius 50) should appear at the center.

---

### **Step 4: Create the player's spaceship**

* In scripts/scene.js, create a simple spaceship using ConeGeometry (radius 1, height 2) and MeshBasicMaterial (green color #00FF00).  
* Position the spaceship randomly within the safe zone (x, y, z between -20 and 20).  
* Add keyboard controls: WASD or arrow keys to rotate (left, right, up, down) and Space to thrust forward.  
* Add the spaceship to the scene.  
* **Test:** Reload the page; a green cone should appear, and pressing keys should rotate it or move it forward.

---

### **Step 5: Implement zero-gravity physics**

* Create a scripts/physics.js file.  
* Implement thrust mechanics:
  * Normal thrust: 0.5 units/s² force
  * Boost thrust: 2.0 units/s² force for 2s
  * Apply 0.99 damping factor per frame
* Use a fixed time step (16ms) to update positions and velocities
* Implement collision detection with exact velocity exchange formula
* Link this logic to scene.js for the player's spaceship
* **Test:** Thrust should move the ship smoothly with proper damping, and collisions should result in realistic bounces

---

### **Step 6: Add collision detection**

* In physics.js, implement sphere collision detection (radius 1.5 units)
* Apply the velocity exchange formula for collisions:
  ```
  v1new = v1 - (((v1 - v2) * (p1 - p2)) / mod(p1 - p2) ^ 2) * (p1 - p2)
  v2new = v2 - (((v1 - v2) * (p1 - p2)) / mod(p1 - p2) ^ 2) * (p1 - p2)
  ```
* Add camera shake on collision (0.5 units amplitude, 0.3s duration)
* **Test:** Ships should bounce realistically with proper visual feedback

---

### **Step 7: Manage the safe zone boundaries**

* In physics.js, check each spaceship's distance from (0, 0, 0) every frame
* If distance exceeds 50 units, remove the spaceship from the scene
* For now, don't respawn ships—just remove them
* **Test:** Thrust the spaceship outside the sphere; it should disappear when beyond 50 units

---

### **Step 8: Implement the game loop**

* In scene.js, create a game loop using requestAnimationFrame
* Cap updates at 60 FPS (16ms time step)
* Implement camera following (10 units behind, 5 units above)
* Apply camera smoothing (0.1 position lerp, 0.05 rotation lerp)
* **Test:** Game should maintain 60 FPS with smooth camera movement

---

### **Step 9: Add AI bots**

* Create a scripts/bots.js file
* Implement bot state machine with exact parameters:
  * Avoid state: Activate within 5 units
  * Attack state: 20% chance per second
  * Stay center: Default state
* Update states every 1 second
* Create 5-7 red bots (#FF0000) and add them to the scene
* **Test:** Bots should move according to their states with proper timing

---

### **Step 10: Simulate dynamic bot joining and leaving**

* In bots.js, implement a timer for random bot changes every 30 seconds
* Maintain 6-8 ships in the arena
* Ensure proper LOD switching at 30 units from camera
* **Test:** Bot count should fluctuate naturally while maintaining performance

---

### **Step 11: Implement the round timer**

* In scripts/game.js, create a 2-minute countdown timer
* Display timer in top-right (Arial 24px bold white)
* Add boost cooldown UI (100x10px bar, bottom-center)
* **Test:** UI elements should be clearly visible and update correctly

---

### **Step 12: Handle win/lose conditions**

* In game.js, check if the player is the last ship in the safe zone (win) or if they survive until the timer runs out (win).
* If the player is eliminated (outside the safe zone), display a “You Lost” message.
* If the player wins, increment the win counter and display a “You Won” message.
* Regardless of the outcome, 3 seconds after the game is over, display a green button that says "Play again". On click of the button, another match should start from the beginning.
* Add 0.5s fade transitions for state changes
* **Test:** Game states should transition smoothly with proper UI feedback

---

### **Step 13: Manage assets**

* Create ship model in GLTF format (<50KB)
* Create an assets.js file.
* Use Three.js GLTFLoader (add via CDN) to load the ship model.
* Cache the loaded model and reuse it for all ships.
* Set up fallback to ConeGeometry
* **Test:** Assets should load within 5 seconds with proper fallbacks

