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
  - `main.js`: Entry point for game initialization
  - (Planned) `scene.js`: Three.js scene management
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
├── styles/main.css
└── scripts/main.js
    └── (future Three.js and other dependencies)
```

## Update History
- Initial setup: Basic file structure and HTML5 boilerplate
- (Future updates will be logged here)
