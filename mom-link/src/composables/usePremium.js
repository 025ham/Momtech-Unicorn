import { ref } from 'vue'

// Shared state - single source of truth across all components
const isPremiumActive = ref(false)
const showPremiumModal = ref(false)
const showSnackbar = ref(false)
const snackbarMessage = ref('')

export function usePremium() {
  const activatePremium = () => {
    isPremiumActive.value = true
    showPremiumModal.value = false
    snackbarMessage.value = 'Activated successful'
    showSnackbar.value = true
    setTimeout(() => {
      showSnackbar.value = false
    }, 3000)
  }

  const closePremiumModal = () => {
    showPremiumModal.value = false
  }

  const openPremiumModal = () => {
    showPremiumModal.value = true
  }

  return {
    isPremiumActive,
    showPremiumModal,
    showSnackbar,
    snackbarMessage,
    activatePremium,
    closePremiumModal,
    openPremiumModal,
  }
}
