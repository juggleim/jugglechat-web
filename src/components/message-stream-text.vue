<script setup>
const props = defineProps(['message']);
const emit = defineEmits(['']);

import { reactive, watch } from "vue";
import Avatar from "./avatar.vue";
import utils from "../common/utils";
import im from "../common/im";
import messageUtils from "./message-utils";
import { REG_EXP } from "../common/enum";
import common from "../common/common";

let originContent = props.message.content.content;
let state = reactive({
  content: common.formatMarkdown(originContent),
});

let list = [];
let isEndStream = false;
watch(() => props.message.streamMsg.streams, (val) => {
  let { isEnd } = props.message.streamMsg;
  if(isEnd){
    originContent = val;
    state.content = common.formatMarkdown(originContent);
  }else{
    list = list.concat(val.split(''));
  }
  
});

let interval = setInterval(() => {
  let items = list.splice(0, 1);
  let letter = items[0] || '';
  if(letter.length > 0){
    originContent += letter
    state.content = common.formatMarkdown(originContent);
  }
  if(utils.isEqual(letter.length, 0) && isEndStream){
    clearInterval(interval);
  }
}, 50)

function getContent(content){
  return content;
}

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
    <div class="tyn-reply-bubble" :messageid="props.message.messageId" :messageId="props.message.tid">
      <div class="markdown-body tyn-reply-text jg-stream-text">
        <div v-html="getContent(state.content)"></div>
        <!-- <div class="jg-stream-completed" v-if="props.message.streamMsg.isEnd">已完成</div> -->
      </div>
    </div>
  </div>
</template>
