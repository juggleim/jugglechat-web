<script setup>
import im from "../common/im";
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import { Group } from "../services";
import Storage from "../common/storage";
import LanguageSelect from "../components/select-language.vue";
import { STORAGE, RESPONSE } from "../common/enum";
const props = defineProps(["isShow", "conversation"]);
const emit = defineEmits(["oncancel", "onfinish"]);
let juggle = im.getCurrent();

let user = Storage.get(STORAGE.USER_TOKEN);
const context = getCurrentInstance();

let state = reactive({
  receiveFrom: 'auto',
  receiveTo: 'en',
});

watch(() => props.isShow, () => {
});

function onCancel() {
  emit('oncancel', {});
}
function onConfirm() {
  console.log(state.receiveFrom, state.receiveTo, props.conversation.conversationId);
  emit('onfinish', {});
}
function onChanged(result) {
  utils.extend(state, result);
}
</script>
<template>
  <div class="modal tyn-modal" tabindex="-1" :class="[props.isShow ? 'fade show' : '']">
    <div class="modal-dialog modal-dialog-centered jg-translator-modal">
      <div class="modal-content border-0">
        <div class="modal-body">
          <h5 class="pb-2">消息接收自动翻译</h5>
          <ul class="tyn-media-list gap gap-2">
            <li>
              <LanguageSelect :title="'原语言'" :is-auto="true" :current="state.receiveFrom" :name="'receiveFrom'" @save="onChanged"></LanguageSelect>
            </li>
            <li>
              <LanguageSelect :title="'目标语言'" :current="state.receiveTo" :name="'receiveTo'" @save="onChanged"></LanguageSelect>
            </li>
          </ul>
          <ul class="tyn-list-inline gap gap-3 pt-3 tny-content-center">
            <li>
              <button class="btn btn-md btn-success" @click="onConfirm()">确认</button>
            </li>
            <li>
              <button class="btn btn-md btn-light" @click="onCancel()">取消</button>
            </li>
          </ul>
        </div>
        <button @click="onCancel()" class="btn btn-md btn-icon btn-pill btn-white shadow position-absolute top-0 end-0 mt-n3 me-n3 wr wr-close"></button>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ 'show': props.isShow }"></div>
  </div>
</template>
