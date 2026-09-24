<script setup>
const props = defineProps(['message', 'isRead']);
const emit = defineEmits(["onrecall", "onmodify", 'ontransfer', 'onreply', 'onreaction', 'onresend', 'onpinned', 'onfav', 'onaireply']);

import { reactive, watch, getCurrentInstance } from "vue";
import GroupReads from "./group-reads.vue";
import Dropdownmenu from "./message-menu.vue";
import Reaction from "./message-reaction.vue";
import Avatar from "./avatar.vue";
import utils from "../common/utils";
import im from "../common/im";
import messageUtils from "./message-utils";
import { REG_EXP, MESSAGE_OP_TYPE } from "../common/enum";
import ReactionEmoji from "./emoji-reaction.vue"
import Clipboard from 'clipboard.js';
import common from "../common/common";
import { emojis } from "../common/emoji";

let state = reactive({
  isShowDrop: false,
  errorMsg: '',
  isShowGroupDetail: false,
  dropRectX: 0,
  isShowReaction: false,
  stakers: []
});

let context = getCurrentInstance();

let { content: { content } } = props.message;
let matchEmojis = common.splitGraphemes(content);
let stakers = [];
utils.forEach(matchEmojis, (emoji) => {
  let index = utils.find(emojis, (item) => {
    return utils.isEqual(item.emoji, emoji);
  });
  if(index >-1){
    let staker = emojis[index];
    stakers.push(staker);
  }else{
    stakers.push(emoji);
  }
});
state.stakers = stakers;

function onCopy(){
  let { content: { content } } = props.message;
  Clipboard.copy(content, utils.noop, utils.noop);
  context.proxy.$toast({
    text: common.i18n().UI.COPIED,
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

function onReply(){
  onShowDrop(false);
  emit('onreply', props.message);
}
function onPinned(){
  onShowDrop(false);
  emit('onpinned', { message: props.message });
}
function onFav(){
  onShowDrop(false);
  emit('onfav', { message: props.message });
}
function onInput() {
  state.errorMsg = '';
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
function onAIReply(){
  onShowDrop(false);
  emit('onaireply', { message: props.message });
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
    <div class="tyn-reply-bubble tyn-staker-bubble" :messageid="props.message.messageId" :messageId="props.message.tid">
      <div class="tyn-reply-text wr" v-longpress="onClickRight" @click.right.prevent="onClickRight" @click.prevent="onShowEmojiReaction(true)">
        
        <div class="jg-msg-emoji-box">
          <div class="jg-msg-emoji" v-for="staker in stakers">
            <div  class="jg-msg-emoji-img" v-if="staker.img" :style="{'background-image': 'url('+staker.img+')'}"></div>
            <span class="jg-msg-emoji-content" v-if="!staker.img">{{ staker }}</span>
          </div>
        </div>
        
        <Reaction :is-show="!utils.isEmpty(props.message.reactions)" :reactions="props.message.reactions" @oncancel="onChoiceEmoji"></Reaction>

      

        <div class="wr message-state message-send-loading message-sending" v-if="props.message.sentState == 1"></div>
        <div class="wr wr-failed message-state message-failed" v-if="props.message.sentState == 3" @click.stop="onResend"></div>

        <div class="jg-message-senttime">
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

          <span class="jg-staker-msg-st">{{ utils.formatTimetoHM(props.message.sentTime) }}</span>
        </div>
      </div>
      <ul class="tyn-reply-tools">
        <li>
          <Dropdownmenu :style="[  props.message.isSender ? 'right:' + state.dropRectX + 'px' : 'left:' + state.dropRectX + 'px']" :is-show="state.isShowDrop" :message="props.message" 
            @onaireply="onAIReply"
            @oncopy="onCopy" 
            @onrecall="onRecall()" 
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
