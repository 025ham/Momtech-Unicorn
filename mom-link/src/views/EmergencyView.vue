<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useContactStore } from '@/stores/contacts'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notifications'
import IconBack from '@/components/icons/IconBack.vue'
import IconWarning from '@/components/icons/IconWarning.vue'
import IconSiren from '@/components/icons/IconSiren.vue'
import IconPhone from '@/components/icons/IconPhone.vue'
import IconHospital from '@/components/icons/IconHospital.vue'
import IconDoctor from '@/components/icons/IconDoctor.vue'
import IconPerson from '@/components/icons/IconPerson.vue'
import IconHome from '@/components/icons/IconHome.vue'
import IconTrendUp from '@/components/icons/IconTrendUp.vue'
import IconSmile from '@/components/icons/IconSmile.vue'
import IconUser from '@/components/icons/IconUser.vue'
import IconLock from '@/components/icons/IconLock.vue'
import IconLocation from '@/components/icons/IconLocation.vue'
import { usePremium } from '@/composables/usePremium'

const router = useRouter()
const contactStore = useContactStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

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

const goBack = () => router.push('/home')

// Emergency state
const sosActive = ref(false)
const showSosAlert = ref(false)

onMounted(async () => {
  await userStore.fetchUser()
  await contactStore.fetchContacts()
})

const triggerSOS = () => {
  showSosAlert.value = true
  sosActive.value = true

  // Add emergency notification to store
  notificationStore.addNotification({
    title: '🚨 SOS Emergency Alert Sent!',
    is_emergency: true,
  })

  // Auto hide after 5 seconds
  setTimeout(() => {
    showSosAlert.value = false
    sosActive.value = false
  }, 5000)
}

const dismissSOS = () => {
  showSosAlert.value = false
  sosActive.value = false
}

const callNumber = (number) => {
  window.location.href = `tel:${number}`
}

const callHospital = () => {
  const hospitalPhone = '1669'
  window.location.href = `tel:${hospitalPhone}`
}

// Route modal
const showRouteModal = ref(false)
const selectedRoute = ref({ name: '', address: '', distance: '', eta: '', path: '' })

const openRouteModal = (hospital) => {
  selectedRoute.value = hospital
  showRouteModal.value = true
}
const closeRouteModal = () => {
  showRouteModal.value = false
}

// Different route paths for each hospital
const routePaths = {
  'Bangkok Hospital': {
    path: 'M 10 30 L 50 30 L 50 15 L 120 15 L 120 25 L 190 25',
    roads: [
      'M 0 30 L 200 30', 'M 50 0 L 50 35', 'M 120 0 L 120 35', 'M 0 15 L 200 15', 'M 0 25 L 200 25'
    ],
    turns: [
      { icon: '↱', text: 'Turn right onto Sukhumvit Rd' },
      { icon: '↑', text: 'Continue straight 1.2 km' },
      { icon: '↰', text: 'Turn left onto hospital access' }
    ]
  },
  'Samitivej Hospital': {
    path: 'M 10 20 L 70 20 L 70 35 L 140 35 L 140 10 L 190 10',
    roads: [
      'M 0 20 L 200 20', 'M 0 35 L 200 35', 'M 0 10 L 200 10', 'M 70 0 L 70 40', 'M 140 0 L 140 40'
    ],
    turns: [
      { icon: '↳', text: 'Turn right onto Srinakarin Rd' },
      { icon: '↑', text: 'Continue 2.5 km straight' },
      { icon: '↰', text: 'Turn left at Pattanakarn intersection' },
      { icon: '↱', text: 'Turn right into hospital parking' }
    ]
  }
}

const currentRoute = computed(() => {
  return routePaths[selectedRoute.value.name] || routePaths['Bangkok Hospital']
})

// Premium handlers
const handleAIPremiumClick = () => {
  if (!isPremiumActive.value) {
    openPremiumModal()
  } else {
    router.push('/home/ai-analysis')
  }
}

const scrollContainer = ref(null)
let isDown = false
let startY, scrollTop

const handleMouseDown = (e) => {
  isDown = true
  scrollContainer.value.classList.add('active-drag')
  startY = e.pageY - scrollContainer.value.offsetTop
  scrollTop = scrollContainer.value.scrollTop
}
const handleMouseLeave = () => { isDown = false; scrollContainer.value.classList.remove('active-drag') }
const handleMouseUp = () => { isDown = false; scrollContainer.value.classList.remove('active-drag') }
const handleMouseMove = (e) => {
  if (!isDown) return
  e.preventDefault()
  const y = e.pageY - scrollContainer.value.offsetTop
  const walk = (y - startY) * 1.5
  scrollContainer.value.scrollTop = scrollTop - walk
}
</script>

