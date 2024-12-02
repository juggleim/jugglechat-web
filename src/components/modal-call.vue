<script setup>
import im from "../common/im";
import { reactive, watch } from "vue";
import utils from "../common/utils";
import { User } from "../services/index";
import { RESPONSE } from "../common/enum";
import common from "../common/common";

const props = defineProps(["isShow"]);
const emit = defineEmits(["onhangup"]);
let juggle = im.getCurrent();

let state = reactive({
  isConnected: false
});
function onHangup() {
  emit("onhangup", {});
}
watch(
  () => props.isShow,
  () => {
    if (!props.isShow) {
      utils.extend(state, {});
    }
  }
);
</script>
<template>
  <div class="modal tyn-modal" :class="[props.isShow ? 'fade show' : '']">
    <div class="modal-dialog modal-sm modal-friend-add">
      <div class="modal-content border-0 call-content">
        <div class="modal-body">
          <div class="tyn-chat-call tyn-chat-call-video">
            <div class="tyn-chat-call-stack">
              <div class="tyn-chat-call-cover">
                <!-- <img src="images/v-cover/1.jpg" alt /> -->
              </div>
            </div>
            <div class="tyn-chat-call-stack on-dark">
              <div class="tyn-media-group p-4">
                <div class="tyn-media-col align-self-start pt-3">
                  <div class="tyn-media-row has-dot-sap">
                    <span class="meta">Talking With ...</span>
                  </div>
                  <div class="tyn-media-row">
                    <h6 class="name">Konstantin Frank</h6>
                  </div>
                  <div class="tyn-media-row has-dot-sap">
                    <span class="content">02:09 min</span>
                  </div>
                </div>
                <div class="tyn-media tyn-media-1x1_3 tyn-size-3xl border border-1 border-dark">
                  <!-- <img src="images/v-cover/2.jpg" alt /> -->
                </div>
              </div>
              <ul class="tyn-list-inline gap gap-3 mx-auto py-4 justify-content-center mt-auto">
                <li v-if="state.isConnected"><button class="btn btn-icon btn-pill jg-rtc-btn btn-light wr wr-rtc-mic"></button></li>
                <li v-if="state.isConnected"><button class="btn btn-icon btn-pill jg-rtc-btn btn-light wr wr-rtc-camera"></button></li>
                <li v-if="!state.isConnected"><button class="btn btn-icon btn-pill jg-rtc-btn btn-light wr wr-rtc-accept"></button></li>
                <li><button class="btn btn-icon btn-pill jg-rtc-btn btn-light wr wr-rtc-hangup" @click="onHangup"></button></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ 'show': props.isShow }"></div>
  </div>
</template>
