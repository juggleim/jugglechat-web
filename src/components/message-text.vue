<script setup>
const props = defineProps(['message']);
const emit = defineEmits(["onrecall", "onmodify", 'ontransfer', 'onreply']);

import { reactive, watch } from "vue";
import GroupReads from "./group-reads.vue";
import Dropdownmenu from "./message-menu.vue";
import ReplyMessage from "./message-reply.vue";
import utils from "../common/utils";
import im from "../common/im";
import messageUtils from "./message-utils";
import { REG_EXP } from "../common/enum";

let state = reactive({
  isShowDrop: false,
  isModify: false,
  content: '',
  errorMsg: '',
  mentionMsgs: im.mentionShortFormat(props.message),
  isShowGroupDetail: false,
});
watch(() => props.message, (msg) => {
  state.mentionMsgs = im.mentionShortFormat(msg);
});

function onShowDrop(isShow) {
  state.isShowDrop = isShow;
}
function onRecall() {
  let message = props.message;
  emit('onrecall', message);
  onShowDrop(false);
}
function onModify() {
  let message = props.message;
  let { content } = state;
  if (utils.isEmpty(content)) {
    return state.errorMsg = '修改内容不能为空呀~';
  }
  emit('onmodify', { message, content });
  state.isModify = false;
}
function onShowModify() {
  state.isModify = true;
  utils.extend(state, {
    isModify: true,
    content: props.message.content.content
  });
  onShowDrop(false);
}
function onTransfer(){
  onShowDrop(false);
  emit('ontransfer', {})
}
function onReply(){
  onShowDrop(false);
  emit('onreply', props.message);
}
function onCancelModify() {
  state.isModify = false;
}
function onInput() {
  state.errorMsg = '';
}
function getContent(content){
  content = content.replace(REG_EXP.LINK, (current, match) => {
    return `<a href="${match}" target="_blank" >${match}</a>`;
  });
  return content;
}
function onShowReadDetail(isShow) {
  if (!messageUtils.isGroup(props.message)) {
    return;
  }
  utils.extend(state, { isShowGroupDetail: isShow });
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
    <div class="tyn-reply-bubble" :messageid="props.message.messageId" :tid="props.message.tid">
      <div class="tyn-reply-text" v-if="state.isModify">
        <div>
          <input class="tyn-chat-form-input" v-model="state.content" type="text" @input="onInput()" />
          <button class="btn btn-sm" @click="onModify">保存</button>
          <button class="btn btn-sm" @click="onCancelModify">取消</button>
        </div>
        <span class="small ms-2 text-warning" v-if="state.errorMsg">{{ state.errorMsg }}</span>
      </div>
      <div class="tyn-reply-text wr" v-else>
        <ReplyMessage :message="props.message.referMsg"></ReplyMessage>
        <span class="tyn-msg-mention tyn-mention-me" v-for="msg in state.mentionMsgs">{{ msg }}</span>
        <span v-html="getContent(props.message.content.content)"></span>
        <span class="tyn-text-modify" v-if="props.message.isUpdated">（已修改）</span>

        <div class="wr message-state wr-circle" @click.stop="onShowReadDetail(true)"
          :class="{ 'wr-dui': props.message.isRead && !messageUtils.isGroup(props.message) || props.message.unreadCount == 0, 'message-read': props.message.isRead && !messageUtils.isGroup(props.message) || props.message.readCount > 0 }"
          v-if="props.message.isSender">

          <div v-if="messageUtils.isGroup(props.message) && props.message.readCount > 0 && props.message.unreadCount > 0"
            class="message-group-state"
            :style="{ 'background-image': 'conic-gradient( #008000 ' + props.message.readPercent + 'deg, transparent ' + props.message.readPercent + '.2deg)' }">
          </div>

          <GroupReads v-if="state.isShowGroupDetail" :message="props.message"></GroupReads>

          <div class="modal-backdrop fade show modal-tp-backdrop" @click.stop="onShowReadDetail(false)"
            v-if="state.isShowGroupDetail" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false"></div>
        </div>
        <div class="jg-message-senttime">{{ utils.formatTimetoHM(props.message.sentTime) }}</div>
      </div>

      <ul class="tyn-reply-tools">
        <li class="dropup-center">
          <button class="btn btn-icon btn-sm btn-transparent btn-pill wr wr-more" data-bs-toggle="dropdown"
            @click="onShowDrop(true)"></button>
          <Dropdownmenu :is-show="state.isShowDrop" :message="props.message" @onmodify="onShowModify()" @onrecall="onRecall()" @ontransfer="onTransfer()" @onreply="onReply()" @onhide="onShowDrop(false)"></Dropdownmenu>
        </li>
      </ul>
    </div>
  </div>
</template>
