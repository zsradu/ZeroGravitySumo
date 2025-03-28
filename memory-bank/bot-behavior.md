### Core Idea

The bots should act like they’re orbiting the arena’s center, always trying to move sideways relative to their position from the center. When the player bumps into them, they get knocked off course (because of the game’s physics), but then they adjust and start circling again from wherever they end up. Here’s how that works step by step.

### How Bots Move: The Logic Explained

#### 1\. Circling the Center (Default Behavior)

*   **What’s Happening**: Imagine each bot is like a car driving around a roundabout. It wants to keep going sideways (tangentially) around the center of the arena, not toward or away from it.
    
*   **How It Works**:
    
    *   Picture the center as a point (like the middle of the arena).
        
    *   At any moment, the bot knows where it is compared to the center (e.g., “I’m 40 units to the right of the center”).
        
    *   To circle, it tries to move perpendicular to the line connecting it to the center. For example, if it’s directly right of the center, it moves up (or down) to trace a circle.
        
    *   The bot has a set speed (say, 4 units per second) and always aims to move at that speed in this sideways direction.
        

#### 2\. Periodic Stopping

*   **What’s Happening**: Every few seconds, the bot pauses its movement, sits still, then starts circling again.
    
*   **How It Works**:
    
    *   The bot has a “movement timer” (e.g., 3 seconds at first).
        
    *   While the timer runs, it keeps trying to move sideways as described above.
        
    *   When the timer hits zero, it switches to a “stop phase” (e.g., 3 seconds).
        
    *   During the stop phase, it doesn’t try to move—it just floats there.
        
    *   Once the stop phase ends, it restarts the movement timer and resumes circling from its current spot.
        

#### 3\. Getting Pushed by the Player

*   **What’s Happening**: When the player crashes into a bot, it gets knocked away (thanks to the game’s physics), but it doesn’t give up—it picks up where it lands and keeps circling.
    
*   **How It Works**:
    
    *   The collision happens naturally (your game’s physics engine pushes the bot based on the impact).
        
    *   After the push, the bot might be farther from or closer to the center, and its direction might be off.
        
    *   The bot doesn’t care about its old path. Instead, it looks at its new position and says, “Okay, I’ll start circling the center from here.”
        
    *   It figures out the new sideways direction based on where it is now and starts moving that way again at its normal speed.
        

#### 4\. Smooth Adjustments

*   **What’s Happening**: After a collision (or when starting to move), the bot doesn’t instantly snap to the perfect sideways direction—it adjusts gradually so it looks natural.
    
*   **How It Works**:
    
    *   Each moment, the bot checks its current movement direction (its velocity) and compares it to the ideal sideways direction.
        
    *   It nudges itself toward that ideal direction a little bit at a time, so it smoothly curves back into a circular path.
        
    *   For example, if it’s flying outward after a hit, it slowly turns its movement sideways until it’s circling again.
        

### Putting It Together: Step-by-Step

Here’s what happens in one “update” for a bot (like one frame in the game):

1.  **Check the Situation**:
    
    *   Is the bot in “moving” mode or “stopped” mode? (Based on its timers.)
        
2.  **If Moving**:
    
    *   Figure out the line from the center to the bot’s current position.
        
    *   Pick the sideways direction (perpendicular to that line).
        
    *   Decide the bot wants to move in that direction at its set speed (e.g., 4 units/second).
        
    *   Gently adjust its current movement to match this direction (not all at once—think of it like steering a ship).
        
    *   Count down the movement timer. If it hits zero, switch to “stopped” mode and start a stop timer.
        
3.  **If Stopped**:
    
    *   The bot wants to stay still, so it tries to slow down to zero movement.
        
    *   Count down the stop timer. If it hits zero, switch back to “moving” mode and reset the movement timer.
        
4.  **Handle Collisions**:
    
    *   If the player hits the bot, the physics engine does its thing—moves the bot based on the bump.
        
    *   The bot doesn’t fight the push. Once the collision’s over, it just uses its new position to figure out the next sideways direction and keeps going.