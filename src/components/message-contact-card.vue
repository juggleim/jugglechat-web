<script setup>
import messageUtils from "./message-utils";
const props = defineProps(['message']);

</script>

<template>
  <div class="tyn-reply-avatar">
    <div class="tyn-media tyn-size-md">
      <div class="tyn-avatar tyn-s-avatar" :style="{ 'background-image': 'url(' + props.message.sender.portrait + ')' }"></div>
    </div>
  </div>
  <div class="tyn-reply-group">
    <span class="jg-sender-name" v-if="messageUtils.isGroup(props.message)">{{ props.message.sender.name }}</span>
    <div class="tyn-reply-bubble">
      <div class="tyn-reply-text">
        <div class="jg-contact-card">
          <div class="jg-contact-info">
            <div class="tyn-media tyn-size-md">
              <div class="tyn-avatar tyn-s-avatar" :style="{ 'background-image': 'url(' + props.message.content.portrait + ')' }"></div>
            </div>
            <div class="jg-contact-card-title">{{ props.message.content.name }}</div>
          </div>
          <div class="jg-contact-memo">[个人名片]</div>
        </div>
      </div>
    </div>
  </div>
</template>
