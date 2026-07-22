<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEmergencyStore } from '@/stores/emergency'

const router = useRouter()
const emergencyStore = useEmergencyStore()

const goBack = () => {
  router.push('/')
}

// Emergency state
const sosActive = ref(false)

const hospitals = ref([
  { name: 'Bangkok Hospital', distance: '1.2 km', time: '5 min', address: '123 Sukhumvit Rd' },
  { name: 'Samitivej Hospital', distance: '2.5 km', time: '10 min', address: '456 Srinakarin Rd' },
  { name: 'Burns Society Hospital', distance: '3.8 km', time: '15 min', address: '789 Rama IV Rd' },
])

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

const triggerSOS = () => {
  sosActive.value = true
  // In real app: trigger phone call, notify contacts, etc.
  setTimeout(() => {
    sosActive.value = false
  }, 3000)
}

const callNumber = (number) => {
  // In real app: use tel: or call API
  console.log('Calling:', number)
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

    <!-- Map Placeholder -->
    <section class="card map-card">
      <div class="map-placeholder">
        <div class="map-content">
          <span class="map-icon">📍</span>
          <span class="map-label">Bangkok Hospital</span>
          <span class="map-distance">1.2 km • 5 min drive</span>
          <div class="route-line"></div>
        </div>
      </div>
      <button class="direction-btn">🗺️ Get Directions</button>
    </section>

    <!-- Hospital List -->
    <section class="card hospital-list-card">
      <h3>Nearby Hospitals</h3>
      <div class="hospital-items">
        <div
          v-for="(hospital, idx) in hospitals"
          :key="idx"
          class="hospital-item"
        >
          <div class="hospital-info">
            <span class="hospital-name">{{ hospital.name }}</span>
            <span class="hospital-address">{{ hospital.address }}</span>
          </div>
          <div class="hospital-meta">
            <span class="hospital-distance">{{ hospital.distance }}</span>
            <span class="hospital-time">{{ hospital.time }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Emergency Contacts -->
    <section class="card contacts-card">
      <h3>Emergency Contacts</h3>
      <div class="contact-items">
        <div
          v-for="(contact, idx) in emergencyStore.emergencyContacts"
          :key="idx"
          class="contact-item"
        >
          <div class="contact-left">
            <span class="contact-icon">
              {{ contact.type === 'emergency' ? '🚨' : contact.type === 'doctor' ? '👩‍⚕️' : '👨' }}
            </span>
            <div class="contact-info">
              <span class="contact-name">{{ contact.name }}</span>
              <span class="contact-number">{{ contact.number }}</span>
            </div>
          </div>
          <button class="call-btn" @click="callNumber(contact.number)">📞</button>
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
