<script setup>
import { reactive } from "vue";
import common from "../common/common";
import utils from "../common/utils";
const props = defineProps(['message']);
let state = reactive({
  i18n: common.i18n(),
});

function getContent(){
  let { i18n } = state;
  let { message } = props;
  let name = message.isSender ? i18n.COMMON.YOU : message.sender.name;
  return utils.templateFormat(i18n.MESSAGE_RECALL, { name });
}
</script>

<template>
  <div class="tyn-reply-separator">
    <span class="tyn-separator-item">{{ getContent() }}</span>
  </div>
</template>
