<script setup>
import im from "../common/im";
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import { Group } from "../services";
import Storage from "../common/storage";
import LanguageSelect from "../components/select-language.vue";
import JSwitch from "../components/switch.vue";

import { STORAGE, RESPONSE } from "../common/enum";
import common from "../common/common";
const props = defineProps(["isShow", "conversation"]);
const emit = defineEmits(["oncancel", "onfinish"]);
let juggle = im.getCurrent();

let user = Storage.get(STORAGE.USER_TOKEN);
const context = getCurrentInstance();

let T_UID = 'translator';

let state = reactive({
  i18n: common.i18n(),
  source: 'auto',
  traget: 'en',
  isOpen: false,
  uid: T_UID
});
function onCancel() {
  emit('oncancel', {});
}
function onConfirm() {
  save();
  emit('onfinish', {});
}
function onSwitchChanged(e){
  let { isOpen } = e;
  state.isOpen = isOpen;
  // if(isOpen){
  //   save();
  // }else{
  //   let key = getKey();
  //   Storage.remove(key);
  // }
}
function save(){
  let { source, traget, isOpen } = state;
  let { conversationId, conversationType } = props.conversation;
  let key = getKey();
  Storage.set(key, { source: source, target: traget, isOpen })
}
function onChanged(result) {
  utils.extend(state, result);
}
function getKey(){
  let { conversationId, conversationType } = props.conversation;
  return `${STORAGE.TRANSLATE_CONF}_${conversationType}_${conversationId}`;
}
watch(() => props.isShow, () => {
  if(props.isShow){
    let key = getKey();
    let tConf = Storage.get(key);
    let { source, target, isOpen } = tConf;
    if(!isOpen){
      utils.extend(state, { isOpen });
      return;
    }
    utils.extend(state, { source: source, traget: target, isOpen })
  }
});
</script>
<template>
  <div class="modal tyn-modal" tabindex="-1" :class="[props.isShow ? 'fade show' : '']">
    <div class="modal-dialog modal-dialog-centered jg-translator-modal">
      <div class="modal-content border-0">
        <div class="modal-body">
          <h5 class="pb-2">{{ state.i18n.UI.TRANSLATION_SETTINGS }}</h5>
          <ul class="tyn-media-list gap gap-2">
            <li class="jg-flex-row">
              <div class="tyn-aside-title">{{ state.i18n.UI.AUTO_TRANSLATE }}</div>
              <JSwitch :uid="state.uid" :is-checked="state.isOpen" @onchanged="onSwitchChanged" ></JSwitch>
            </li>
            <li v-if="state.isOpen">
              <LanguageSelect :title="state.i18n.UI.SOURCE_LANGUAGE" :is-auto="true" :current="state.source" :name="'source'" @save="onChanged"></LanguageSelect>
            </li>
            <li v-if="state.isOpen">
              <LanguageSelect :title="state.i18n.UI.TARGET_LANGUAGE" :current="state.traget" :name="'traget'" @save="onChanged"></LanguageSelect>
            </li>
          </ul>
          <ul class="tyn-list-inline gap gap-3 pt-3 tny-content-center">
            <li>
              <button class="btn btn-md btn-success" @click="onConfirm()">{{ state.i18n.COMMON.CONFIRM_BTN }}</button>
            </li>
            <li>
              <button class="btn btn-md btn-light" @click="onCancel()">{{ state.i18n.COMMON.CANCEL_BTN }}</button>
            </li>
          </ul>
        </div>
        <button @click="onCancel()" class="btn btn-md btn-icon btn-pill btn-white shadow position-absolute top-0 end-0 mt-n3 me-n3 wr wr-close"></button>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ 'show': props.isShow }"></div>
  </div>
</template>
