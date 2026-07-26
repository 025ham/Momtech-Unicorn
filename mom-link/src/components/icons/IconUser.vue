<!-- User / Profile icon -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" :fill="color"/>
    <path d="M4 20.5C4 17.4624 6.68629 15 10 15H14C17.3137 15 20 17.4624 20 20.5V21H4V20.5Z" :fill="color"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#888888' }
})
</script>
