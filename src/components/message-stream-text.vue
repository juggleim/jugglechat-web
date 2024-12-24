<script setup>
const props = defineProps(['message']);
const emit = defineEmits(['']);

import { reactive, watch } from "vue";
import utils from "../common/utils";
import im from "../common/im";
import messageUtils from "./message-utils";
import { REG_EXP } from "../common/enum";

let initContent = '';
utils.forEach(props.message.streams, (stream) => {
  initContent += stream.content.content;
});

let state = reactive({
  content: initContent,
});

let list = [];
let isEndStream = false;
watch(() => props.message.streamMsg.streams, () => {
  let { streamMsg } = props.message;
  streamMsg = streamMsg || {};
  console.log('streamMsg', streamMsg)
  let { isEnd = false, streams = []} = streamMsg;
  isEndStream = isEnd;
  utils.forEach(streams, (stream) => {
    let { content } = stream;
    list = list.concat(content.content.split(''));
  });
});

let interval = setInterval(() => {
  let items = list.splice(0, 1);
  let letter = items[0] || '';
  if(letter.length > 0){
    state.content += letter;
  }
  if(utils.isEqual(letter.length, 0) && isEndStream){
    clearInterval(interval);
  }
}, 50)

function getContent(content){
  content = content.replace(REG_EXP.LINK, (current, match) => {
    return `<a href="${match}" target="_blank" >${match}</a>`;
  });
  return content;
}

</script>

<template>
  <div class="tyn-reply-avatar">
    <div class="tyn-media tyn-size-md">
      <div class="tyn-avatar tyn-s-avatar" :style="{ 'background-image': 'url(' + props.message.sender.portrait + ')' }"></div>
    </div>
  </div>
  <div class="tyn-reply-group">
    <div class="tyn-reply-bubble" :messageid="props.message.messageId" :messageId="props.message.tid">
      <div class="tyn-reply-text jg-stream-text">
        <div class="stream-loader" v-if="state.content.length == 0"></div>
        <span v-html="getContent(state.content)"></span>
        <div class="jg-stream-completed" v-if="props.message.streamMsg.isEnd">已完成</div>
      </div>
    </div>
  </div>
</template>
