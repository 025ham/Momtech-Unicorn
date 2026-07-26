<!-- Feet with heart icon (blue) -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="8" cy="10" rx="3" ry="3.5" fill="#5BA4F5"/>
    <ellipse cx="16" cy="10" rx="3" ry="3.5" fill="#5BA4F5"/>
    <ellipse cx="8" cy="10" rx="1.2" ry="1.8" fill="white" fill-opacity="0.4"/>
    <ellipse cx="16" cy="10" rx="1.2" ry="1.8" fill="white" fill-opacity="0.4"/>
    <path d="M12 10C12 10 11 11.5 12 12.5C13 11.5 12 10 12 10Z" fill="white" fill-opacity="0.8"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
})
</script>
