# 3D Character Import Guide

## Quick Setup for 3D Characters

### 1. Character Model Requirements
- **Format**: GLB files (recommended) or GLTF
- **Animations**: Each character needs 4 animation files:
  - `{character_name}_idle.glb` - Standing/idle animation
  - `{character_name}_move.glb` - Walking/running animation
  - `{character_name}_attack.glb` - Attack animation
  - `{character_name}_defend.glb` - Defend/block animation

### 2. File Structure
Place your character models in the `public/models/` directory:
```
public/models/
├── Lyra/
│   ├── lyra_idle.glb
│   ├── lyra_move.glb
│   ├── lyra_attack.glb
│   ├── lyra_defend.glb
│   └── lyra_profile_picture.png
├── Nyx/
│   ├── nyx_idle.glb
│   ├── nyx_move.glb
│   ├── nyx_attack.glb
│   ├── nyx_defend.glb
│   └── nyx_profile_picture.png
└── Seraphina/
    ├── seraphina_idle.glb
    ├── seraphina_move.glb
    ├── seraphina_attack.glb
    ├── seraphina_defend.glb
    └── seraphina_profile_picture.png
```

### 3. Character Data
Add your character to `public/characters.json`:
```json
{
  "name": "YourCharacterName",
  "element": "Fire",
  "description": "A powerful warrior with flaming abilities",
  "rarity": "Legendary",
  "stats": {
    "attack": 85,
    "defense": 70,
    "speed": 90
  }
}
```

### 4. Quick Import Steps

#### Option A: Using Ready-Made Models
1. Download free GLB models from:
   - [Mixamo](https://www.mixamo.com/) - Humanoid characters with animations
   - [Sketchfab](https://sketchfab.com/) - Various 3D models
   - [TurboSquid](https://www.turbosquid.com/) - Professional models

2. Convert to GLB format if needed:
   - Use [Blender](https://www.blender.org/) (free)
   - Use online converters like [gltf.report](https://gltf.report/)

#### Option B: Creating Simple Placeholders
For quick testing, create simple geometric characters:

```javascript
// In your Three.js scene
const characterGeometry = new THREE.BoxGeometry(1, 2, 1);
const characterMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const character = new THREE.Mesh(characterGeometry, characterMaterial);
```

### 5. Animation Setup
If your models don't have animations, create simple ones:

```javascript
// Simple idle animation (bobbing up and down)
const animateIdle = () => {
  character.position.y = 1 + Math.sin(Date.now() * 0.002) * 0.1;
};

// Simple attack animation (scale effect)
const animateAttack = () => {
  character.scale.setScalar(1.2);
  setTimeout(() => character.scale.setScalar(1), 200);
};
```

### 6. Performance Tips
- **Optimize models**: Keep polygon count under 10k per character
- **Texture size**: Use 512x512 or 1024x1024 textures max
- **Compress**: Use compressed textures (KTX2, DDS)
- **LOD**: Implement Level of Detail for distant characters

### 7. Testing Your Character
1. Place your GLB files in the correct directory
2. Update `characters.json` with your character data
3. Restart the development server
4. Select your character in the game
5. Verify animations work in the preview and arena

### 8. Troubleshooting
- **Model not loading**: Check file path and format
- **No animations**: Ensure GLB contains animation data
- **Performance issues**: Reduce polygon count or texture size
- **Scale issues**: Adjust model scale in Three.js scene

### 9. Advanced Features
- **Custom shaders**: Add glowing effects, transparency
- **Particle effects**: Add magic trails, fire effects
- **Sound effects**: Add character-specific audio
- **Physics**: Add ragdoll effects, cloth simulation

## Quick Start Example
```bash
# 1. Download a free character from Mixamo
# 2. Export as GLB with animations
# 3. Create directory: public/models/MyCharacter/
# 4. Copy GLB files with proper naming
# 5. Add character data to characters.json
# 6. Test in game!
```

This setup allows you to quickly add new characters to your game while maintaining the existing architecture. 