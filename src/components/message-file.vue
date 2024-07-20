<script setup>
import { reactive } from "vue";
import GroupReads from "./group-reads.vue";
import utils from "../common/utils";
import messageUtils from "./message-utils";
import Dropdownmenu from "./message-menu.vue";

const props = defineProps(["message"]);
const emit = defineEmits(["onrecall", "ontransfer", "onreply"]);

let state = reactive({
  isShowDrop: false,
  isShowGroupDetail: false,
});
function onTransfer(){
  emit('ontransfer', {})
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
</script>

<template>
  <div class="tyn-reply-avatar">
    <div class="tyn-media tyn-size-md tyn-circle">
      <div class="tyn-avatar tyn-s-avatar" :style="{ 'background-image': 'url(' + props.message.sender.portrait + ')' }"></div>
    </div>
  </div>
  <div class="tyn-reply-group" @mouseleave="onShowDrop(false)">
    <div class="tyn-reply-bubble">
      <div class="tyn-reply-file wr" :messageid="props.message.messageId">
        <a :href="props.message.content.url" target="_blank" class="tyn-file">
          <div class="tyn-media-group">
            <div class="tyn-media tyn-size-lg text-bg-light wr wr-file tyb-msg-fileicon">
            </div>
            <div class="tyn-media-col">
              <h6 class="name">{{ props.message.content.name }}</h6>
              <div class="meta">{{ ((props.message.content.size || 0) / 1024).toFixed(2) }} KB</div>
            </div>
          </div>
        </a>
        <div class="jg-progress" v-if="props.message.percent < 99.9">
          <div class="jg-progress-stacked" :style="{ 'width': props.message.percent + '%' }"></div>
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
    </div>
  </div>
</template>
