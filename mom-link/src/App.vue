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
  margin: 0;
}

.phone-wrapper {
  width: 100%;
  max-width: 600px;
  min-height: 100dvh;
  min-height: 100vh;
  margin: 0 auto;
  background-color: #fcf8f2;
  position: relative;
  overflow: hidden;
}

@supports (height: 100dvh) {
  .phone-wrapper {
    min-height: 100dvh;
    height: 100dvh;
  }
}
</style>
