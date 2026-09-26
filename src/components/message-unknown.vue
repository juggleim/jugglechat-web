<script setup>
import messageUtils from "./message-utils";
import Avatar from "./avatar.vue";
import { reactive } from "vue";
import common from "../common/common";
const props = defineProps(['message']);
let state = reactive({
  i18n: common.i18n(),
});

</script>

<template>
  <div class="tyn-reply-separator">
    <span class="tyn-separator-item">
      {{ state.i18n.MESSAGE_UNKNOWN }}
    </span>
  </div>
</template>
