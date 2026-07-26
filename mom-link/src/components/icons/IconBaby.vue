<!-- Baby icon with gradient (pink & blue feet) -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="7.5" cy="9.5" rx="3.5" ry="4" fill="#FF7A8A"/>
    <ellipse cx="16.5" cy="9.5" rx="3.5" ry="4" fill="#5BA4F5"/>
    <ellipse cx="7.5" cy="9.5" rx="1.5" ry="2" fill="white" fill-opacity="0.5"/>
    <ellipse cx="16.5" cy="9.5" rx="1.5" ry="2" fill="white" fill-opacity="0.5"/>
    <path d="M6 14C6 14 8 15.5 8 15.5" stroke="white" stroke-width="1" stroke-linecap="round" stroke-opacity="0.6"/>
    <path d="M16 14C16 14 18 15.5 18 15.5" stroke="white" stroke-width="1" stroke-linecap="round" stroke-opacity="0.6"/>
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 28 },
  color: { type: String, default: 'currentColor' },
  heart: { type: Boolean, default: false }
})
</script>
