<script setup>
import { reactive, watch } from "vue";
import { TRANSFER_TYPE, MESSAGE_OP_TYPE } from "../common/enum";
const props = defineProps(["isShow", "opType"]);
const emit = defineEmits(["oncancel", "ontransfer"]);


let state = reactive({
  opType: props.opType
});

function onCancel(){
  emit('oncancel', {});
}
function onTransfer(type){
  emit('ontransfer', { type });
}

watch(() => props.opType, (value) => {
  state.opType = value;
})
</script>

<template>
  <div class="tyn-chat-search active" :class="[props.isShow ? 'tyn-transfer-pn show-aside' : 'tyn-transfer-pn']">
    <ul class="tyn-list-inline gap gap-3 mx-auto">
      <li class="btn btn-light tyn-size-md w-100" v-if="state.opType == MESSAGE_OP_TYPE.TRANSLATE" @click="onTransfer(TRANSFER_TYPE.ONE)">
        <div class="small text-nowrap wr wr-transfer transfer-icon">逐条转发</div>
      </li>
      <li class="btn btn-light tyn-size-md w-100" v-if="state.opType == MESSAGE_OP_TYPE.TRANSLATE" @click="onTransfer(TRANSFER_TYPE.MERGE)">
        <div class="small text-nowrap wr wr-transfer-merge transfer-icon">合并转发</div>
      </li>
      <li class="btn btn-light tyn-size-md w-100">
        <div class="small text-nowrap wr wr-close transfer-icon" @click="onCancel()">{{ state.opType == MESSAGE_OP_TYPE.REMOVE ? '取消删除' : '取消转发' }}</div>
      </li>
      <li class="btn btn-light tyn-size-md w-100">
        <div class="small text-nowrap wr wr-delete transfer-icon warn" v-if="state.opType == MESSAGE_OP_TYPE.REMOVE"  @click="onTransfer(TRANSFER_TYPE.DELETE)">删除确认</div>
      </li>
    </ul>
  </div>
</template>
