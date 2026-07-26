<!-- Male Person icon (blue) -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="7" r="4" fill="#5BA4F5"/>
    <path d="M5 21V19C5 16.7909 6.79086 15 9 15H15C17.2091 15 19 16.7909 19 19V21" fill="#5BA4F5"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#5BA4F5' }
})
</script>
