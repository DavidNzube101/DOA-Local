import { ref, computed, readonly } from 'vue'
import type { StoryCard } from '~/types/game'

// The 4-card story of Daughters of Aether
export const storyCards: StoryCard[] = [
  {
    id: 1,
    title: "The Golden Age's End",
    content: "For eons, the realm of Aether flourished under the gentle hand of the Sky Father, a beacon of light and harmony. His daughters, born of starlight and blessed with elemental grace, guarded the kingdom. But peace breeds complacency, and from the darkest void, the Demon Diablos rose.",
    image: "/story/card1.png"
  },
  {
    id: 2,
    title: "The Curse of Shadows",
    content: "In a cataclysmic battle, Diablos struck. The Sky Father fell, his light extinguished. His daughters, once unified, were shattered by a curse that twisted their hearts, turning them against each other, trapping them in an eternal, shadowed conflict. The kingdom crumbled to dust.",
    image: "/story/card2.png"
  },
  {
    id: 3,
    title: "A Flicker of Hope",
    content: "Yet, a fragment of the Sky Father's light ensues. Within each surviving daughter, a seed of true purpose awakens: to avenge their father, break the curse, and reclaim Aether. But the curse remains, tainting their perception – for to each, *every other daughter* is but another twisted, malevolent shadow of Diablos's doing.",
    image: "/story/card3.png"
  },
  {
    id: 4,
    title: "The Path to Atonement",
    content: "To lift the veil, they must confront their distorted reflections in the corrupted arenas. Stakes are high, for only by proving their true spirit can they gather the Aetheric essence to challenge Diablos. The forfeited power of the defeated will fuel the champion's ascent. Will *you* be the one to restore Aether?",
    image: "/story/card4.png"
  }
]

export function useStory() {
  const currentCardIndex = ref(0)
  const isStoryVisible = ref(true)
  const autoPlay = ref(true)
  const autoPlayInterval = ref(5000) // 5 seconds

  const currentCard = computed(() => storyCards[currentCardIndex.value])
  
  const totalCards = computed(() => storyCards.length)
  
  const isFirstCard = computed(() => currentCardIndex.value === 0)
  
  const isLastCard = computed(() => currentCardIndex.value === totalCards.value - 1)

  const nextCard = () => {
    if (currentCardIndex.value < totalCards.value - 1) {
      currentCardIndex.value++
    } else {
      // Loop back to first card
      currentCardIndex.value = 0
    }
  }

  const previousCard = () => {
    if (currentCardIndex.value > 0) {
      currentCardIndex.value--
    } else {
      // Loop to last card
      currentCardIndex.value = totalCards.value - 1
    }
  }

  const goToCard = (index: number) => {
    if (index >= 0 && index < totalCards.value) {
      currentCardIndex.value = index
    }
  }

  const skipStory = () => {
    isStoryVisible.value = false
  }

  const restartStory = () => {
    currentCardIndex.value = 0
    isStoryVisible.value = true
  }

  const toggleAutoPlay = () => {
    autoPlay.value = !autoPlay.value
  }

  const getCardProgress = () => {
    return ((currentCardIndex.value + 1) / totalCards.value) * 100
  }

  return {
    storyCards,
    currentCard,
    currentCardIndex: readonly(currentCardIndex),
    isStoryVisible: readonly(isStoryVisible),
    autoPlay: readonly(autoPlay),
    totalCards,
    isFirstCard,
    isLastCard,
    nextCard,
    previousCard,
    goToCard,
    skipStory,
    restartStory,
    toggleAutoPlay,
    getCardProgress,
    showStory: () => isStoryVisible.value = true,
    hideStory: () => isStoryVisible.value = false
  }
} 