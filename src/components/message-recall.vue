<script setup>
  const props = defineProps(['message']);
</script>

<template>
  <div class="tyn-reply-separator">
    <span class="tyn-separator-item">{{ props.message.isSender ? '你' : props.message.sender.name }} 撤回了一条消息</span>
  </div>
</template>
