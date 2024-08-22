<script setup>
import { reactive, getCurrentInstance } from "vue";
import utils from "../common/utils";
import GroupReads from "./group-reads.vue";
import messageUtils from "./message-utils";
import Dropdownmenu from "./message-menu.vue";

const props = defineProps(["message"]);
const emit = defineEmits(["onrecall", "ondetail", "ontransfer", "onreply"]);

let state = reactive({
  isShowDrop: false,
  isPlaying: false,
  isShowGroupDetail: false,
});

let context = getCurrentInstance();

function onReply(){
  emit('onreply', props.message);
}
function onTransfer(){
  emit('ontransfer', {})
}
function onShowDrop(isShow) {
  state.isShowDrop = isShow;
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
function onDeatail(){
  emit('ondetail', props.message);
}
</script>

<template>
  <div class="tyn-reply-avatar">
    <div class="tyn-media tyn-size-md">
      <div class="tyn-avatar tyn-s-avatar" :style="{ 'background-image': 'url(' + props.message.sender.portrait + ')' }"></div>
    </div>
  </div>
  <div class="tyn-reply-group" @mouseleave="onShowDrop(false)">
    <span class="jg-sender-name" v-if="messageUtils.isGroup(props.message)">{{ props.message.sender.name }}</span>
    <div class="tyn-reply-bubble wr" :messageid="props.message.messageId">
      <div class="tyn-reply-text tyn-reply-merge"  @click.stop="onDeatail">
        <div class="tyn-media-row">
          <span class="tyn-msg-mergetitle">{{ props.message.content.title }}</span>
        </div>
        <div class="tyn-media-row tyn-msg-merge-list" v-for="item in props.message.content.previewList">
          <span class="sender">{{ item.senderName }}:</span>
          <span class="message">{{ item.content }}</span>
        </div>
        <div class="wr message-state" @click.stop="onShowReadDetail(true)"
        :class="{ 'wr-dui': props.message.isRead, 'wr-circle': !props.message.isRead, 'message-read': props.message.isRead || props.message.readCount > 0 }"
          v-if="props.message.isSender">
          <div v-if="messageUtils.isGroup(props.message) && props.message.readCount > 0 && props.message.unreadCount > 0"
            class="message-group-state"
            :style="{ 'background-image': 'conic-gradient( #008000 ' + props.message.readPercent + 'deg, transparent ' + props.message.readPercent + '.2deg)' }">
          </div>
          <GroupReads v-if="state.isShowGroupDetail" :message="props.message"></GroupReads>
          <div class="modal-backdrop fade show modal-tp-backdrop" @click.stop="onShowReadDetail(false)"
            v-if="state.isShowGroupDetail" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false"></div>
        </div>
      </div>
      <ul class="tyn-reply-tools">
        <li class="dropup-center">
          <button class="btn btn-icon btn-sm btn-transparent btn-pill wr wr-more" data-bs-toggle="dropdown"
            @click="onShowDrop(true)"></button>
            <Dropdownmenu :is-show="state.isShowDrop" :message="props.message" @onrecall="onRecall()" @ontransfer="onTransfer()" @onreply="onReply()"  @onhide="onShowDrop(false)"></Dropdownmenu>
        </li>
      </ul>
      <!-- .tyn-reply-tools -->
    </div>
    <!-- .tyn-reply-bubble -->
  </div>
  <!-- .tyn-reply-group --></template>
