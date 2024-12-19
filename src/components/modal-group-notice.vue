<script setup>
import common from "../common/common";
import { reactive, watch } from "vue";
import utils from "../common/utils";

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
  <div class="modal tyn-modal jg-group-notice-modal" :class="[props.isShow ? 'fade show' : '']">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0">
        <div class="modal-body">
          <div class="jg-modal-header">
            <div class="title">群公告</div>
          </div>
        
          <div class="jg-modal-content">
            <textarea type="text" class="tyn-title-overline text-none jg-group-notice" v-model="state.content" placeholder="说点什么~"></textarea>
          </div>
          
      
        </div>
        <ul class="tyn-list-inline gap gap-3 pt-3 tny-content-center modal-footer">
          <li>
            <button class="btn btn-sm btn-success" @click="onConfirm()">保存</button>
          </li>
          <li>
            <button class="btn btn-sm btn-light" @click="onCancel()">取消</button>
          </li>
        </ul>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ 'show': props.isShow }"></div>
  </div>
</template>
