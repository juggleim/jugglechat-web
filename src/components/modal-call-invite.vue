<script setup>
import im from "../common/im";
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import { User } from "../services/index";
import { RESPONSE } from "../common/enum";
import common from "../common/common";

const props = defineProps(["isShow", "callid", "index", "inviter"]);
const emit = defineEmits(["onhangup", "onaccept"]);

let state = reactive({
  i18n: common.i18n(),
});

function onhangup(){
  emit("onhangup", { callId: props.callid });
}
function onaccept(){
  emit("onaccept", { callId: props.callid });
}

</script>
<template>
  <div class="call-modal show jcall-invite-box" :style="{ 'top':  (50 + 80 * props.index) + 'px'}">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-body">
          <div class="jgcall-invite-title">{{ props.inviter.name || '' }} {{ state.i18n.MESSAGE_CALL }}</div>
          <ul class="jgcall-invite-tools">
            <li class="jgcall-invite-tool wr wr-rtc-accept" @click="onaccept"></li>
            <li class="jgcall-invite-tool wr wr-rtc-hangup" @click="onhangup"></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
