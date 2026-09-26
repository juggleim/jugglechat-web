<script setup>
const props = defineProps(['message', 'isRead']);
const emit = defineEmits(["onrecall", "onmodify", 'ontransfer', 'onreply', 'onreaction', 'onresend', 'onpinned', 'onfav', 'onaireply']);

import { reactive, watch, getCurrentInstance } from "vue";
import GroupReads from "./group-reads.vue";
import Dropdownmenu from "./message-menu.vue";
import Reaction from "./message-reaction.vue";
import ReplyMessage from "./message-reply.vue";
import Avatar from "./avatar.vue";
import utils from "../common/utils";
import im from "../common/im";
import messageUtils from "./message-utils";
import { REG_EXP, MESSAGE_OP_TYPE } from "../common/enum";
import ReactionEmoji from "../components/emoji-reaction.vue"
import Clipboard from 'clipboard.js';
import common from "../common/common";

let state = reactive({
  isShowDrop: false,
  isModify: false,
  content: '',
  errorMsg: '',
  mentionMsgs: common.mentionShortFormat(props.message),
  isShowGroupDetail: false,
  dropRectX: 0,
  isShowReaction: false,
  i18n: common.i18n(),
});
watch(() => props.message, (msg) => {
  state.mentionMsgs = common.mentionShortFormat(msg);
});

let context = getCurrentInstance();

