Feature Implementation Guide
============================

This document provides step-by-step instructions for implementing new features in _Zero-Gravity Sumo_. Each step is small, specific, and includes a test to ensure proper functionality. Follow these steps carefully to enhance the game with mobile support, a pre-game menu, visual effects, and advertisements.

Feature 1: Web Mobile Support with Touch Controls
-------------------------------------------------

**Objective**: Replace desktop keyboard controls (WASD, Space, Double Space) with mobile-friendly touch controls, including a joystick for direction, a normal thrust button, and a boost button.

*   Add a virtual joystick to the mobile screen that controls the spaceship’s rotation (left, right, up, down).
    
*   Place a touch button labeled "Thrust" on the screen that, when pressed, moves the spaceship forward in the direction it’s facing.
    
*   Add a touch button labeled "Boost" that, when pressed, increases the spaceship’s thrust speed for a short duration, followed by a cooldown period.
    
*   Hide or disable WASD, Space, and Shift controls on mobile devices to prevent overlap with touch controls.
    

Feature 2: Pre-Game Menu
------------------------

**Objective**: Create an engaging pre-game menu with the game title, how-to-play instructions, a "Play" button, a "Beta" tag, and a "Made entirely with gen-AI" info text.

*   Display "Zero Gravity Sumo" prominently at the top of the pre-game menu screen.

*   Add a large, clickable "Play" button beneath the title that starts the game when pressed.
    
*   Below the Play button, include a "How to Play" section describing the controls (joystick, thrust, boost) and the objective (push opponents out of the arena while staying inside).
    
*   Include a small "Beta version" label near the title to indicate the game is in early development.

*   In the bottom right corner, add a tag that says "Made 100% with generative AI".
    

Feature 3: Visual Effects
-------------------------

**Objective**: Improve visual feedback with a particle explosion for eliminated ships and thrust effects for normal and boost modes.

*   When a ship exits the arena (loses), trigger a particle explosion effect at its last position.
    
*   When normal thrust is active, show a small fire or booster effect at the back of the spaceship.
    
*   When boost is used, display a larger, more intense thrust effect (e.g., bigger flames or brighter glow) to reflect the power increase.