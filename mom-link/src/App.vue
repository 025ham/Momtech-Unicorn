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

body {
  background-color: #e5e5e5;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.phone-wrapper {
  width: 100%;
  max-width: 430px; 
  height: 100vh;
  max-height: 850px; 
  background-color: #fcf8f2;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 40px;
  overflow: hidden; 
}
</style>