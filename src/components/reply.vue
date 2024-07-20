<script setup>
import { reactive, watch } from "vue";
import im from "../common/im";
import utils from "../common/utils";
const props = defineProps(["isShow", "message"]);
const emit = defineEmits(["oncancel"]);

let state = reactive({
  name: ''
});

function onCancel(){
  emit('oncancel', {});
}
watch(() => props.message, (msg) => {
  let name = im.msgShortFormat(msg);
  utils.extend(state, { name });
});
</script>

<template>
  <div class="tyn-chat-search tyn-replies" :class="{ 'active': props.isShow }">
    <div class="flex-grow-1">
      <div class="form-group">
        <div class="form-control-wrap form-control-plaintext-wrap">
          回复：{{ state.name }}
        </div>
      </div>
    </div>
    <div class="d-flex align-items-center gap gap-3">
      <ul class="tyn-list-inline ">
        <li>
          <button class="btn btn-icon btn-md btn-light js-toggle-chat-search wr wr-close" @click="onCancel"></button>
        </li>
      </ul>
    </div>
  </div></template>
