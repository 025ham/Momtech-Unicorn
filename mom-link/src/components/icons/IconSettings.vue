<!-- Settings / Gear icon -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" :fill="color"/>
    <path d="M12 2V4M12 20V22M22 12H20M4 12H2M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07M19.07 19.07L17.66 17.66M6.34 6.34L4.93 4.93" :stroke="color" stroke-width="2" stroke-linecap="round"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 20 },
  color: { type: String, default: '#888888' }
})
</script>
