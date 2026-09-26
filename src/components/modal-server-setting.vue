<script setup>
import im from "../common/im";
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import Storage from "../common/storage";
import { STORAGE } from "../common/enum";
import common from "../common/common";
const props = defineProps(["isShow"]);
const emit = defineEmits(["oncancel"]);
let juggle = im.getCurrent();
let i18n = common.i18n();

const context = getCurrentInstance();

let appConfig = Storage.get(STORAGE.SERVER_SETTING);

let state = reactive({
  appkey: appConfig.appkey || '',
  server: appConfig.server || '',
});

function onCancel() {
  emit('oncancel', {});
}
function onReset(){
  let obj = { appkey: '', server: '' };
  utils.extend(state, obj);
  Storage.set(STORAGE.SERVER_SETTING, obj);
  context.proxy.$toast({ text: i18n.UI.RESET_SUCCESS, icon: 'success'});
  reload();
}
function onConfirm(){
  let { appkey, server } = state;

  let domainRegex = /^(?:https?:\/\/)?([^\/?#]+)/;
  let matches = server.match(domainRegex) || [];
  let domain = matches[1] || '';
  Storage.set(STORAGE.SERVER_SETTING, { appkey, server: domain });
  context.proxy.$toast({ text: i18n.COMMON.SAVE_SUCCESS, icon: 'success'});
  reload();
}
function reload(){
  location.reload();
}
</script>
<template>
  <div class="modal tyn-modal" tabindex="-1" :class="[props.isShow ? 'fade show' : '']">
    <div class="modal-dialog modal-dialog-centered jg-serversetting-modal">
      <div class="modal-content border-0">
        <div class="modal-body">
          <h5 class="pb-2">{{ i18n.UI.SERVER_SETTINGS }}</h5>
          <ul class="tyn-media-list gap">
            <li class="jg-language-box">
              <div class="jg-langugage-title">{{ i18n.UI.APP_KEY }}</div>  
              <input type="text" class="form-control jg-server-input" v-model="state.appkey" :placeholder="i18n.UI.DEFAULT_CONFIG">
            </li>
            <li class="jg-language-box">
              <div class="jg-langugage-title">{{ i18n.UI.IM_SERVER }}</div>  
              <div class="jg-form-box">
                <input type="text" class="form-control jg-server-input" v-model="state.server" :placeholder="i18n.UI.DEFAULT_CONFIG">
                <span class="small text-danger">{{ i18n.UI.SERVER_HINT }}</span>
              </div>
            </li>
          </ul>
          <ul class="tyn-list-inline gap gap-3 pt-3 tny-content-center">
            <li>
              <button class="btn btn-md btn-success" @click="onConfirm()">{{ i18n.COMMON.SAVE_BTN }}</button>
            </li>
            <li>
              <button class="btn btn-md btn-light" @click="onReset()">{{ i18n.UI.RESET }}</button>
            </li>
          </ul>
        </div>
        <button @click="onCancel()" class="btn btn-md btn-icon btn-pill btn-white shadow position-absolute top-0 end-0 mt-n3 me-n3 wr wr-close"></button>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ 'show': props.isShow }"></div>
  </div>
</template>
