<script setup>
import { reactive } from "vue";
import utils from "../common/utils";
import common from "../common/common";
const props = defineProps(["isShow", "conversation", "img"]);
const emit = defineEmits(["oncancel", "onconfirm"]);

let state = reactive({});

function onCancel(){
  emit('oncancel', {});
}
function onConfirm(){
  emit('onconfirm', {});
}

</script>
<template>
  <div class="modal tyn-modal" :class="[props.isShow ? 'fade show' : '']">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0">
        <div class="modal-body">
          <h5 class="pb-2">发送图片给 {{ props.conversation.conversationTitle || 'JG' }}</h5>
          <div class="form-group jg-snshot-box">
            <img class="jg-snshot-preview" v-if="props.img.previewUrl" :src="props.img.previewUrl">
          </div>
          <div class="form-group">
            <div class="form-control-wrap jg-snshot-wrap">
              <a class="btn btn-primary-soft" @click="onConfirm()">发送</a>
            </div>
          </div>
        </div>
        <button @click="onCancel()" class="btn btn-md btn-icon btn-pill btn-white shadow position-absolute top-0 end-0 mt-n3 me-n3 wr wr-close"></button>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{'show': props.isShow}"></div>  
  </div>
</template>
