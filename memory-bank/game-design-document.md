# **Zero-Gravity Sumo Game Design Document**

## **1\. Game Overview**

### **Concept Summary**

*Zero-Gravity Sumo* is a fast-paced, single-player game set in a zero-gravity space arena. The player controls a spaceship, aiming to push AI-controlled bots out of a central "safe" zone while avoiding elimination themselves. The game offers full 3D movement, a third-person camera, and a dynamic environment where bots can join or leave at any time, even mid-round. It’s designed to be simple, engaging, and replayable, with minimalistic 3D visuals and intuitive controls, simulating a multiplayer feel through bot interactions.

### **Target Audience**

* Casual gamers seeking a quick, fun experience.  
* Players of all ages and skill levels, from beginners to those who enjoy light challenges.

  ### **Platform**

* Web-based game, playable in browsers on desktop and mobile devices.  
* Hosted as a static website (e.g., on GitHub Pages) requiring no real-time communication services since multiplayer is simulated with bots.  
  ---

  ## **2\. Gameplay Mechanics**

  ### **Player Controls**

* **Desktop**: Use arrow keys or WASD to:  
  * Rotate left, right, up, or down.  
  * Continuously Thrust forward (move in the direction the spaceship faces).  
* **Mobile**: On-screen touch controls:  
  * A joystick for movement and rotation.  
  * A button for thrusting forward.  
* **Thrust Boost**: A short-term speed boost with a cooldown (e.g., 5-second boost, 10-second cooldown) for quick maneuvers.

  ### **Spaceship Movement and Physics**

* Spaceships operate in a zero-gravity environment:  
  * They continue moving in their current direction unless thrust is applied.  
  * Thrusting pushes the ship in the direction it’s facing.  
* Collisions between spaceships:  
  * Ships bounce off each other based on speed and direction.  
  * Faster collisions result in larger impacts.

  ### **Camera**

* Third-person perspective:  
  * The camera follows behind the player’s spaceship, adjusting dynamically to its orientation and movement.  
  * Provides an immersive view of the arena and surrounding ships.

  ### **Arena and Boundaries**

* The arena is a 3D space with a central "safe" zone:  
  * Visualized as a sphere or circle with a radius of about 50 units (adjustable).  
  * Boundary is clearly visible (e.g., a glowing edge).  
* Rules for the safe zone:  
  * Players or bots outside the safe zone are eliminated.  
  * Elimination removes the ship from the round, but new bots can join immediately.

  ### **Multiplayer and Lobby System**

* **Fake Multiplayer**:  
  * Only one real player per lobby; all other ships are AI bots.  
  * Bots simulate a multiplayer environment, maintaining 6-8 ships in the arena.  
  * No real-time communication with other players; all interactions are with bots.  
* **Dynamic Lobby**:  
  * Bots join and leave randomly to keep the arena lively.

  ### **AI Bot Behavior**

* Bots use a simple state machine to mimic human behavior:  
  * Stay near the center of the safe zone.  
  * Avoid collisions by pushing away from nearby ships.  
  * Occasionally target and ram other ships with some randomness for unpredictability.  
* **Competitive Design**:  
  * Bots are challenging but not overly dominant, allowing skilled players to outmaneuver them.  
* **Dynamic Joining/Exiting**:  
  * Bots enter or exit randomly (e.g., 1-2 changes per minute) to simulate a living arena without disrupting gameplay.

  ### **Game Flow and Rounds**

* The game runs in continuous rounds with no strict start or end:  
  * Players and bots can be eliminated if outside the safe zone too long.  
  * New bots can spawn at any time to keep the action going.  
  * New players join an ongoing match (within the first 20 seconds of a round); subsequent rounds start with a 2-minute timer.  
* Focus is on a lively, ongoing battle where users can jump in and out freely.

  ### **Win/Lose Conditions**

* **Win**: Be the last ship remaining in the safe zone, or survive until the end of the round (two minutes).  
* **Lose**: Be pushed out of the safe zone and eliminated.  
* Elimination of the player ends the game. On the player’s side, there is at any point only one match being simulated.

  ### **Scoring and Session Progress**

* Tracks progress within a single browser session:  
  * Counts wins or matches played (e.g., “Wins: 3”).  
  * Resets on page reload; no persistent data.

  ---

  ## **3\. User Interface**

  ### **Main Menu**

* Minimalistic start screen:  
  * Game title: *Zero-Gravity Sumo*.  
  * “Play” button to join the game instantly.  
* Optional: Settings for sound or control sensitivity.

  ### **In-Game HUD**

* Displays key information:  
  * Current score (e.g., “Wins: 3”).  
  * Warning when nearing the safe zone boundary (e.g., flashing alert).  
  * Thrust boost cooldown indicator.  
  * Timer until the end of the round

  ### **Visual Feedback**

* Enhances clarity and engagement:  
  * Safe zone highlighted with a glowing effect.  
  * Small explosion or particle effect on ship elimination.  
  * Screen/spaceship flashes when in danger (e.g., near the edge).

  ---

  ## **4\. Graphics and Audio**

  ### **Art Style**

* Minimalistic 3D visuals:  
  * Spaceships: Simple but distinguishable shapes (basic spaceship model) with solid colors or light textures.  
  * Background: Starry space scene, lightweight and uncluttered.  
* Prioritizes clarity and performance.

  ### **Sound Effects (Optional)**

* Subtle audio for immersion:  
  * “Whoosh” or hum for thrusting.  
  * “Clank” or “boom” for collisions.  
  * Explosion or fade-out sound on elimination.

  ### **Music (Optional)**

* Looping ambient space track:  
  * Subtle, non-distracting mood-setter.

  ---

  ## **5\. Technical Guidelines**

  ### **General Requirements**

* Runs entirely in the browser, client-side:  
  * No server-side components or real-time syncing.  
  * Progress and logic handled locally.  
* No persistent data or accounts; resets on reload.

  ### **Performance Goals**

* Smooth performance on average hardware:  
  * Desktop browsers (e.g., Chrome, Firefox).  
  * Mobile browsers (e.g., Safari, Chrome).  
* Lightweight visuals and mechanics for quick loading.

  ### **Deployment**

* Static website, hostable on GitHub Pages.  
* Works out of the box in a browser with minimal setup.


