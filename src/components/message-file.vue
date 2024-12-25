<script setup>
import { reactive } from "vue";
import GroupReads from "./group-reads.vue";
import utils from "../common/utils";
import messageUtils from "./message-utils";
import Dropdownmenu from "./message-menu.vue";
import { MESSAGE_OP_TYPE } from "../common/enum";
import ReactionEmoji from "../components/emoji-reaction.vue"
import Reaction from "./message-reaction.vue";

const props = defineProps(["message", "isRead"]);
const emit = defineEmits(["onrecall", "ontransfer", "onreply"]);

let state = reactive({
  isShowDrop: false,
  isShowGroupDetail: false,
  dropRectX: 0,
  isShowReaction: false,
});
function onTransfer(type){
  onShowDrop(false);
  emit('ontransfer', { type })
}
function onShowDrop(isShow) {
  state.isShowDrop = isShow;
}
function onReply(){
  emit('onreply', props.message);
}
function onRecall() {
  let message = props.message;
  emit('onrecall', message);
  onShowDrop(false);
}
function onShowReadDetail(isShow) {
  let message = props.message;
  if (!messageUtils.isGroup(message)) {
    return;
  }
  utils.extend(state, { isShowGroupDetail: isShow });
}
function onClickRight(e){
  if(props.isRead){
    return;
  }
  onShowDrop(true);
  state.dropRectX = e.x - e.target.getBoundingClientRect().x
}
function onShowEmojiReaction(isShow){
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
    <div class="tyn-media tyn-size-md">
      <div class="tyn-avatar tyn-s-avatar" :style="{ 'background-image': 'url(' + props.message.sender.portrait + ')' }"></div>
    </div>
  </div>
  
  <ReactionEmoji :is-show="state.isShowReaction" @onhide="onShowEmojiReaction(false)" @onemit="onChoiceEmoji" :message="props.message"></ReactionEmoji>

  <div class="tyn-reply-group" @mouseleave="onShowDrop(false)">
    <span class="jg-sender-name" v-if="messageUtils.isGroup(props.message)">{{ props.message.sender.name }}</span>
    <div class="tyn-reply-bubble">
      <div class="tyn-reply-file wr" :messageid="props.message.tid"  @click.right.prevent="onClickRight">
        <a :href="props.message.content.url" class="tyn-file" :download="props.message.content.name">
          <div class="tyn-media-group">
            <div class="tyn-media tyn-size-lg text-bg-light wr wr-file tyb-msg-fileicon">
            </div>
            <div class="tyn-media-col">
              <h6 class="name">{{ props.message.content.name }}</h6>
              <div class="meta">{{ (Number(props.message.content.size) || 0).toFixed(2) }} KB</div>
            </div>
          </div>
        </a>
        <div class="jg-progress" v-if="props.message.percent < 99.9">
          <div class="jg-progress-stacked" :style="{ 'width': props.message.percent + '%' }"></div>
        </div>
        
        <Reaction :is-show="!utils.isEmpty(props.message.reactions)" :reactions="props.message.reactions" @oncancel="onChoiceEmoji"></Reaction>

       <div class="wr message-state wr-circle" @click.stop="onShowReadDetail(true)"
        :class="{ 'wr-dui': props.message.isRead && !messageUtils.isGroup(props.message) || props.message.unreadCount == 0, 'message-read': props.message.isRead && !messageUtils.isGroup(props.message) || props.message.readCount > 0 }"
          v-if="props.message.isSender && !props.isRead">

          <div v-if="messageUtils.isGroup(props.message) && props.message.readCount > 0 && props.message.unreadCount > 0"
            class="message-group-state"
            :style="{ 'background-image': 'conic-gradient( #008000 ' + props.message.readPercent + 'deg, transparent ' + props.message.readPercent + '.2deg)' }">
          </div>
          <GroupReads v-if="state.isShowGroupDetail" :message="props.message"></GroupReads>
          <div class="modal-backdrop fade show modal-tp-backdrop" @click.stop="onShowReadDetail(false)"
            v-if="state.isShowGroupDetail" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false"></div>
        </div>
        <div class="jg-message-senttime" v-if="props.message.sentTime">{{ utils.formatTimetoHM(props.message.sentTime) }}</div>
      </div>

      <ul class="tyn-reply-tools">
        <li>
          <Dropdownmenu :style="[  props.message.isSender ? 'right:' + state.dropRectX + 'px' : 'left:' + state.dropRectX + 'px']" :is-show="state.isShowDrop" :message="props.message" @onrecall="onRecall()" @ontransfer="onTransfer(MESSAGE_OP_TYPE.TRANSLATE)" @onremove="onTransfer(MESSAGE_OP_TYPE.REMOVE)" @onreply="onReply()"  @onhide="onShowDrop(false)"></Dropdownmenu>
        </li>
      </ul>
    </div>

    <div class="dropmenu-backdrop" :class="{'show-menu-back': state.isShowDrop}" @click="onShowDrop(false)"></div>  
  </div>
</template>
 