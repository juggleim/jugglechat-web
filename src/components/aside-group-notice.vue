<script setup>
import common from "../common/common";
import { reactive, watch } from "vue";
import utils from "../common/utils";
import Asider from "./aside.vue";

const props = defineProps(["isShow", "content", 'groupid']);
const emit = defineEmits(["oncancel", "onconfirm"]);

let state = reactive({
  content: '',
});

function onCancel() {
  emit('oncancel', {});
}

function onConfirm() {
  emit('onconfirm', { content: state.content });
}

watch(() => props.isShow, async () => {
  if(props.isShow){
    state.content = props.content;
  }
})

</script>

<template>
  <Asider :is-show="props.isShow" :title="'群公告'" @oncancel="onCancel" :right="1">
    <div class="jg-aside-group-notice-body">
      <div class="jg-modal-content">
        <textarea type="text" class="tyn-title-overline text-none jg-group-notice" v-model="state.content" placeholder="说点什么~"></textarea>
      </div>
      <ul class="tyn-list-inline gap gap-3 pt-3 tny-content-center jg-tools">
        <li>
          <button class="btn btn-sm btn-success" @click="onConfirm()"> 保存</button>
        </li>
        <li>
          <button class="btn btn-sm btn-light" @click="onCancel()">取消</button>
        </li>
      </ul>
    </div>
  </Asider>
</template>
