<script setup>
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import common from "../common/common";
import emitter from "../common/emmit";
import Perch from "./perch.vue";
const props = defineProps(["isShow", "title", "cls", "right", "disabledClose"]);
const emit = defineEmits(['oncancel']);

const context = getCurrentInstance();

let state = reactive({
  list: []
});

function onCancel(){
  if(props.disabledClose){
    return;
  }
  emit('oncancel', {});
}
watch(() => props.isShow, () => {
});
</script>

<template>
  <div class="tyn-common-aside" :class="[props.isShow ? 'show-caside' : '', props.cls, props.right ? 'tyn-common-aside-right' : '']">
    <Perch></Perch>
    <div class="tyn-common-header">
      <div class="title">{{ props.title }}</div>
      <ul class="tools">
        <li class="tool close wr wr-close" @click.prevent="onCancel()" v-if="!props.disabledClose"></li>
      </ul>
    </div>
    <div class="tyn-common-body">
      <slot></slot>
    </div>
  </div>
  <div class="modal-backdrop show" v-if="props.isShow" @click.prevent="onCancel()"></div>  
</template>
