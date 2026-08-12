<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IconHome from '@/components/icons/IconHome.vue'
import IconTrendUp from '@/components/icons/IconTrendUp.vue'
import IconSmile from '@/components/icons/IconSmile.vue'
import IconUser from '@/components/icons/IconUser.vue'

const route = useRoute()
const router = useRouter()

const isEmergencyPage = computed(() => route.path === '/emergency')

const navItems = [
  { path: '/home', name: 'Home', icon: IconHome, iconColor: '#5DC6BA' },
  { path: '/home/monitor', name: 'Monitor', icon: IconTrendUp, iconColor: '#5DC6BA' },
  { path: '/home/ai-analysis', name: 'AI', icon: IconSmile, iconColor: '#5DC6BA' },
  { path: '/home/profile', name: 'Profile', icon: IconUser, iconColor: '#5DC6BA' },
]

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/' || route.path === ''
  }
  return route.path.startsWith(path)
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
        :class="{ active: isActive(item.path) }"
        @click="router.push(item.path)"
      >
        <span class="nav-icon">
          <component :is="item.icon" :size="20" :color="isActive(item.path) ? item.iconColor : '#888'" />
        </span>
        <span class="nav-label">{{ item.name }}</span>
      </button>
    </nav>
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
  /* Add padding at bottom for the nav bar */
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.layout-content::-webkit-scrollbar {
  display: none;
}

.bottom-nav {
  flex-shrink: 0;
  background-color: #ffffff;
  display: flex;
  justify-content: space-around;
  padding: 12px 0 calc(12px + env(safe-area-inset-bottom, 0px)) 0;
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
  gap: 4px;
  color: #888;
  cursor: pointer;
  position: relative;
  padding: 4px 12px;
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
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
}
</style>
