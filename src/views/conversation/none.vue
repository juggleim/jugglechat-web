<script setup>
import { reactive } from "vue";
const props = defineProps(['conversation']);
const emit = defineEmits(["ondraft"]);


let state = reactive({
});
</script>
<template>
  <div class="tyn-main tyn-chat-content aside-collapsed">
    <div class="tyn-chat-body tyn-chat-none-box">
      <div class="tyn-chat-none-bg">
        <div class="intro-sub">
            <h1 class="intro-text">Select a chat to start messaging</h1>
        </div>
      </div>
    </div>
  </div>
</template>