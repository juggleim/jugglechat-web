<script setup>
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import { Group, User } from "../services";
import Storage from "../common/storage";
import { STORAGE, RESPONSE } from "../common/enum";
import Asider from "./aside.vue";

const props = defineProps(["isShow", "right", "title", "url"]);
const emit = defineEmits(["oncancel", "onfinish"]);
const context = getCurrentInstance();

let state = reactive({
  url: '',
  title: ''
});
function onCancel() {
  emit('oncancel', {});
}

watch(() => props.isShow, () => {
  if(props.isShow){
    utils.extend(state, { url: props.url, title: props.title });
  }else{
    utils.extend(state, { url: '', title: '' });
  }
});

</script>

<template>
  <Asider :is-show="props.isShow" :title="state.title" @oncancel="onCancel" :right="props.right">
    <div class="jg-aside-uagreement-body">
      <iframe class="content" :src="state.url" frameborder="0"></iframe>
    </div>
  </Asider>
</template>
