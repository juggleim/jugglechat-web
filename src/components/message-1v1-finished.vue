<script setup>
import { reactive } from "vue";
import GroupReads from "./group-reads.vue";
import Avatar from "./avatar.vue";
import utils from "../common/utils";
import messageUtils from "./message-utils";
import im from "../common/im";
import common from "../common/common";

const props = defineProps(["message"]);
let juggleCall = im.getRTCEngine();
let { CallFinishedReason } = im;

let state = reactive({
  msg: {},
  i18n: common.i18n(),
});
utils.extend(state, { msg: getMsg() });
function getMsg(){
  let { i18n } = state;
  let reason = juggleCall.convertMsgReason(props.message);
  let { content: { duration } } = props.message;
  let text = '';
  if(duration > 0){
    text = common.formatSeconds(Math.floor(duration/1000));
  }else{
    if(utils.isEqual(CallFinishedReason.HANGUP, reason)){
      text = i18n.CALL_FINISHED.HANGUP;
    }
    if(utils.isEqual(CallFinishedReason.DECLINE, reason)){
      text = i18n.CALL_FINISHED.DECLINE;
    }
    if(utils.isEqual(CallFinishedReason.BUSY, reason)){
      text = i18n.CALL_FINISHED.BUSY;
    }
    if(utils.isEqual(CallFinishedReason.NO_RESPONSE, reason)){
      text = i18n.CALL_FINISHED.NO_RESPONSE;
    }
    if(utils.isEqual(CallFinishedReason.CANCEL, reason)){
      text = i18n.CALL_FINISHED.CANCEL;
    }
    if(utils.isEqual(CallFinishedReason.OTHER_SIDE_HANGUP, reason)){
      text = i18n.CALL_FINISHED.REMOTE_HANGUP;
    }
    if(utils.isEqual(CallFinishedReason.OTHER_SIDE_DECLINE, reason)){
      text = i18n.CALL_FINISHED.REMOTE_DECLINE;
    }
    if(utils.isEqual(CallFinishedReason.OTHER_SIDE_BUSY, reason)){
      text = i18n.CALL_FINISHED.REMOTE_BUSY;
    }
    if(utils.isEqual(CallFinishedReason.OTHER_SIDE_NO_RESPONSE, reason)){
      text = i18n.CALL_FINISHED.REMOTE_NO_RESPONSE;
    }
    if(utils.isEqual(CallFinishedReason.OTHER_SIDE_CANCEL, reason)){
      text = i18n.CALL_FINISHED.REMOTE_CANCEL;
    }
    if(utils.isEqual(CallFinishedReason.NETWORK_ERROR, reason)){
      text = i18n.CALL_FINISHED.NETWORK_ERROR;
    }
  }
  
  return text; 
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
    <span class="jg-sender-name" v-if="messageUtils.isGroup(props.message)">{{ props.message.sender.name }}</span>
    <div class="tyn-reply-bubble">
      <div class="tyn-reply-text tyn-reply-call-text wr wr-rtc-status-hangup">{{ state.msg }}</div>
    </div>
  </div>
</template>
 