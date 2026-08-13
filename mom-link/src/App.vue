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
  font-family: 'Kanit', sans-serif;
  background-color: #fcf8f2;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

body {
  margin: 0;
  height: 100%;
}

.phone-wrapper {
  font-family: 'Kanit', sans-serif;
  height: 100dvh;
  margin: 0 auto;
  background-color: #fcf8f2;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
