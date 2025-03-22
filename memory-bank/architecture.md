# Project Architecture

## Directory Structure
```
ZeroGravitySumo/
├── assets/           # Game assets (3D models, textures, sounds)
├── scripts/         # JavaScript files for game logic
├── styles/          # CSS files for UI styling
└── index.html       # Main entry point
```

## File Purposes

### HTML Files
- `index.html`: Main entry point for the game
  - Loads all required scripts and styles
  - Provides the container for the Three.js canvas
  - Handles responsive viewport settings

### Script Files (Planned)
- `scene.js`: Three.js scene setup and management
- `physics.js`: Game physics and collision detection
- `network.js`: Multiplayer networking via Pusher/Ably
- `bots.js`: AI bot behavior and logic
- `ui.js`: User interface management
- `assets.js`: Asset loading and management

### Style Files (Planned)
- `main.css`: Main stylesheet for UI elements
  - Game overlay styling
  - Mobile/desktop responsive design
  - Control interface layout

### Asset Files (Planned)
- `ship.glb`: 3D model for spaceships
- Additional assets as needed

## Design Principles
1. **Modularity**: Each JavaScript file handles a specific aspect of the game
2. **Responsiveness**: UI adapts to both desktop and mobile
3. **Performance**: Efficient asset loading and management
4. **Scalability**: Easy to add new features or modify existing ones
