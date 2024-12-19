<script setup>
import JFooter from '../../components/footer.vue';
import utils from "../../common/utils";
import { reactive, getCurrentInstance, watch } from "vue";
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
  isQRLogin: false,
  isLoadingQR: false,
  isShowRefreshQrcode: false,
  qrcode: {
    img: '',
    uid: ''
  },
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

function onVerifySuccess(result){
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
}

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
    onVerifySuccess(result);
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
function setQrLogin(isQR){
  state.isQRLogin = isQR;
}

function getLoginQR(){
  state.isLoadingQR = true;
  User.getQRCode().then((result) => {
    state.isLoadingQR = false;
    let { code, data } = result;
    if(!utils.isEqual(code, RESPONSE.SUCCESS)){
      return;
    }
    let { qr_code: img, id } = data;
    utils.extend(state, { qrcode: { img, uid: id }, isShowRefreshQrcode: false });

    if(state.isQRLogin){
      startPolling()
    }
  });
}
getLoginQR();

let pollingTimer = 0;
function startPolling(){
  let { qrcode: { uid } } = state;
  if(!uid){
    return;
  }
  User.startPolling({ id: uid }).then((result) => {
    let { code, data } = result;

    if(utils.isEqual(code, RESPONSE.LOGIN_QR_WATTING)){
      pollingTimer = setTimeout(() => {
        startPolling();
      }, 2 * 1000);
    }
    
    if(utils.isEqual(code, RESPONSE.LOGIN_QR_EXPIRE)){
      state.isShowRefreshQrcode = true;
    }
    
    if(utils.isEqual(code, RESPONSE.SUCCESS)){
      onVerifySuccess(result);
    }
    
  });
}
function stopPolling(){
  clearTimeout(pollingTimer);
}
watch(() => state.isQRLogin, (isQR) => {
  if(isQR){
    startPolling();
  }else{
    stopPolling();
  }
})
</script>
<template>
  <WinHeader></WinHeader>
  <div class="tyn-root jg-login-container" :class="{ 'tyn-desktop-root': juggle.isDesktop(), 'tyn-web-root': !juggle.isDesktop() }">
    <div class="jg-nlogin-main" v-if="state.isQRLogin">
      <div class="jg-nlogin-qrbox" :style="{ 'background-image': 'url(data:image/png;base64,' + state.qrcode.img + ')' }">
        <div class="jg-nlogin-icon"></div>
        <div class="jg-nlogin-loading-box" v-if="state.isShowRefreshQrcode">
          <div class="jg-nlogin-loading" v-if="state.isLoadingQR"></div>
          <div class="jg-nlogin-refresh" v-else>
            <button class="btn btn-sm btn-success" @click="getLoginQR()">刷新二维码</button>
          </div>
        </div>
      </div>
      <div class="jg-nlogin-intro-box">
        <h2 class="jg-nlogin-intro-title">Log in to JuggleChat by QR Code</h2>
        <ul class="jg-nlogin-intros">
          <li class="jg-nlogin-intro wr wr-1">Open JuggleChat on your phone</li>
          <li class="jg-nlogin-intro wr wr-2">Go to Home Page -> QRCode</li>
          <li class="jg-nlogin-intro wr wr-3">Point your phone at this screen to confirm login</li>
        </ul>
        <div class="jg-nlogin-button" @click="setQrLogin(false)"> LOG IN BY PHONE NUMBER </div>
      </div>
    </div>
    <div class="jg-nlogin-main" v-else>
      <div class="jg-nlogin-normalbox">
        <div class="jg-nlogin-nlicon"></div>
        <h2 class="jg-nlogin-nltitle">JuggleChat</h2>
        <span class="fs10">v1.7.23</span>
      </div>
      <div class="jg-nlogin-intro-box jg-nlogin-btnbox">
        <div class="form-group">
          <div class="form-control-wrap">
            <input type="text" class="form-control" v-model="state.user.phone" placeholder="输入手机号"
              @input="onInput()" @keydown.enter="onLogin()">
          </div>
          <label class="form-label" for="email-address">
            <span class="small ms-2 text-danger">{{ state.errorMsg.phone }}</span>
          </label>
        </div>
        <div class="form-group">
          <div class="form-control-wrap jg-login-sms form-control">
            <input type="text"  v-model="state.user.code" placeholder="万能验证码: 000000"
              @input="onInput()"  @keydown.enter="onLogin()">
            <div class="jg-login-sendcode" @click="onSend">{{ state.btnLabel }}</div>
          </div>
          <label class="form-label">
            <span class="small ms-2 text-danger">{{ state.errorMsg.code }}</span>
          </label>
        </div>
        <div class="form-group">
          <div class="form-control-wrap">
            <a class="btn btn-primary w-100" @click="onLogin()">登录</a>
          </div>
        </div>

        <!-- <div class="jg-nlogin-button jg-nlogin-num-btn"  @click="setQrLogin(true)"> LOG IN BY QE CODE </div> -->
      </div>
    </div>
  </div>
  <JFooter></JFooter>
</template>