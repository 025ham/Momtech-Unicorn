import { ref } from 'vue'

const isPremiumActive = ref(false)
const showPremiumModal = ref(false)

export function usePremium() {
  const checkPremium = () => {
    return localStorage.getItem('momlink_premium_active') === 'true'
  }

  const activatePremium = () => {
    isPremiumActive.value = true
    localStorage.setItem('momlink_premium_active', 'true')
    showPremiumModal.value = false
  }

  const openPremiumModal = () => {
    showPremiumModal.value = true
  }

  const closePremiumModal = () => {
    showPremiumModal.value = false
  }

  // Initialize from localStorage
  if (typeof window !== 'undefined') {
    isPremiumActive.value = checkPremium()
  }

  return {
    isPremiumActive,
    showPremiumModal,
    checkPremium,
    activatePremium,
    openPremiumModal,
    closePremiumModal,
  }
}
