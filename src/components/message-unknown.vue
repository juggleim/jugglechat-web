<script setup>
import messageUtils from "./message-utils";
import Avatar from "./avatar.vue";
const props = defineProps(['message']);

</script>

<template>
  <div class="tyn-reply-avatar">
 <div class="tyn-media">
      <Avatar 
        :cls="'tyn-size-md jg-size-md '"
        :avatar="props.message.sender.portrait"
        :name="props.message.sender.name">
      </Avatar>
    </div>
  </div>
  <div class="tyn-reply-group">
    <span class="jg-sender-name" v-if="messageUtils.isGroup(props.message)">{{ props.message.sender.name }}</span>
    <div class="tyn-reply-bubble">
      <div class="tyn-reply-text">[UnknownMessage]</div>
    </div>
  </div>
</template>
