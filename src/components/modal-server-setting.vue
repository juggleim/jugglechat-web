<script setup>
import im from "../common/im";
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import Storage from "../common/storage";
import { STORAGE } from "../common/enum";
const props = defineProps(["isShow"]);
const emit = defineEmits(["oncancel"]);
let juggle = im.getCurrent();

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
  context.proxy.$toast({ text: `重置成功`, icon: 'success'});
  reload();
}
function onConfirm(){
  let { appkey, server } = state;

  let domainRegex = /^(?:https?:\/\/)?([^\/?#]+)/;
  let matches = server.match(domainRegex) || [];
  let domain = matches[1] || '';
  Storage.set(STORAGE.SERVER_SETTING, { appkey, server: domain });
  context.proxy.$toast({ text: `保存成功`, icon: 'success'});
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
          <h5 class="pb-2">服务器设置</h5>
          <ul class="tyn-media-list gap">
            <li class="jg-language-box">
              <div class="jg-langugage-title">AppKey</div>  
              <input type="text" class="form-control jg-server-input" v-model="state.appkey" placeholder="默认配置">
            </li>
            <li class="jg-language-box">
              <div class="jg-langugage-title">IM Server</div>  
              <div class="jg-form-box">
                <input type="text" class="form-control jg-server-input" v-model="state.server" placeholder="默认配置">
                <span class="small text-danger">填入无协议头的域名或 IP，示例: ws.imhacker.com </span>
              </div>
            </li>
          </ul>
          <ul class="tyn-list-inline gap gap-3 pt-3 tny-content-center">
            <li>
              <button class="btn btn-md btn-success" @click="onConfirm()">保存</button>
            </li>
            <li>
              <button class="btn btn-md btn-light" @click="onReset()">重置</button>
            </li>
          </ul>
        </div>
        <button @click="onCancel()" class="btn btn-md btn-icon btn-pill btn-white shadow position-absolute top-0 end-0 mt-n3 me-n3 wr wr-close"></button>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ 'show': props.isShow }"></div>
  </div>
</template>
