<!-- Trash / Delete icon (red) -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="3,6 5,6 21,6" stroke="#FF5A5A" stroke-width="2" stroke-linecap="round"/>
    <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6L18.1 19.1C18.03 20.1 17.1 21 16.1 21H7.9C6.9 21 5.97 20.1 5.9 19.1L5 6" stroke="#FF5A5A" stroke-width="2" stroke-linecap="round"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: '#FF5A5A' }
})
</script>
