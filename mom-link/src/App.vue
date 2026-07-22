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
}

body {
  display: flex;
  justify-content: center;
}

.phone-wrapper {
  width: 430px;
  min-height: 100vh;
  background-color: #fcf8f2;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 40px;
  overflow-x: hidden;
}

@media (max-width: 430px) {
  .phone-wrapper {
    width: 100%;
    border-radius: 0;
  }
}
</style>