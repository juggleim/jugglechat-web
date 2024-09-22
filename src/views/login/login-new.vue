<script setup>
import JFooter from '../../components/footer.vue';
import utils from "../../common/utils";
import { reactive, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { STORAGE, RESPONSE } from "../../common/enum";
import common from "../../common/common";
import Storage from "../../common/storage";
import { User } from "../../services/index";
import im from "../../common/im";
import WinHeader from '../../components/win-header.vue';

let juggle = im.getCurrent();
let context = getCurrentInstance();

const router = useRouter();
let defalutBtnLabel = '发送';
let state = reactive({
  user: {
    phone: '',
    code: ''
  },
  btnLabel: defalutBtnLabel,
  errorMsg: {
    phone: '',
    code: ''
  }
});

function onLogin() {
  let { user } = state;
  let { phone, code } = user;
  if (utils.isEmpty(phone)) {
    return state.errorMsg.phone = '手机号不能为空';
  }
  if(!utils.isPhoneNumber(phone)) {
    return state.errorMsg.phone = '手机号不正确';
  }
  if (utils.isEmpty(code)) {
    return state.errorMsg.code = '验证码不能为空';
  }
  User.verifyCode({ phone, code }).then((result) => {
    let errorCode = result.code;
    if(!utils.isEqual(errorCode, RESPONSE.SUCCESS)){
      return context.proxy.$toast({
        text: `登录失败：${errorCode}`,
        icon: 'error'
      });
    }
    let { data } = result;
    let { user_id, authorization, nickname, avatar, im_token } = data;
    if(!avatar){
      avatar = common.getTextAvatar(nickname);
    }
    if(!im_token){
      return state.errorMsg.code = '登录失败，IM Token 为空'
    }
    Storage.set(STORAGE.USER_TOKEN, { id: user_id, token: im_token, authorization: authorization, name: nickname, portrait: avatar });
    router.replace({ name: 'ConversationList' });
  });

}
let isSending = false;
function onSend(){
  let { user } = state;
  let { phone } = user;
  if (utils.isEmpty(phone)) {
    return state.errorMsg.phone = '手机号不可为空';
  }
  if (!utils.isPhoneNumber(phone)) {
    return state.errorMsg.phone = '手机号不正确';
  }
  if(isSending){
    isSending = true;
    return;
  }
  User.sendCode({ phone }).then((result) => {
    let errorCode = result.code;
    if(!utils.isEqual(errorCode, RESPONSE.SUCCESS)){
      return context.proxy.$toast({
        text: `发送验证码失败：${errorCode}`,
        icon: 'error'
      });
    }
    let seconds = 59;
    utils.extend(state, { btnLabel: seconds }); 
    let inteval = setInterval(() => {
      seconds -= 1;
      if(utils.isEqual(seconds, 1)){
        utils.extend(state, { btnLabel: defalutBtnLabel, isSending: false });
        return clearInterval(inteval);
      }
      utils.extend(state, { btnLabel: seconds });
    }, 1000);
  });
}
function onInput() {
  utils.extend(state.errorMsg, { phone: '', code: '' });
}
</script>
<template>
  <WinHeader></WinHeader>
  <div class="tyn-root jg-login-container" :class="{ 'tyn-desktop-root': juggle.isDesktop(), 'tyn-web-root': !juggle.isDesktop() }">
    <div class="jg-nlogin-main">
      <div class="jg-nlogin-qrbox">
        <div class="jg-nlogin-icon"></div>
      </div>
      <div class="jg-nlogin-intro-box">
        <h2 class="jg-nlogin-intro-title">Log in to JuggleChat by QR Code</h2>
        <ul class="jg-nlogin-intros">
          <li class="jg-nlogin-intro wr wr-1">Open JuggleChat on your phone</li>
          <li class="jg-nlogin-intro wr wr-2">Go to First Page -> QRCode</li>
          <li class="jg-nlogin-intro wr wr-3">Point your phone at this screen to confirm login</li>
        </ul>
        <div class="jg-nlogin-button"> LOG IN BY PHONE NUMBER </div>
      </div>
    </div>
  </div>
  <JFooter></JFooter>
</template>