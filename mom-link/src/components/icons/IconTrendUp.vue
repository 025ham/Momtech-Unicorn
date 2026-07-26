<!-- Trend / Monitor icon -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" :stroke="color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="22,7 17,7 17,12" :stroke="color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#888888' }
})
</script>
