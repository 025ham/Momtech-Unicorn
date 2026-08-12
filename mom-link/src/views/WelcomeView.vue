<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const getStarted = () => {
  router.push('/home')
}
</script>

<template>
  <div class="welcome-view">
    <div class="welcome-content">
      <div class="logo-area">
        <div class="logo-circle">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" fill="#d1ebd9" stroke="#5DC6BA" stroke-width="2"/>
            <path d="M40 20C30 20 25 28 25 36C25 48 40 55 40 55C40 55 55 48 55 36C55 28 50 20 40 20Z" fill="#5DC6BA" opacity="0.3"/>
            <path d="M40 24V40L52 46" stroke="#5DC6BA" stroke-width="3" stroke-linecap="round"/>
            <circle cx="40" cy="40" r="4" fill="#5DC6BA"/>
          </svg>
        </div>
        <h1 class="app-name">Welcome to MomLink</h1>
        <p class="app-tagline">Your pregnancy companion</p>
      </div>

      <div class="features-preview">
        <div class="feature-item">
          <span class="feature-text">| Track your health</span>
        </div>
        <div class="feature-item">
          <span class="feature-text">| Monitor baby movement</span>
        </div>
        <div class="feature-item">
          <span class="feature-text">| Share with doctor 24/7</span>
        </div>
      </div>

      <button class="get-started-btn" @click="getStarted">
        Get Started
      </button>
    </div>
  </div>
</template>

<style scoped>
.welcome-view {
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #fcf8f2 0%, #e8f5e9 50%, #d1ebd9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  text-align: center;
  max-width: 320px;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.logo-circle {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.app-name {
  font-size: 32px;
  font-weight: bold;
  color: #2e6b5e;
  margin: 0;
}

.app-tagline {
  font-size: 16px;
  color: #5a7d72;
  margin: 0;
}

.features-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #555;
}

.feature-icon {
  font-size: 20px;
}

.feature-text {
  font-weight: 500;
}

.get-started-btn {
  background: linear-gradient(135deg, #5DC6BA 0%, #449284 100%);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 16px 48px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(93, 198, 186, 0.4);
  transition: all 0.3s ease;
  margin-top: 20px;
}

.get-started-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(93, 198, 186, 0.5);
}

.get-started-btn:active {
  transform: translateY(0);
}
</style>