function onCopy(){
  let content = common.mentionToText(props.message)
  Clipboard.copy(content, utils.noop, utils.noop);
  context.proxy.$toast({
    text: state.i18n.MESSAGE_TEXT.COPY,
    icon: 'success'
  });
  onShowDrop(false);
}

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
  let { content, i18n } = state;
  if (utils.isEmpty(content)) {
    return state.errorMsg = i18n.MESSAGE_TEXT.EDIT_CONTENT_EMPTY;
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
function onTransfer(type){
  onShowDrop(false);
  emit('ontransfer', { type })
}
function onReply(){
  onShowDrop(false);
  emit('onreply', props.message);
}
function onAIReply(){
  onShowDrop(false);
  emit('onaireply', { message: props.message });
}
function onPinned(){
  onShowDrop(false);
  emit('onpinned', { message: props.message });
}
function onFav(){
  onShowDrop(false);
  emit('onfav', { message: props.message });
}
function onCancelModify() {
  state.isModify = false;
}
function onInput() {
  state.errorMsg = '';
}
function getContent(content){
  // content = content.replace(REG_EXP.LINK, (current, match) => {
  //   return `<a href="${match}" target="_blank" >${match}</a>`;
  // });
  let message = props.message;
  let { mentionInfo } = message;
  if(!mentionInfo){
    mentionInfo = { mentionType: -1 };
  }
  let isMention = mentionInfo.mentionType > 0;
  if(isMention){
    let content = common.mentionShortFormat(message)
    let reg = new RegExp('\n', 'g');
    return content.replace(reg, '<br/>');	
  }
  return common.formatMarkdown(common.mentionShortFormat(props.message));
}
function onShowReadDetail(isShow) {
  if (!messageUtils.isGroup(props.message)) {
    return;
  }
  utils.extend(state, { isShowGroupDetail: isShow });
}
function onClickRight(e){
  if(props.isRead){
    return;
  }
  onShowDrop(true);
  let rect = e.target.getBoundingClientRect();
  let x = e.x - rect.x;
  if(props.message.isSender){
    x = rect.right - e.x
  }
  state.dropRectX = x;
}
function onShowEmojiReaction(isShow){
  if(utils.isMobile()){
    return;
  }
  if(props.isRead){
    return;
  }
  state.isShowReaction = isShow;
}
function onChoiceEmoji(item){
  emit('onreaction', { ...item, message: props.message });
}

function onResend(){
  emit('onresend', { message: props.message });
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
  <ReactionEmoji :is-show="state.isShowReaction" @onhide="onShowEmojiReaction(false)" @onemit="onChoiceEmoji" :message="props.message"></ReactionEmoji>
  <div class="tyn-reply-group" >
    <span class="jg-sender-name" v-if="messageUtils.isGroup(props.message)">{{ props.message.sender.name }}</span>
    <div class="tyn-reply-bubble" :messageid="props.message.messageId" :messageId="props.message.tid">
      <div class="tyn-reply-text" v-if="state.isModify">
        <div>
          <input class="tyn-chat-form-input" v-model="state.content" type="text" @input="onInput()" />
          <button class="btn btn-sm" @click="onModify">{{state.i18n.COMMON.SAVE_BTN}}</button>
          <button class="btn btn-sm" @click="onCancelModify">{{state.i18n.COMMON.CANCEL_BTN}}</button>
        </div>
        <span class="small ms-2 text-warning" v-if="state.errorMsg">{{ state.errorMsg }}</span>
      </div>
      <div class="markdown-body tyn-reply-text wr" v-else v-longpress="onClickRight" @click.right.prevent="onClickRight" @click.prevent="onShowEmojiReaction(true)">
        <ReplyMessage  :message="props.message.referMsg"></ReplyMessage>
        <span class="" v-html="getContent(props.message.content.content)"></span>
        <div class="jg-translate" v-if="props.message.translation" v-html="getContent(props.message.translation)"></div>
        <span class="tyn-text-modify" v-if="props.message.isUpdated">（{{state.i18n.MESSAGE_TEXT.EDIT_TIP}}）</span>
        
        <Reaction :is-show="!utils.isEmpty(props.message.reactions)" :reactions="props.message.reactions" @oncancel="onChoiceEmoji"></Reaction>

        <div class="wr message-state wr-circle" @click.stop="onShowReadDetail(true)"
          :class="{ 'wr-dui': props.message.isRead && !messageUtils.isGroup(props.message) || props.message.unreadCount == 0, 'message-read': props.message.isRead && !messageUtils.isGroup(props.message) || props.message.readCount > 0 }"
          v-if="props.message.sentState == 2 && props.message.isSender && !props.isRead">

          <div v-if="messageUtils.isGroup(props.message) && props.message.readCount > 0 && props.message.unreadCount > 0"
            class="message-group-state"
            :style="{ 'background-image': 'conic-gradient( #008000 ' + props.message.readPercent + 'deg, transparent ' + props.message.readPercent + '.2deg)' }">
          </div>

          <GroupReads v-if="state.isShowGroupDetail" :message="props.message"></GroupReads>

          <div class="modal-backdrop fade show modal-tp-backdrop" @click.stop="onShowReadDetail(false)"
            v-if="state.isShowGroupDetail" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false"></div>
        </div>

        <div class="wr message-state message-send-loading message-sending" v-if="props.message.sentState == 1"></div>
        <div class="wr wr-failed message-state message-failed" v-if="props.message.sentState == 3" @click.stop="onResend"></div>

        <div class="jg-message-senttime">{{ utils.formatTimetoHM(props.message.sentTime) }}</div>
      </div>
      <ul class="tyn-reply-tools">
        <li>
          <Dropdownmenu :style="[  props.message.isSender ? 'right:' + state.dropRectX + 'px' : 'left:' + state.dropRectX + 'px']" :is-show="state.isShowDrop" :message="props.message" 
            @oncopy="onCopy" 
            @onaireply="onAIReply"
            @onmodify="onShowModify()" 
            @onrecall="onRecall()" 
            @ontransfer="onTransfer(MESSAGE_OP_TYPE.TRANSLATE)" 
            @onremove="onTransfer(MESSAGE_OP_TYPE.REMOVE)" 
            @onreply="onReply()" 
            @onpinned="onPinned()" 
            @onfav="onFav()" 
            @onhide="onShowDrop(false)"></Dropdownmenu>
        </li>
      </ul>
    </div>
    <div class="dropmenu-backdrop" :class="{'show-menu-back': state.isShowDrop}" @click="onShowDrop(false)"></div>  
  </div>
</template>
