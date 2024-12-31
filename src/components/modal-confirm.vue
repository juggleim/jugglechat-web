<script setup>
import im from "../common/im";
import { reactive, watch } from "vue";
const props = defineProps(["title", "content", "icon"]);
const emit = defineEmits(["cancel", "confirm"]);
let state = reactive({});

function onCancel() {
  emit('cancel', {});
}
function onConfirm(){
  emit('confirm', {});
}
</script>
<template>
  <div class="modal tyn-modal fade show" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered jg-confirm-modal">
      <div class="modal-content border-0">
        <div class="modal-body">
          <h5 class="pb-2">{{ props.title }}</h5>
          
          <div class="jg-confirm-content">
            <span class="wr" :class="['wr-' + props.icon]"></span>
            <span>{{ props.content }}</span>
          </div>
          
          <ul class="tyn-list-inline gap gap-3 pt-3 tny-content-center">
            <li>
              <button class="btn btn-md btn-success" @click="onConfirm">确定</button>
            </li>
            <li>
              <button class="btn btn-md btn-light" @click="onCancel">取消</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show"></div>
  </div>
</template>
