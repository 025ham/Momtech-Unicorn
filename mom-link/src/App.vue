<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="phone-wrapper">
    <RouterView />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  background-color: #e5e5e5;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

body {
  display: flex;
  justify-content: center;
}

.phone-wrapper {
  width: 430px;
  min-height: 100vh;
  max-height: 100vh;
  background-color: #fcf8f2;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 40px;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* Smooth scroll on iOS */
}

/* Mobile: fill entire screen, no radius or shadow */
@media (max-width: 430px) {
  html, body {
    background-color: #fcf8f2;
  }

  body {
    justify-content: flex-start;
  }

  .phone-wrapper {
    width: 100%;
    max-height: 100vh;
    max-height: 100dvh; /* Dynamic viewport height for mobile browsers */
    border-radius: 0;
    box-shadow: none;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>