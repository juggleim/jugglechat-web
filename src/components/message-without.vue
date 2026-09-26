<script setup>
import { reactive } from "vue";
import common from "../common/common";
const props = defineProps(['message']);
let state = reactive({
  i18n: common.i18n(),
});
</script>
<template>
  <div class="tyn-reply-separator tyn-without">
    <span class="tyn-separator-item">{{ state.i18n.MESSAGE_NONE }}</span>
    </div>
</template>
