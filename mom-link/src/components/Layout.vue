<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IconHome from '@/components/icons/IconHome.vue'
import IconTrendUp from '@/components/icons/IconTrendUp.vue'
import IconSmile from '@/components/icons/IconSmile.vue'
import IconUser from '@/components/icons/IconUser.vue'
import IconLock from '@/components/icons/IconLock.vue'
import { usePremium } from '@/composables/usePremium'

const route = useRoute()
const router = useRouter()

// Use shared premium state
const {
  isPremiumActive,
  showPremiumModal,
  showSnackbar,
  snackbarMessage,
  activatePremium,
  closePremiumModal,
  openPremiumModal,
} = usePremium()

const isEmergencyPage = computed(() => route.path === '/emergency')

const navItems = [
  { path: '/home', name: 'Home', icon: IconHome, iconColor: '#5DC6BA' },
  { path: '/home/monitor', name: 'Monitor', icon: IconTrendUp, iconColor: '#5DC6BA' },
  { path: '/home/ai-analysis', name: 'AI Analysis', icon: IconSmile, iconColor: '#5DC6BA', isPremium: true },
  { path: '/home/profile', name: 'Profile', icon: IconUser, iconColor: '#5DC6BA' },
]

const isActive = (path) => {
  return route.path === path
}

const handleNavClick = (item) => {
  if (item.isPremium && !isPremiumActive.value) {
    openPremiumModal()
  } else {
    router.push(item.path)
  }
}
</script>

<template>
  <div class="layout-container">
    <main class="layout-content">
      <slot />
    </main>

    <nav v-if="!isEmergencyPage" class="bottom-nav">
      <button
        v-for="item in navItems"
        :key="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path), 'is-premium': item.isPremium && !isPremiumActive }"
        @click="handleNavClick(item)"
      >
        <span class="nav-icon">
          <component :is="item.icon" :size="20" :color="isActive(item.path) ? item.iconColor : '#888'" />
          <span v-if="item.isPremium && !isPremiumActive" class="premium-lock">
            <IconLock :size="10" color="#f0ad4e" />
          </span>
        </span>
        <span class="nav-label">{{ item.name }}</span>
      </button>
    </nav>

    <!-- Premium Modal -->
    <div v-if="showPremiumModal" class="premium-modal-overlay" @click="closePremiumModal">
      <div class="premium-modal" @click.stop>
        <div class="modal-header">
          <h3>Activated Premium</h3>
        </div>
        <div class="modal-body">
          <p class="premium-desc">Unlock premium features:</p>
          <ul class="premium-list">
            <li>✨ AI-powered health analysis</li>
            <li>✨ Personalized recommendations</li>
            <li>✨ Advanced health insights</li>
            <li>✨ Priority support</li>
          </ul>
          <div class="modal-actions">
            <button class="btn-cancel" @click="closePremiumModal">Cancel</button>
            <button class="btn-purchase" @click="activatePremium">Purchase</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Snackbar -->
    <div v-if="showSnackbar" class="snackbar">
      {{ snackbarMessage }}
    </div>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100dvh;
  width: 100%;
  overflow: hidden;
}

.layout-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 80px;
}

.layout-content::-webkit-scrollbar {
  display: none;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
  display: flex;
  justify-content: space-around;
  padding: 12px 0 12px 0;
  border-top: 1px solid #f0eae1;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);
  z-index: 100;
}

.nav-item {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #888;
  cursor: pointer;
  position: relative;
  padding: 6px 12px;
  transition: all 0.2s;
}

.nav-item.is-premium {
  background: #f5f5f5;
  border-radius: 12px;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background-color: #5DC6BA;
  border-radius: 2px;
  transition: width 0.2s ease;
}

.nav-item.active {
  color: #5DC6BA;
}

.nav-item.active::after {
  width: 24px;
}

.nav-icon {
  font-size: 18px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.premium-lock {
  position: absolute;
  top: -6px;
  right: -8px;
  background: #fff8e1;
  border-radius: 50%;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #f0ad4e;
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
}

/* Premium Modal */
.premium-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.premium-modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 340px;
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #5DC6BA 0%, #449284 100%);
  padding: 20px;
  text-align: center;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin: 0;
}

.modal-body {
  padding: 20px;
}

.premium-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.premium-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.premium-list li {
  font-size: 13px;
  color: #333;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.premium-list li:last-child {
  border-bottom: none;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: white;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
}

.btn-purchase {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #f0ad4e 0%, #f5c842 100%);
  font-size: 14px;
  font-weight: 600;
  color: white;
  cursor: pointer;
}

/* Snackbar */
.snackbar {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1001;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
