<script setup>
import { reactive } from "vue";
import utils from "../common/utils";
import common from "../common/common";
const props = defineProps(['message']);
let { content: { type },isSender, sender, conversationTitle } = props.message;

let state = reactive({
  i18n: common.i18n(),
});
let { i18n } = state;

let opName = type == 0 ? i18n.MESSAGE_FRD_NTF.OP_ADD : i18n.MESSAGE_FRD_NTF.OP_AGREE;

let tip = utils.templateFormat(i18n.MESSAGE_FRD_NTF.OTHER, { 
  name: conversationTitle,
  op: opName
 });

 if(isSender){
  tip = utils.templateFormat(i18n.MESSAGE_FRD_NTF.SELF, { 
    name: conversationTitle,
    op: opName
  });
}
utils.extend(state, { label: tip });

</script>

<template>
  <div class="tyn-reply-separator">
    <span class="tyn-separator-item">
      {{ state.label }}
    </span>
  </div>
</template>
