<template>
  <div class="story-carousel">
    <div class="story-overlay">
      <!-- Progress bar -->
      <div class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${getCardProgress()}%` }"
          ></div>
        </div>
        <div class="progress-text">
          {{ currentCardIndex + 1 }} / {{ totalCards }}
        </div>
      </div>

      <!-- Story card -->
      <div class="story-card-container">
        <div class="story-card">
          <div class="story-image" v-if="currentCard.image">
            <img :src="currentCard.image" :alt="currentCard.title" />
          </div>
          <div class="story-content">
            <h2 class="story-title">{{ currentCard.title }}</h2>
            <p class="story-text">{{ currentCard.content }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation controls -->
      <div class="story-controls">
        <button 
          class="nav-button prev-button" 
          @click="handlePreviousCard"
          :disabled="isFirstCard"
        >
          <Icon name="heroicons:chevron-left" class="w-6 h-6" />
        </button>

        <div class="card-indicators">
          <button
            v-for="(card, index) in storyCards"
            :key="card.id"
            class="indicator-dot"
            :class="{ active: index === currentCardIndex }"
            @click="handleGoToCard(index)"
          ></button>
        </div>

        <button 
          class="nav-button next-button" 
          @click="handleNextCard"
          :disabled="isLastCard"
        >
          <Icon name="heroicons:chevron-right" class="w-6 h-6" />
        </button>
      </div>

      <!-- Action buttons -->
      <div class="story-actions">
        <button 
          class="action-button secondary" 
          @click="handleToggleAutoPlay"
        >
          <Icon 
            :name="autoPlay ? 'heroicons:pause' : 'heroicons:play'" 
            class="w-5 h-5" 
          />
          {{ autoPlay ? 'Pause' : 'Play' }}
        </button>
        
        <button 
          class="action-button primary" 
          @click="handleSkip"
        >
          Begin Your Journey
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStory } from '~/composables/useStory'
import { useSound } from '~/composables/useSound'

// Props and emits
const emit = defineEmits<{
  skip: []
}>()

// Use story composable
const {
  storyCards,
  currentCard,
  currentCardIndex,
  autoPlay,
  totalCards,
  isFirstCard,
  isLastCard,
  nextCard,
  previousCard,
  goToCard,
  toggleAutoPlay,
  getCardProgress
} = useStory()

// Sound system
const { playClickSound } = useSound()

// Auto-play functionality
let autoPlayTimer: NodeJS.Timeout | null = null

const startAutoPlay = () => {
  if (autoPlay.value) {
    autoPlayTimer = setInterval(() => {
      nextCard()
    }, 5000)
  }
}

const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

// Watch for autoPlay changes
watch(autoPlay, (newValue) => {
  if (newValue) {
    startAutoPlay()
  } else {
    stopAutoPlay()
  }
})

// Lifecycle
onMounted(() => {
  if (autoPlay.value) {
    startAutoPlay()
  }
})

onUnmounted(() => {
  stopAutoPlay()
})

const handleNextCard = () => {
  playClickSound()
  nextCard()
}

const handlePreviousCard = () => {
  playClickSound()
  previousCard()
}

const handleGoToCard = (index: number) => {
  playClickSound()
  goToCard(index)
}

const handleToggleAutoPlay = () => {
  playClickSound()
  toggleAutoPlay()
}

const handleSkip = () => {
  playClickSound()
  emit('skip')
}
</script>

<style scoped>
.story-carousel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.story-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
}

.progress-container {
  position: absolute;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 10;
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width 0.3s ease;
}

.progress-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

.story-card-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 800px;
  width: 100%;
}

.story-card {
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  max-width: 600px;
  width: 100%;
}

.story-image {
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;
  height: 200px;
  background: rgba(99, 102, 241, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.story-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.story-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.story-text {
  font-size: 1.125rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.story-controls {
  position: absolute;
  bottom: 8rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 2rem;
  z-index: 10;
}

.nav-button {
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-button:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.4);
  border-color: rgba(99, 102, 241, 0.6);
  transform: scale(1.1);
}

.nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.card-indicators {
  display: flex;
  gap: 0.5rem;
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator-dot.active {
  background: var(--primary-color);
  transform: scale(1.2);
}

.indicator-dot:hover {
  background: rgba(255, 255, 255, 0.5);
}

.story-actions {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  z-index: 10;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.action-button.primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.action-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.action-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-button.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Responsive design */
@media (max-width: 768px) {
  .story-overlay {
    padding: 1rem;
  }
  
  .story-card {
    padding: 2rem;
  }
  
  .story-title {
    font-size: 1.5rem;
  }
  
  .story-text {
    font-size: 1rem;
  }
  
  .story-controls {
    bottom: 6rem;
    gap: 1rem;
  }
  
  .nav-button {
    width: 40px;
    height: 40px;
  }
  
  .story-actions {
    bottom: 1rem;
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
}
</style> 