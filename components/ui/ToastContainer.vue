<template>
  <div class="toast-container" @mouseenter="hovered = true" @mouseleave="hovered = false">
    <TransitionGroup name="toast" tag="div" class="toast-list" :class="{ expanded: hovered }">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="[`toast-${toast.type}`, { expanded: hovered }]"
      >
        <div class="toast-content">
          <Icon 
            :name="getToastIcon(toast.type)" 
            class="w-5 h-5" 
          />
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button 
          @click="removeToast(toast.id)"
          class="toast-close"
        >
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </button>
        <div class="toast-progress-bar" :style="getProgressStyle(toast)"></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '~/composables/useToast'

const { toasts, removeToast } = useToast()
const hovered = ref(false)
const now = ref(Date.now())
setInterval(() => { now.value = Date.now() }, 100)

const getToastIcon = (type: string) => {
  switch (type) {
    case 'success':
      return 'heroicons:check-circle'
    case 'error':
      return 'heroicons:exclamation-triangle'
    case 'warning':
      return 'heroicons:exclamation-triangle'
    case 'info':
      return 'heroicons:information-circle'
    default:
      return 'heroicons:information-circle'
  }
}

const getProgressStyle = (toast: any) => {
  const elapsed = now.value - parseInt(toast.id)
  const pct = Math.max(0, 1 - elapsed / (toast.duration || 5000))
  return {
    width: pct * 100 + '%',
    transition: 'width 0.1s linear',
  }
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.5rem;
  transition: gap 0.3s;
}

.toast-list:not(.expanded) .toast:not(:last-child) {
  margin-bottom: -2.2rem;
  opacity: 0.85;
  filter: blur(0.5px);
  pointer-events: none;
  transition: margin 0.3s, opacity 0.3s, filter 0.3s;
}

.toast-list.expanded .toast {
  margin-bottom: 0.5rem;
  opacity: 1;
  filter: none;
  pointer-events: auto;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  min-width: 300px;
  max-width: 400px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 0.5rem;
  transition: margin 0.3s, opacity 0.3s, filter 0.3s;
  position: relative;
  overflow: hidden;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.toast-message {
  font-size: 0.875rem;
  font-weight: 500;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

.toast-progress-bar {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 4px;
  background: linear-gradient(90deg, #22c55e, #f59e0b, #ef4444);
  border-radius: 0 0 8px 8px;
  transition: width 0.1s linear;
}

/* Toast Types */
.toast-success {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.toast-error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.toast-warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.toast-info {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .toast-container {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
  }
  
  .toast {
    min-width: auto;
    max-width: none;
  }
}
</style> 