<template>
  <div
    class="emergency-view"
    ref="scrollContainer"
    @mousedown="handleMouseDown"
    @mouseleave="handleMouseLeave"
    @mouseup="handleMouseUp"
    @mousemove="handleMouseMove"
  >
    <!-- SOS Alert Overlay -->
    <div v-if="showSosAlert" class="sos-overlay" @click="dismissSOS">
      <div class="sos-alert-box">
        <div class="sos-alert-icon"><IconSiren :size="80" color="white" /></div>
        <div class="sos-alert-text">SOS</div>
        <div class="sos-alert-sub">Emergency Alert Sent!</div>
        <div class="sos-alert-phone">
          <button class="sos-call-btn" @click.stop="callHospital">
            <IconPhone :size="20" color="#d9534f" /> Call Hospital
          </button>
        </div>
        <div class="sos-alert-dismiss">Tap anywhere to dismiss</div>
      </div>
    </div>

    <!-- Top Nav -->
    <header class="app-header">
      <button class="back-btn" @click="goBack"><IconBack :size="18" /></button>
      <h1>Emergency</h1>
      <div style="width: 24px;"></div>
    </header>

    <!-- SOS Button -->
    <section class="sos-section">
      <button
        class="sos-button"
        :class="{ active: sosActive }"
        @click="triggerSOS"
      >
        <span class="sos-icon"><IconWarning :size="32" color="white" /></span>
        <span class="sos-text">SOS</span>
        <span class="sos-sub">Press to Emergency</span>
      </button>
    </section>

    <!-- Hospital Quick Call -->
    <section class="card hospital-call-card">
      <h3><IconSiren :size="16" color="#d9534f" /> Call Hospital</h3>
      <button class="hospital-call-btn" @click="callHospital">
        <IconPhone :size="18" color="white" /> {{ userStore.user?.hospital || 'Emergency' }}
        <span class="call-text">Tap to Call</span>
      </button>
    </section>

    <!-- Hospital List -->
    <section class="card hospital-list-card">
      <h3>Nearby Hospitals</h3>
      <div class="hospital-items">
        <div class="hospital-item">
          <div class="hospital-info">
            <span class="hospital-name">Bangkok Hospital</span>
            <span class="hospital-address">123 Sukhumvit Rd</span>
          </div>
          <div class="hospital-actions">
            <button class="route-btn" @click="openRouteModal({ name: 'Bangkok Hospital', address: '123 Sukhumvit Rd', distance: '2.4 km', eta: '8 min' })"><IconLocation :size="16" color="white" /></button>
            <button class="call-btn" @click="callNumber('1669')"><IconPhone :size="16" /></button>
          </div>
        </div>
        <div class="hospital-item">
          <div class="hospital-info">
            <span class="hospital-name">Samitivej Hospital</span>
            <span class="hospital-address">456 Srinakarin Rd</span>
          </div>
          <div class="hospital-actions">
            <button class="route-btn" @click="openRouteModal({ name: 'Samitivej Hospital', address: '456 Srinakarin Rd', distance: '5.1 km', eta: '15 min' })"><IconLocation :size="16" color="white" /></button>
            <button class="call-btn" @click="callNumber('1669')"><IconPhone :size="16" /></button>
          </div>
        </div>
      </div>
    </section>

    <!-- Emergency Contacts -->
    <section class="card contacts-card">
      <h3>Emergency Contacts</h3>
      <div class="contact-items">
        <div
          v-for="(contact, idx) in contactStore.contacts"
          :key="idx"
          class="contact-item"
        >
          <div class="contact-left">
            <span class="contact-icon">
              <IconSiren v-if="contact.contact_type === 'emergency'" :size="24" />
              <IconDoctor v-else-if="contact.contact_type === 'doctor'" :size="24" />
              <IconPerson v-else :size="24" />
            </span>
            <div class="contact-info">
              <span class="contact-name">{{ contact.name }}</span>
              <span class="contact-number">{{ contact.phone }}</span>
            </div>
          </div>
          <button class="call-btn" @click="callNumber(contact.phone)"><IconPhone :size="16" /></button>
        </div>
      </div>
    </section>

    <!-- Bottom Nav-->
    <nav class="bottom-nav">
      <button class="nav-item" @click="router.push('/home')">
        <span class="nav-icon"><IconHome :size="20" /></span>
        <span class="nav-label">Home</span>
      </button>
      <button class="nav-item" @click="router.push('/home/monitor')">
        <span class="nav-icon"><IconTrendUp :size="20" /></span>
        <span class="nav-label">Monitor</span>
      </button>
      <button class="nav-item" :class="{ 'is-premium': !isPremiumActive }" @click="handleAIPremiumClick">
        <span class="nav-icon">
          <IconSmile :size="20" />
          <span v-if="!isPremiumActive" class="premium-lock">
            <IconLock :size="10" color="#f0ad4e" />
          </span>
        </span>
        <span class="nav-label">AI Analysis</span>
      </button>
      <button class="nav-item" @click="router.push('/home/profile')">
        <span class="nav-icon"><IconUser :size="20" /></span>
        <span class="nav-label">Profile</span>
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

    <!-- Route Modal -->
    <div v-if="showRouteModal" class="route-modal-overlay" @click="closeRouteModal">
      <div class="route-modal" @click.stop>
        <div class="modal-header">
          <h3>Route to {{ selectedRoute.name }}</h3>
          <button class="close-btn" @click="closeRouteModal">✕</button>
        </div>
        <div class="modal-body">
          <p class="route-address">{{ selectedRoute.address }}</p>
          <div class="route-info">
            <div class="route-stat">
              <span class="route-stat-val">{{ selectedRoute.distance }}</span>
              <span class="route-stat-label">Distance</span>
            </div>
            <div class="route-stat">
              <span class="route-stat-val">{{ selectedRoute.eta }}</span>
              <span class="route-stat-label">Est. Time</span>
            </div>
          </div>
          <!-- Mock map route visualization -->
          <div class="route-map">
            <svg class="route-map-svg" viewBox="0 0 200 50" preserveAspectRatio="xMidYMid meet">
              <!-- Background roads -->
              <g class="roads">
                <line v-for="(road, i) in currentRoute.roads" :key="'road-'+i"
                  :x1="road.split(' ')[1]" :y1="road.split(' ')[2]"
                  :x2="road.split(' ')[4]" :y2="road.split(' ')[5]"
                  stroke="#ddd" stroke-width="3"/>
              </g>
              <!-- Main route path -->
              <path :d="currentRoute.path" stroke="#449284" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              <!-- Route arrow -->
              <polygon :points="currentRoute.name === 'Bangkok Hospital' ? '185,20 195,25 185,30' : '185,5 195,10 185,15'" fill="#449284"/>
              <!-- Start point -->
              <circle cx="10" :cy="currentRoute.name === 'Bangkok Hospital' ? 30 : 20" r="5" fill="#5DC6BA"/>
              <!-- End point -->
              <circle :cx="currentRoute.name === 'Bangkok Hospital' ? 190 : 190" :cy="currentRoute.name === 'Bangkok Hospital' ? 25 : 10" r="5" fill="#d9534f"/>
            </svg>
          </div>
          <div class="route-meta">
            <div class="route-turn" v-for="(turn, i) in currentRoute.turns" :key="i">
              <span class="turn-icon">{{ turn.icon }}</span>
              <span>{{ turn.text }}</span>
            </div>
          </div>
          <button class="route-start-btn" @click="closeRouteModal">
            <IconPhone :size="16" /> Start Navigation
          </button>
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
.emergency-view {
  background-color: #fcf8f2;
  width: 100%;
  max-width: 600px;
  min-height: 100%;
  height: 100%;
  margin: 0 auto;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: grab;
  user-select: none;
}
.emergency-view.active-drag { cursor: grabbing; }
.emergency-view::-webkit-scrollbar { display: none; }

