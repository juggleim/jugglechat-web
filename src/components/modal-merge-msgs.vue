<script setup>
import im from "../common/im";
import { reactive, watch } from "vue";
import utils from "../common/utils";

import Text from './message-text.vue';
import File from './message-file.vue';
import ImageMessage from './message-image.vue';
import Video from './message-video.vue';
import Merge from './message-merge.vue';
import Known from './message-unknown.vue';

const props = defineProps(["isShow", "message"]);
const emit = defineEmits(["oncancel"]);
let juggle = im.getCurrent();
let { MessageType } = juggle;
let state = reactive({
  messages: []
});

function onCancel() {
  emit('oncancel', {});
}

watch(() => props.message, (msg) => {
  let { messageId } = msg;
  if (!messageId) {
    return;
  }
  let params = { messageId: msg.messageId };
  juggle.getMergeMessages(params).then(({ messages }) => {
    utils.extend(state, { messages })
  });
})
</script>
<template>
  <div class="modal tyn-modal" :class="[props.isShow ? 'fade show' : '']">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border-0 modal-merge-content">
        <div class="modal-body">
          <h4 class="pb-2">消息记录</h4>
        </div>
        <div class="tyn-chat-body js-scroll-to-end" ref="mergemessages">
          <div class="tyn-reply">
            <div v-for="message in state.messages">
              <div class="tny-conent-msg">
                <div class="tyn-reply-item ingoing">
                  <Text v-if="utils.isEqual(message.name, MessageType.TEXT)" :message="message"></Text>
                  <ImageMessage v-else-if="utils.isEqual(message.name, MessageType.IMAGE)" :message="message">
                  </ImageMessage>
                  <File v-else-if="utils.isEqual(message.name, MessageType.FILE)" :message="message"></File>
                  <Video v-else-if="utils.isEqual(message.name, MessageType.VIDEO)" :message="message"></Video>
                  <Merge v-else-if="utils.isEqual(message.name, MessageType.MERGE)" :message="message"></Merge>
                  <Known v-else :message="message"></Known>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button @click="onCancel()"
          class="btn btn-md btn-icon btn-pill btn-white shadow position-absolute top-0 end-0 mt-n3 me-n3 wr wr-close"></button>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ 'show': props.isShow }"></div>
  </div>
</template>
