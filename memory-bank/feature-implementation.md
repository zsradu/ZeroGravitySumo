Feature Implementation Guide
============================

This document provides step-by-step instructions for implementing new features in _Zero-Gravity Sumo_. Each step is small, specific, and includes a test to ensure proper functionality. Follow these steps carefully to enhance the game with mobile support, a pre-game menu, visual effects, and advertisements.

### Step 1: Circular Bot Movement

*   **Instruction**: Program bots to move in a circular path around the center of the arena, starting at an initial radius (Rinitial = 40 units), with a constant speed of 4.0 units per second.
    
*   **Test**: Start the game and observe a bot; it should trace a circular path at radius 40 around the center.
    

### Step 2: Periodic Stopping

*   **Instruction**: Make bots stop moving every 3 seconds for a 3-second duration, then resume their circular path.
    
*   **Test**: Watch a bot; it should move for 3 seconds, stop for 3 seconds, and repeat consistently.
    

### Step 3: Maintain Radius After Push

*   **Instruction**: If a bot is pushed to a new radius by the player, update its circular path to maintain this new radius. Bots must not adjust their radius on their own.
    
*   **Test**: Push a bot to a different radius (e.g., 50 units) and verify it continues circling at that new radius.
    

### Step 4: Level Progression

*   **Instruction**: Create a level system starting at level 1. Advance to the next level when the player wins.
    
*   **Test**: Win level 1 and confirm the game progresses to level 2.
    

### Step 5: Increase Bot Speed

*   **Instruction**: Increase bot speed by 0.2 units per second per level (e.g., level 1: 4.0, level 2: 4.2).
    
*   **Test**: Reach level 2 and ensure bots move noticeably faster than in level 1.
    

### Step 6: Adjust Movement and Stop Durations

*   **Instruction**: Adjust durations per level:
    
    *   Movement duration increases by 0.5 seconds (e.g., level 1: 3s, level 2: 3.5s).
        
    *   Stop duration decreases by 0.5 seconds (e.g., level 1: 3s, level 2: 2.5s).
        
*   **Test**: At level 2, confirm bots move for 3.5 seconds and stop for 2.5 seconds.
    

### Step 7: Reset to Level 1

*   **Instruction**: On game start or restart, reset to level 1 with default settings (speed 4.0, movement 3s, stop 3s).
    
*   **Test**: Restart the game and verify bots follow level 1 behavior.
    

### Step 8: Display Level on HUD

*   **Instruction**: Show the current level on the HUD (e.g., "Level: 1").
    
*   **Test**: Advance to level 2 and check that the HUD updates to "Level: 2".
    

### Step 9: Visual Effects
-------------------------

**Objective**: Improve visual feedback with a particle explosion for eliminated ships and thrust effects for normal and boost modes.

*   When a ship exits the arena (loses), trigger a particle explosion effect at its last position.
    
*   When normal thrust is active, show a small fire or booster effect at the back of the spaceship.
    
*   When boost is used, display a larger, more intense thrust effect (e.g., bigger flames or brighter glow) to reflect the power increase.