/* Header */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #d1ebd9;
  padding: 16px;
  border-radius: 24px;
  margin: -16px -16px 0 -16px;
  position: sticky;
  top: -16px;
  z-index: 10;
  width: calc(100% + 32px);
  box-sizing: border-box;
}
.back-btn {
  background: none;
  border: none;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  color: #333;
}
.app-header h1 {
  font-size: 16px;
  font-weight: 600;
}

/* SOS Section */
.sos-section {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}
.sos-button {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #d9534f, #c9302c);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(217, 83, 79, 0.4);
  transition: all 0.2s;
}
.sos-button:active {
  transform: scale(0.95);
  box-shadow: 0 4px 12px rgba(217, 83, 79, 0.3);
}
.sos-button.active {
  animation: pulse 0.5s infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.sos-icon { font-size: 32px; }
.sos-text {
  font-size: 28px;
  font-weight: 600;
  margin: 4px 0;
}
.sos-sub {
  font-size: 10px;
  opacity: 0.9;
}

/* Card Base */
.card {
  background: white;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.01);
}
.card h3 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

/* Map */
.map-card {
  padding: 12px;
}
.map-placeholder {
  background: linear-gradient(135deg, #e8f4ea, #d6e8e0);
  border-radius: 16px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  margin-bottom: 12px;
}
.map-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 2;
}
.map-icon { font-size: 32px; }
.map-label {
  font-size: 14px;
  font-weight: 600;
  color: #2e6b5e;
}
.map-distance {
  font-size: 12px;
  color: #555;
}
.route-line {
  position: absolute;
  width: 80%;
  height: 2px;
  background: repeating-linear-gradient(
    90deg,
    #449284 0px,
    #449284 8px,
    transparent 8px,
    transparent 16px
  );
  bottom: 30px;
  opacity: 0.6;
}
.direction-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: #449284;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

