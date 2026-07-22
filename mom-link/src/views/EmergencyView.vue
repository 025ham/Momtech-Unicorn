<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useContactStore } from '@/stores/contacts'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const contactStore = useContactStore()
const userStore = useUserStore()

const goBack = () => router.push('/')

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
        <div class="sos-alert-icon">🚨</div>
        <div class="sos-alert-text">SOS</div>
        <div class="sos-alert-sub">Emergency Alert Sent!</div>
        <div class="sos-alert-phone">
          <button class="sos-call-btn" @click.stop="callHospital">
            📞 Call Hospital
          </button>
        </div>
        <div class="sos-alert-dismiss">Tap anywhere to dismiss</div>
      </div>
    </div>

    <!-- Top Nav -->
    <header class="app-header">
      <button class="back-btn" @click="goBack">❮</button>
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
        <span class="sos-icon">⚠️</span>
        <span class="sos-text">SOS</span>
        <span class="sos-sub">Press to Emergency</span>
      </button>
    </section>

    <!-- Hospital Quick Call -->
    <section class="card hospital-call-card">
      <h3>🚑 Call Hospital</h3>
      <button class="hospital-call-btn" @click="callHospital">
        📞 {{ userStore.user?.hospital || 'Emergency' }}
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
          <button class="call-btn" @click="callNumber('1669')">📞</button>
        </div>
        <div class="hospital-item">
          <div class="hospital-info">
            <span class="hospital-name">Samitivej Hospital</span>
            <span class="hospital-address">456 Srinakarin Rd</span>
          </div>
          <button class="call-btn" @click="callNumber('1669')">📞</button>
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
              {{ contact.contact_type === 'emergency' ? '🚨' : contact.contact_type === 'doctor' ? '👩‍⚕️' : '👨' }}
            </span>
            <div class="contact-info">
              <span class="contact-name">{{ contact.name }}</span>
              <span class="contact-number">{{ contact.phone }}</span>
            </div>
          </div>
          <button class="call-btn" @click="callNumber(contact.phone)">📞</button>
        </div>
      </div>
    </section>

    <!-- Bottom Nav-->
    <nav class="bottom-nav">
      <button class="nav-item" @click="router.push('/')">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Home</span>
      </button>
      <button class="nav-item" @click="router.push('/monitor')">
        <span class="nav-icon">📈</span>
        <span class="nav-label">Monitor</span>
      </button>
      <button class="nav-item" @click="router.push('/ai-analysis')">
        <span class="nav-icon">😊</span>
        <span class="nav-label">AI Analysis</span>
      </button>
      <button class="nav-item" @click="router.push('/profile')">
        <span class="nav-icon">👤</span>
        <span class="nav-label">Profile</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.emergency-view {
  background-color: #fcf8f2;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 110px;
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
  font-weight: bold;
  cursor: pointer;
  color: #333;
}
.app-header h1 {
  font-size: 16px;
  font-weight: bold;
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
  font-weight: bold;
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
  font-weight: bold;
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
  font-weight: bold;
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
  font-weight: bold;
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
  font-weight: bold;
  color: #333;
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
  font-weight: bold;
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
  font-weight: bold;
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
  font-weight: bold;
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
  font-weight: bold;
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
  padding: 16px; font-size: 16px; font-weight: bold; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.call-text { font-size: 11px; font-weight: normal; opacity: 0.9; }

/* Bottom Nav */
.bottom-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  display: flex;
  justify-content: space-around;
  padding: 12px 0 24px 0;
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
}
.nav-item.active { color: #449284; }
.nav-icon { font-size: 18px; }
.nav-label { font-size: 10px; font-weight: 500; }
</style>
