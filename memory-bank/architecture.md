# Zero-Gravity Sumo Architecture

## Project Structure

### Root Directory
- `index.html`: Entry point for the game, loads all necessary resources and provides the game container

### Assets Directory (`/assets`)
- Purpose: Stores all static assets used in the game
- Contents:
  - 3D models (GLTF/GLB format)
  - Textures
  - Other static resources

### Scripts Directory (`/scripts`)
- Purpose: Contains all JavaScript code for game logic
- Files:
  - `main.js`: Entry point for game initialization and dependency verification
  - `scene.js`: Three.js scene management, rendering, and camera control
  - `physics.js`: Zero-gravity physics simulation and thrust mechanics
  - (Planned) `bots.js`: AI bot behavior
  - (Planned) `game.js`: Core game logic
  - (Planned) `ui.js`: User interface management

### Styles Directory (`/styles`)
- Purpose: Contains all CSS styling for the game
- Files:
  - `main.css`: Core styling and layout
  - (Planned) Additional CSS modules for specific components

## Design Principles
1. **Modularity**: Each JavaScript file handles a specific aspect of the game
2. **Performance**: Static assets are optimized and loaded efficiently
3. **Maintainability**: Clear separation of concerns between files
4. **Scalability**: Directory structure supports future additions

## File Dependencies
```
index.html
├── three.min.js (CDN)
├── styles/main.css
└── scripts/
    ├── physics.js
    ├── scene.js
    └── main.js
```

## Component Architecture
### Scene Management (`scene.js`)
- Responsibilities:
  - Three.js scene initialization
  - Camera setup and management
  - Renderer configuration
  - Animation loop handling
  - Window resize adaptation
  - Player input handling
  - Physics integration
- Key Components:
  - Scene: Root container for all 3D objects
  - Camera: Perspective camera with 75° FOV
  - Renderer: WebGL renderer with responsive canvas and antialiasing
  - Animation Loop: Maintains 60 FPS rendering
  - Safe Zone: Spherical boundary (radius 50) with transparency
  - Background: Star field for depth perception
  - Input System: Keyboard state tracking for smooth controls

### Physics System (`physics.js`)
- **Core Mechanics**:
  - Zero-gravity movement simulation
  - Velocity-based motion
  - Inertial dampening (0.99 factor)
  - Fixed time step (1/60s)
- **Thrust System**:
  - Normal Thrust: 0.5 units/s² acceleration
  - Boost Thrust: 2.0 units/s² acceleration
  - Duration: 2 seconds boost, 10 seconds cooldown
- **State Management**:
  - Velocity tracking
  - Thrust activation
  - Boost timing
  - Cooldown handling

### Game Arena
- **Safe Zone**:
  - Type: Sphere mesh with radius 50
  - Material: Semi-transparent wireframe (opacity 0.3)
  - Purpose: Defines play area boundaries
  - Behavior: Slow rotation for visual feedback
- **Background**:
  - Type: Point cloud (1000 vertices)
  - Purpose: Provides depth perception and immersion
  - Distribution: Random points in 2000x2000x2000 cube

### Player Ship
- **Geometry**:
  - Type: Cone (radius 1, height 2)
  - Material: Solid green (#00FF00)
  - Initial Position: Random within ±20 units
  - Orientation: Rotated to point along length
- **Controls**:
  - Input: WASD/Arrow keys for rotation
  - Thrust: Space key for forward movement
  - Boost: Space key during thrust
  - Rotation Speed: 0.05 radians/frame
  - State Management: Key state object for smooth input
- **Physics Properties**:
  - Mass: 1.0 unit (for future collision handling)
  - Velocity: Managed by physics system
  - Damping: 0.99 per frame
  - Movement: Thrust-based in zero gravity

## Update History
- Initial setup: Basic file structure and HTML5 boilerplate
- Three.js Integration: Added 3D rendering capabilities and basic scene management
- Game Arena: Implemented play area boundary and visual environment
- Player Ship: Added player-controlled spaceship with rotation controls
