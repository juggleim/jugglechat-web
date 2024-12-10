<script setup>
import { reactive } from "vue";
import GroupReads from "./group-reads.vue";
import utils from "../common/utils";
import messageUtils from "./message-utils";
import im from "../common/im";
import common from "../common/common";

const props = defineProps(["message"]);
let juggleCall = im.getRTCEngine();
let { CallFinishedReason } = im;

let state = reactive({
  msg: getMsg()
});

function getMsg(){
  let reason = juggleCall.convertMsgReason(props.message);
  let { content: { duration } } = props.message;
  let text = '';
  if(duration > 0){
    text = common.formatSeconds(Math.floor(duration/1000));
  }else{
    if(utils.isEqual(CallFinishedReason.HANGUP, reason)){
      text = '已挂断';
    }
    if(utils.isEqual(CallFinishedReason.DECLINE, reason)){
      text = '已拒接';
    }
    if(utils.isEqual(CallFinishedReason.BUSY, reason)){
      text = '自己忙线';
    }
    if(utils.isEqual(CallFinishedReason.NO_RESPONSE, reason)){
      text = '未接听';
    }
    if(utils.isEqual(CallFinishedReason.CANCEL, reason)){
      text = '已取消';
    }
    if(utils.isEqual(CallFinishedReason.OTHER_SIDE_HANGUP, reason)){
      text = '对方挂断';
    }
    if(utils.isEqual(CallFinishedReason.OTHER_SIDE_DECLINE, reason)){
      text = '对方拒接';
    }
    if(utils.isEqual(CallFinishedReason.OTHER_SIDE_BUSY, reason)){
      text = '对方忙线';
    }
    if(utils.isEqual(CallFinishedReason.OTHER_SIDE_NO_RESPONSE, reason)){
      text = '对方未接听';
    }
    if(utils.isEqual(CallFinishedReason.OTHER_SIDE_CANCEL, reason)){
      text = '对方取消';
    }
    if(utils.isEqual(CallFinishedReason.NETWORK_ERROR, reason)){
      text = '网络出错';
    }
  }
  
  return text; 
}

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
      <div class="tyn-reply-text tyn-reply-call-text wr wr-rtc-status-hangup">{{ state.msg }}</div>
    </div>
  </div>
</template>
 