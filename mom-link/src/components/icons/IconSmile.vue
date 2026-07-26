<!-- Smiley / AI Analysis icon -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" :fill="color"/>
    <circle cx="8.5" cy="10" r="1.5" fill="white"/>
    <circle cx="15.5" cy="10" r="1.5" fill="white"/>
    <path d="M8 14.5C8.8 16.5 10.3 18 12 18C13.7 18 15.2 16.5 16 14.5" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#888888' }
})
</script>
