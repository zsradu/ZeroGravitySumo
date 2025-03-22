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
  - (Planned) `physics.js`: Game physics calculations
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
- Key Components:
  - Scene: Root container for all 3D objects
  - Camera: Perspective camera with 75° FOV
  - Renderer: WebGL renderer with responsive canvas
  - Animation Loop: Maintains 60 FPS rendering

## Update History
- Initial setup: Basic file structure and HTML5 boilerplate
- Three.js Integration: Added 3D rendering capabilities and basic scene management
