<template>
  <div class="character-selection">
    <div class="selection-container">
      <div class="selection-header">
        <h1 class="selection-title">Choose Your Daughter</h1>
        <p class="selection-subtitle">Select one of the available Daughters of Aether to represent you in battle</p>
      </div>

      <div class="character-grid">
        <div
          v-for="character in availableCharacters"
          :key="character.name"
          class="character-card"
          :class="{ 
            'selected': selectedCharacter && selectedCharacter.name === character.name,
            'hover': hoveredCharacter === character.name 
          }"
          @click="selectCharacter(character)"
          @mouseenter="hoveredCharacter = character.name"
          @mouseleave="hoveredCharacter = null"
        >
          <div class="character-avatar">
            <div class="avatar-placeholder">
              <img
                :src="`/models/${character.name}/${character.name.toLowerCase()}_profile_picture.png`"
                alt="Profile picture"
                class="avatar-img"
                @error="onImgError($event)"
              />
              <Icon v-if="imgError[character.name]" name="heroicons:user" class="w-12 h-12" />
            </div>
          </div>
          <div class="character-info">
            <h3 class="character-name">{{ character.name }}</h3>
            <p class="character-element">{{ character.element || '' }}</p>
            <p class="character-description">{{ character.description || '' }}</p>
          </div>
          <div class="selection-indicator">
            <Icon 
              v-if="selectedCharacter && selectedCharacter.name === character.name"
              name="heroicons:check-circle" 
              class="w-6 h-6 text-green-400" 
            />
            <Icon 
              v-else
              name="heroicons:plus-circle" 
              class="w-6 h-6 text-gray-400" 
            />
          </div>
        </div>
      </div>

      <div class="selection-actions">
        <button 
          class="action-button primary"
          :disabled="!selectedCharacter"
          @click="confirmSelection"
        >
          <Icon name="heroicons:play" class="w-5 h-5" />
          Continue to Battle
        </button>
      </div>

      <div v-if="selectedCharacter" class="selected-character-preview">
        <div class="preview-card">
          <h3 class="preview-title">Selected Character</h3>
          <div class="preview-content">
            <div class="preview-avatar">
              <img
                :src="`/models/${selectedCharacter.name}/${selectedCharacter.name.toLowerCase()}_profile_picture.png`"
                alt="Profile picture"
                class="avatar-img-large"
                @error="onImgError($event, selectedCharacter.name, true)"
              />
              <Icon v-if="imgError[selectedCharacter.name]" name="heroicons:user" class="w-16 h-16" />
            </div>
            <div class="preview-info">
              <h4 class="preview-name">{{ selectedCharacter.name }}</h4>
              <p class="preview-element">{{ selectedCharacter.element || '' }}</p>
              <p class="preview-description">{{ selectedCharacter.description || '' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, reactive } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useSound } from '~/composables/useSound'

const emit = defineEmits<{ 'character-selected': [character: any] }>()

// Sound system
const { playClickSound } = useSound()

const hoveredCharacter = ref<string | null>(null)
const selectedCharacter = ref<any | null>(null)
const availableCharacters = ref<any[]>([])

// Track image load errors for fallback
const imgError = reactive({})

// Load characters.json
async function loadCharacters() {
  const res = await fetch('/characters.json')
  const data = await res.json()
  availableCharacters.value = data.characters.filter((c: any) => c.available)
}

onMounted(() => {
  loadCharacters()
})

function selectCharacter(character: any) {
  playClickSound()
  selectedCharacter.value = character
}

const confirmSelection = () => {
  if (selectedCharacter.value) {
    playClickSound()
    emit('character-selected', selectedCharacter.value)
  }
}

// Helper to check if PNG exists (optimistic, will fallback to icon if image fails to load)
function characterPngExists(character) {
  // Always return true for now; browser will fallback to icon if image fails to load
  return !!character && !!character.name
}

function onImgError(e, name, isLarge = false) {
  if (name) {
    imgError[name] = true
    e.target.style.display = 'none'
  } else if (e && e.target && e.target.src) {
    // fallback for v-for
    const src = e.target.src
    const match = src.match(/\/models\/([^/]+)\//)
    if (match && match[1]) {
      imgError[match[1]] = true
    }
    e.target.style.display = 'none'
  }
}
</script>

<style scoped>
.character-selection {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow-y: auto;
}

.selection-container {
  max-width: 1200px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.selection-header {
  text-align: center;
  margin-bottom: 2rem;
}

.selection-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.selection-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.character-card {
  background: rgba(26, 26, 46, 0.8);
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.character-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.character-card:hover::before {
  left: 100%;
}

.character-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
}

.character-card.selected {
  border-color: var(--accent-color);
  background: rgba(245, 158, 11, 0.1);
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.3);
}

.character-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  position: relative;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  border: 2px solid rgba(99, 102, 241, 0.3);
}

.character-model {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.character-info {
  text-align: center;
  flex: 1;
}

.character-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.character-element {
  font-size: 0.875rem;
  color: var(--accent-color);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.character-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.selection-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  transition: all 0.3s ease;
}

.character-card.selected .selection-indicator {
  transform: scale(1.2);
}

.selection-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.action-button {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  font-size: 1.125rem;
}

.action-button.primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.action-button.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.action-button.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.selected-character-preview {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.preview-card {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
}

.preview-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--accent-color);
  margin-bottom: 1rem;
  text-align: center;
}

.preview-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.preview-avatar {
  width: 64px;
  height: 64px;
  background: rgba(245, 158, 11, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  border: 2px solid rgba(245, 158, 11, 0.3);
  flex-shrink: 0;
}

.preview-info {
  flex: 1;
}

.preview-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.preview-element {
  font-size: 0.75rem;
  color: var(--accent-color);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.preview-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
}

.three-preview-canvas {
  width: 128px;
  height: 128px;
  background: #18182f;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(99,102,241,0.15);
  margin: 0 auto;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  background: #18182f;
}

.avatar-img-large {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  background: #18182f;
}

/* Responsive design */
@media (max-width: 768px) {
  .character-selection {
    padding: 1rem;
  }
  
  .selection-title {
    font-size: 2rem;
  }
  
  .character-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .character-card {
    padding: 1rem;
  }
  
  .character-name {
    font-size: 1.25rem;
  }
  
  .action-button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}
</style> 