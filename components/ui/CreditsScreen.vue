<template>
  <div class="credits-modal-overlay" @click="handleClose">
    <div class="credits-modal" @click.stop>
      <div class="credits-container">
        <div class="credits-header">
          <h1 class="credits-title">Credits</h1>
          <p class="credits-subtitle">Thanks to everyone who made this game possible</p>
        </div>

        <div class="credits-content">
          <div class="credits-section">
            <h2 class="section-title">Development</h2>
            <div class="credit-item">
              <span class="credit-label">Developer:</span>
              <a href="https://x.com/davidnzubee" target="_blank" rel="noopener noreferrer" class="credit-link">
                skipp
              </a>
            </div>
          </div>

          <div class="credits-section">
            <h2 class="section-title">3D Models</h2>
            <div class="credit-item">
              <span class="credit-label">Character Models:</span>
              <a href="https://avaturn.me" target="_blank" rel="noopener noreferrer" class="credit-link">
                Avaturn
              </a>
              <span class="credit-note">(Customized and enhanced)</span>
            </div>
          </div>

          <div class="credits-section">
            <h2 class="section-title">Music & Sound Effects</h2>
            
            <div class="credit-item">
              <span class="credit-label">Game Track:</span>
              <a href="https://pixabay.com/music/modern-classical-sad-violin-150146/" target="_blank" rel="noopener noreferrer" class="credit-link">
                Pixabay - Sad Violin
              </a>
            </div>

            <div class="credit-item">
              <span class="credit-label">Win Track 1:</span>
              <a href="https://pixabay.com/music/main-title-motivational-181310/" target="_blank" rel="noopener noreferrer" class="credit-link">
                Pixabay - Motivational
              </a>
            </div>

            <div class="credit-item">
              <span class="credit-label">Win Track 2:</span>
              <a href="https://pixabay.com/music/main-title-called-to-win-30sec-195403/" target="_blank" rel="noopener noreferrer" class="credit-link">
                Pixabay - Called to Win
              </a>
            </div>

            <div class="credit-item">
              <span class="credit-label">Lose Track:</span>
              <a href="https://pixabay.com/music/main-title-so-so-sad-232027/" target="_blank" rel="noopener noreferrer" class="credit-link">
                Pixabay - So So Sad
              </a>
            </div>

            <div class="credit-item">
              <span class="credit-label">Sound Effects:</span>
              <a href="https://freesound.org" target="_blank" rel="noopener noreferrer" class="credit-link">
                Freesound.org
              </a>
            </div>

            <div class="sound-creators">
              <h3 class="sub-section-title">Sound Effect Creators:</h3>
              <div class="creator-links">
                <a href="https://freesound.org/people/qubodup" target="_blank" rel="noopener noreferrer" class="creator-link">qubodup</a>
                <a href="https://freesound.org/people/kMoon" target="_blank" rel="noopener noreferrer" class="creator-link">kMoon</a>
                <a href="https://freesound.org/people/Weak_Hero" target="_blank" rel="noopener noreferrer" class="creator-link">Weak_Hero</a>
                <a href="https://freesound.org/people/Ari_Glitch" target="_blank" rel="noopener noreferrer" class="creator-link">Ari_Glitch</a>
              </div>
            </div>
          </div>

          <div class="credits-section">
            <h2 class="section-title">Inspiration & Story</h2>
            <div class="credit-item">
              <span class="credit-label">Mythological Inspiration:</span>
              <span class="credit-text">Erinyes (Greek Mythology), Isis (Egyptian Legends)</span>
            </div>
            <div class="credit-item">
              <span class="credit-label">Story & Lore:</span>
              <span class="credit-text">Original storyline by skipp</span>
            </div>
          </div>
        </div>

        <div class="credits-actions">
          <button class="action-button" @click="handleClose">
            <Icon name="heroicons:arrow-left" class="w-5 h-5" />
            Back to Game
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSound } from '~/composables/useSound'

const emit = defineEmits<{
  close: []
}>()

// Sound system
const { playClickSound } = useSound()

const handleClose = () => {
  playClickSound()
  emit('close')
}
</script>

<style scoped>
.credits-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.credits-modal {
  max-width: 800px;
  max-height: 90vh;
  width: 100%;
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.credits-container {
  padding: 3rem;
  overflow-y: auto;
  max-height: 100%;
  display: flex;
  flex-direction: column;
}

.credits-header {
  text-align: center;
  margin-bottom: 3rem;
  flex-shrink: 0;
}

.credits-title {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.credits-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0;
}

.credits-content {
  margin-bottom: 3rem;
  flex: 1;
}

.credits-section {
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent-color);
  margin-bottom: 1rem;
  border-bottom: 2px solid rgba(245, 158, 11, 0.3);
  padding-bottom: 0.5rem;
}

.sub-section-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 1rem 0 0.5rem 0;
}

.credit-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.credit-label {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 120px;
}

.credit-link {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

.credit-link:hover {
  color: var(--secondary-color);
  text-decoration: underline;
}

.credit-text {
  color: var(--text-secondary);
}

.credit-note {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-style: italic;
}

.sound-creators {
  margin-top: 1rem;
  padding-left: 1rem;
  border-left: 2px solid rgba(99, 102, 241, 0.2);
}

.creator-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.creator-link {
  color: var(--primary-color);
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 4px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.creator-link:hover {
  background: rgba(99, 102, 241, 0.2);
  color: var(--secondary-color);
}

.credits-actions {
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.action-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

/* Scrollbar styling */
.credits-container::-webkit-scrollbar {
  width: 8px;
}

.credits-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.credits-container::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 4px;
}

.credits-container::-webkit-scrollbar-thumb:hover {
  background: var(--secondary-color);
}

/* Responsive design */
@media (max-width: 768px) {
  .credits-modal-overlay {
    padding: 1rem;
  }
  
  .credits-container {
    padding: 2rem;
  }
  
  .credits-title {
    font-size: 2rem;
  }
  
  .credit-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .credit-label {
    min-width: auto;
  }
  
  .creator-links {
    flex-direction: column;
  }
}
</style> 