<script setup>
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import { Group, User } from "../services";
import Storage from "../common/storage";
import { STORAGE, RESPONSE } from "../common/enum";
import Asider from "./aside.vue";
import common from "../common/common";

const props = defineProps(["isShow", "right", "title", "desc", "isGroup", "uid"]);
const emit = defineEmits(["oncancel", "onfinish"]);
const context = getCurrentInstance();
let i18n = common.i18n();

let state = reactive({
  qrcode: ''
});
function onCancel() {
  emit('oncancel', {});
}
function handler(result){
  let { code, data } = result;
  if(!utils.isEqual(code, RESPONSE.SUCCESS)){
    return context.proxy.$toast({
      text: utils.templateFormat(i18n.UI.QR_CODE_FAILED, { code }),
      icon: 'error'
    });
  }
  let { qr_code } = data;
  state.qrcode = qr_code;
}
function getQrCode(){
  let { uid } = props;
  if(props.isGroup){
    return Group.getQrCode({ group_id: uid }).then(handler);
  }
  User.getCurrentQRCode().then(handler);
}
watch(() => props.isShow, () => {
  if(props.isShow){
    getQrCode();
  }else{
    state.qrcode = '';
  }
});

</script>

<template>
  <Asider :is-show="props.isShow" :title="props.title" @oncancel="onCancel" :right="props.right">
    <div class="jg-aside-qrcode-body">
      <div class="jg-aside-qrcode-img" :style="{ 'background-image': 'url(data:image/png;base64,' + state.qrcode + ')' }">
        <div class="jg-nlogin-icon"></div>
      </div>
      <div class="jg-aside-qrcode-desc">{{ props.desc }}</div>
    </div>
  </Asider>
</template>
