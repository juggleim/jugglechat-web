<script setup>
import im from "../common/im";
import { reactive, watch } from "vue";
import utils from "../common/utils";
const props = defineProps(['message']);
let state = reactive({
  content: '',
  sender: {},
  name: ''
});

let format = (msg) => {
  if (msg && msg.content) {
    let content = im.msgShortFormat(props.message);
    utils.extend(state, { content, sender: msg.sender, name: msg.name });
  }else{
    utils.extend(state, { content: '', sender: {}, name: '' });
  }
};
format(props.message);
watch(() => props.message, (msg) => {
  format(msg);
})
</script>
<template>
  <div v-if="state.name" class="tyn-message-refer wr" :messageid="props.message.messageId">回复 {{ state.sender.name }} : {{ state.content }}</div>
</template>
