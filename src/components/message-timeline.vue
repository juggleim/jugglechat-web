<script setup>
  const props = defineProps(['message']);
</script>

<template>
  <div class="tyn-reply-separator">
    <span class="tyn-separator-item">{{ props.message.sentTime }}</span>
  </div>
</template>
