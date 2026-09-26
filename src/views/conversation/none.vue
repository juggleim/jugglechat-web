<script setup>
import { reactive } from "vue";
import common from "../../common/common";
const props = defineProps(['conversation']);
const emit = defineEmits(["ondraft"]);


let state = reactive({
  i18n: common.i18n(),
});
</script>
<template>
  <div class="tyn-main tyn-chat-content aside-collapsed">
    <div class="tyn-chat-body tyn-chat-none-box">
      <div class="tyn-chat-none-bg">
        <div class="intro-sub">
            <h1 class="intro-text">{{ state.i18n.UI.SELECT_CHAT }}</h1>
        </div>
      </div>
    </div>
  </div>
</template>
