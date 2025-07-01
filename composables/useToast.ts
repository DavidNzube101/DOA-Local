import { ref } from 'vue'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

export function useToast() {
  const toasts = ref<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    const newToast: Toast = {
      id,
      duration: 5000, // Default 5 seconds
      ...toast
    }
    
    toasts.value.push(newToast)
    
    // Auto remove after duration
    if (newToast.duration) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
    
    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) => {
    return addToast({ type: 'success', message, duration })
  }

  const error = (message: string, duration?: number) => {
    return addToast({ type: 'error', message, duration })
  }

  const info = (message: string, duration?: number) => {
    return addToast({ type: 'info', message, duration })
  }

  const warning = (message: string, duration?: number) => {
    return addToast({ type: 'warning', message, duration })
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
} 