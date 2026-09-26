<script setup>
import { reactive, getCurrentInstance } from "vue";
import utils from "../common/utils";
import Avatar from "./avatar.vue";
import GroupReads from "./group-reads.vue";
import messageUtils from "./message-utils";
import Dropdownmenu from "./message-menu.vue";
import common from "../common/common";
import { MESSAGE_OP_TYPE } from "../common/enum";
import ReactionEmoji from "../components/emoji-reaction.vue"
import Reaction from "./message-reaction.vue";

const props = defineProps(["message", "isRead"]);
const emit = defineEmits(["onrecall", "ontransfer", "onreply", "onreaction", "onpinned", "onfav"]);

let state = reactive({
  isShowDrop: false,
  isPlaying: false,
  isShowGroupDetail: false,
  dropRectX: 0,
  isShowReaction: false,
});

let context = getCurrentInstance();

function onReply(){
  emit('onreply', props.message);
}
function onTransfer(type){
  onShowDrop(false);
  emit('ontransfer', { type })
}
function onPinned(){
  onShowDrop(false);
  emit('onpinned', { message: props.message });
}
function onFav(){
  onShowDrop(false);
  emit('onfav', { message: props.message });
}
function onShowDrop(isShow) {
  state.isShowDrop = isShow;
}
function onRecall() {
  let message = props.message;
  emit('onrecall', message);
  onShowDrop(false);
}
function onPlay() {
  let { video } = context.refs;
  let { isPlaying } = state;
  if (isPlaying) {
    video.pause();
  } else {
    video.play();
  }
  utils.extend(state, { isPlaying: !isPlaying });
}
function onShowReadDetail(isShow) {
  let message = props.message;
  if (!messageUtils.isGroup(message)) {
    return;
  }
  utils.extend(state, { isShowGroupDetail: isShow });
}

function calc(){
  return common.calcSize(props.message.content, 25);
}
function onClickRight(e){
  if(props.isRead){
    return;
  }
  onShowDrop(true);
  state.dropRectX = e.x - e.target.getBoundingClientRect().x
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
  <div class="tyn-reply-group" @mouseleave="onShowDrop(false)">
    <span class="jg-sender-name" v-if="messageUtils.isGroup(props.message)">{{ props.message.sender.name }}</span>
    <div class="tyn-reply-bubble tyn-transpant-bubble">
      <div class="tyn-reply-media wr" :messageid="props.message.messageId" v-longpress="onClickRight" @click.right.prevent="onClickRight"  @click.prevent="onShowEmojiReaction(true)">
        <a class="glightbox" data-gallery="media-video" @click="onPlay" :style="{'height': (calc().height) + 'px', 'width': (calc().width) + 'px'}">
          <video :src="props.message.content.url || props.message.localUrl" ref="video" class="tyn-image" controls></video>
          <!-- <div class="tyn-video-icon wr wr-video" v-if="!state.isPlaying"></div> -->
        </a>
        
        <Reaction :is-show="!utils.isEmpty(props.message.reactions)" :reactions="props.message.reactions" @oncancel="onChoiceEmoji"></Reaction>

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
          @onrecall="onRecall()" 
          @ontransfer="onTransfer(MESSAGE_OP_TYPE.TRANSLATE)" 
          @onremove="onTransfer(MESSAGE_OP_TYPE.REMOVE)" 
          @onreply="onReply()" 
          @onpinned="onPinned()"
          @onfav="onFav()"
          @onhide="onShowDrop(false)"></Dropdownmenu>
        </li>
      </ul>
      <!-- .tyn-reply-tools -->
    </div>
    <div class="dropmenu-backdrop" :class="{'show-menu-back': state.isShowDrop}" @click="onShowDrop(false)"></div>  
  </div>
</template>
 