/* Hospital List */
.hospital-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hospital-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9f9f9;
  border-radius: 12px;
  padding: 12px;
}
.hospital-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}
.hospital-actions { display: flex; gap: 8px; align-items: center; }
.route-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #5DC6BA;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hospital-address {
  display: block;
  font-size: 11px;
  color: #888;
  margin-top: 2px;
}
.hospital-meta {
  text-align: right;
}
.hospital-distance {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #d9534f;
}
.hospital-time {
  display: block;
  font-size: 11px;
  color: #888;
}

/* Contacts */
.contact-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.contact-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.contact-icon { font-size: 24px; }
.contact-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}
.contact-number {
  display: block;
  font-size: 12px;
  color: #888;
}
.call-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #d1ebd9;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* SOS Alert Overlay */
.sos-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(217, 83, 79, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: sosFlash 0.5s infinite;
}

@keyframes sosFlash {
  0%, 100% { background: rgba(217, 83, 79, 0.95); }
  50% { background: rgba(255, 0, 0, 0.95); }
}

.sos-alert-box {
  text-align: center;
  color: white;
  animation: sosPulse 0.5s ease-in-out infinite;
}

@keyframes sosPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.sos-alert-icon {
  font-size: 80px;
  animation: sosBounce 0.3s ease-in-out infinite;
}

@keyframes sosBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.sos-alert-text {
  font-size: 72px;
  font-weight: 600;
  margin: 20px 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.sos-alert-sub {
  font-size: 20px;
  margin-bottom: 30px;
}

.sos-alert-phone {
  margin-bottom: 20px;
}

.sos-call-btn {
  background: white;
  color: #d9534f;
  border: none;
  border-radius: 50px;
  padding: 20px 40px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.sos-alert-dismiss {
  font-size: 12px;
  opacity: 0.8;
}

/* Hospital Call Card */
.hospital-call-card { background: linear-gradient(135deg, #fcdcdb, #f5c6c5); border: 2px solid #d9534f; }
.hospital-call-card h3 { text-align: center; margin-bottom: 12px; }
.hospital-call-btn {
  width: 100%; background: #d9534f; color: white; border: none; border-radius: 16px;
  padding: 16px; font-size: 16px; font-weight: 600; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.call-text { font-size: 11px; font-weight: normal; opacity: 0.9; }

/* Bottom Nav */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
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
.nav-item.active { color: #5DC6BA; }
.nav-item.active::after { width: 24px; }
.nav-icon { font-size: 18px; position: relative; display: flex; align-items: center; justify-content: center; }
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
.nav-label { font-size: 10px; font-weight: 500; }

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

.premium-modal .modal-header {
  background: linear-gradient(135deg, #5DC6BA 0%, #449284 100%);
  padding: 20px;
  text-align: center;
}

.premium-modal .modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.premium-modal .modal-body {
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

/* Route Modal */
.route-modal-overlay {
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
.route-modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 380px;
  overflow: hidden;
}
.route-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}
.route-modal .modal-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0;
}
.route-modal .close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #888;
}
.route-modal .modal-body {
  padding: 16px;
}
.route-address {
  font-size: 12px;
  color: #888;
  margin-bottom: 12px;
}
.route-info {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.route-stat {
  flex: 1;
  background: #f0f7ff;
  border-radius: 12px;
  padding: 10px;
  text-align: center;
}
.route-stat-val {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #2b5c8f;
}
.route-stat-label {
  display: block;
  font-size: 10px;
  color: #888;
  margin-top: 2px;
}
.route-map {
  background: linear-gradient(135deg, #e8f4ea, #d6e8e0);
  border-radius: 16px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}
.route-map-svg {
  width: 100%;
  height: 100%;
}
.route-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.route-turn {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #555;
}
.turn-icon {
  width: 24px;
  height: 24px;
  background: #f0f7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #2b5c8f;
}
.route-start-btn {
  width: 100%;
  background: #5DC6BA;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
