import { ref, computed } from 'vue'
import type { Character } from '~/types/game'

// The 12 Daughters of Aether
export const characters: Character[] = [
  {
    id: 1,
    name: 'Lyra',
    description: 'The Starlight Weaver, born of celestial harmonies',
    element: 'Starlight',
    modelPath: '/models/lyra.glb',
    texturePath: '/textures/lyra.jpg'
  },
  {
    id: 2,
    name: 'Seraphina',
    description: 'The Flame Dancer, keeper of eternal fire',
    element: 'Fire',
    modelPath: '/models/seraphina.glb',
    texturePath: '/textures/seraphina.jpg'
  },
  {
    id: 3,
    name: 'Aurelia',
    description: 'The Golden Dawn, herald of new beginnings',
    element: 'Light',
    modelPath: '/models/aurelia.glb',
    texturePath: '/textures/aurelia.jpg'
  },
  {
    id: 4,
    name: 'Celeste',
    description: 'The Moon Whisperer, guardian of night\'s secrets',
    element: 'Moon',
    modelPath: '/models/celeste.glb',
    texturePath: '/textures/celeste.jpg'
  },
  {
    id: 5,
    name: 'Thalassa',
    description: 'The Ocean\'s Heart, mistress of deep waters',
    element: 'Water',
    modelPath: '/models/thalassa.glb',
    texturePath: '/textures/thalassa.jpg'
  },
  {
    id: 6,
    name: 'Nyx',
    description: 'The Shadow Walker, born of darkness itself',
    element: 'Shadow',
    modelPath: '/models/nyx.glb',
    texturePath: '/textures/nyx.jpg'
  },
  {
    id: 7,
    name: 'Isolde',
    description: 'The Storm Caller, wielder of thunder\'s might',
    element: 'Storm',
    modelPath: '/models/isolde.glb',
    texturePath: '/textures/isolde.jpg'
  },
  {
    id: 8,
    name: 'Elara',
    description: 'The Earth Mother, keeper of ancient wisdom',
    element: 'Earth',
    modelPath: '/models/elara.glb',
    texturePath: '/textures/elara.jpg'
  },
  {
    id: 9,
    name: 'Zephyra',
    description: 'The Wind Dancer, spirit of the free air',
    element: 'Wind',
    modelPath: '/models/zephyra.glb',
    texturePath: '/textures/zephyra.jpg'
  },
  {
    id: 10,
    name: 'Astraea',
    description: 'The Cosmic Weaver, spinner of fate\'s threads',
    element: 'Cosmos',
    modelPath: '/models/astraea.glb',
    texturePath: '/textures/astraea.jpg'
  },
  {
    id: 11,
    name: 'Rhiannon',
    description: 'The Time Keeper, guardian of moments past',
    element: 'Time',
    modelPath: '/models/rhiannon.glb',
    texturePath: '/textures/rhiannon.jpg'
  },
  {
    id: 12,
    name: 'Morwen',
    description: 'The Spirit Walker, bridge between worlds',
    element: 'Spirit',
    modelPath: '/models/morwen.glb',
    texturePath: '/textures/morwen.jpg'
  }
]

export function useCharacters() {
  const selectedCharacter = ref<Character | null>(null)
  const characterSelectionVisible = ref(false)

  const getCharacterById = (id: number): Character | undefined => {
    return characters.find(char => char.id === id)
  }

  const selectCharacter = (character: Character) => {
    selectedCharacter.value = character
    characterSelectionVisible.value = false
  }

  const clearSelection = () => {
    selectedCharacter.value = null
  }

  const isCharacterSelected = (characterId: number): boolean => {
    return selectedCharacter.value?.id === characterId
  }

  const getCharactersByElement = (element: string): Character[] => {
    return characters.filter(char => char.element === element)
  }

  const getAllElements = computed(() => {
    return [...new Set(characters.map(char => char.element))]
  })

  return {
    characters,
    selectedCharacter: readonly(selectedCharacter),
    characterSelectionVisible: readonly(characterSelectionVisible),
    getCharacterById,
    selectCharacter,
    clearSelection,
    isCharacterSelected,
    getCharactersByElement,
    getAllElements,
    showCharacterSelection: () => characterSelectionVisible.value = true,
    hideCharacterSelection: () => characterSelectionVisible.value = false
  }
} 