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
  background-color: #fcf8f2;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

body {
  margin: 0;
  height: 100vh;
}

.phone-wrapper {
  width: 100%;
  max-width: 600px;
  height: 100vh;
  height: 100dvh;
  margin: 0 auto;
  background-color: #fcf8f2;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
