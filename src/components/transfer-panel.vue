<script setup>
import { reactive } from "vue";
import { TRANSFER_TYPE } from "../common/enum";
const props = defineProps(["isShow"]);
const emit = defineEmits(["oncancel", "ontransfer"]);


let state = reactive({});

function onCancel(){
  emit('oncancel', {});
}
function onTransfer(type){
  emit('ontransfer', { type });
}
</script>

<template>
  <div class="tyn-chat-search active" :class="[props.isShow ? 'tyn-transfer-pn show-aside' : 'tyn-transfer-pn']">
    <ul class="tyn-list-inline gap gap-3 mx-auto">
      <li class="btn btn-light tyn-size-md w-100"  @click="onTransfer(TRANSFER_TYPE.ONE)">
        <div class="small text-nowrap wr wr-transfer transfer-icon">逐条转发</div>
      </li>
      <li class="btn btn-light tyn-size-md w-100" @click="onTransfer(TRANSFER_TYPE.MERGE)">
        <div class="small text-nowrap wr wr-transfer-merge transfer-icon">合并转发</div>
      </li>
      <li class="btn btn-light tyn-size-md w-100">
        <div class="small text-nowrap wr wr-close transfer-icon" @click="onCancel()">取消转发</div>
      </li>
    </ul>
  </div>
</template>
