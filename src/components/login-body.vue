<script setup>
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import { useRouter } from "vue-router";
import { STORAGE, RESPONSE, LOGIN_TYPE } from "../common/enum";
import common from "../common/common";
import Storage from "../common/storage";
import { User } from "../services/index";
import im from "../common/im";
import ModalServerSetting from "../components/modal-server-setting.vue";

const props = defineProps(["isLogin", "isAdd", "isShow"]);

let juggle = im.getCurrent();
let context = getCurrentInstance();

const router = useRouter();
let i18n = common.i18n();
let state = reactive({
  isQRLogin: !utils.isMobile(),
  isLoadingQR: false,
  isShowRefreshQrcode: false,
  qrcode: {
    img: '',
    uid: ''
  },
  user: {
    phone: '',
    code: '',
    email: ''
  },
  btnLabel: i18n.LOGIN.COMMON.SEND,
  errorMsg: {
    phone: '',
    email: '',
    code: ''
  },
  loginType: LOGIN_TYPE.QRCODE,
  version: '1.8.0',
  i18n: i18n,
});

function onVerifySuccess(result){
  let { data } = result;
  let { i18n } = state;
  let { user_id, authorization, nickname, im_token } = data;
  if(!im_token){
    return state.errorMsg.code = i18n.LOGIN.ERROR.IM_TOKEN_EMPTY;
  }
  let user = { id: user_id, token: im_token, authorization: authorization, name: nickname, isUsed: true };
  Storage.set(STORAGE.USER_TOKEN,  user);

  let accounts = Storage.get(STORAGE.USERS);
  if(utils.isEmpty(accounts)){
    accounts = [user]
  }
  if(!props.isLogin){
    let index = utils.find(accounts, (account) => {
      return utils.isEqual(account.id, user.id);
    });
    if(utils.isEqual(index, -1)){
      accounts.push(user);
    }
  }
  Storage.set(STORAGE.USERS, accounts);
  if(props.isLogin){
    router.replace({ name: 'ConversationList' });
  }else{
    location.reload();
  }
}

function onLogin() {
  let { user, i18n } = state;
  let { phone, code } = user;
  if (utils.isEmpty(phone)) {
    return state.errorMsg.phone = i18n.LOGIN.ERROR.PHONE_EMPTY;
  }
  if(!utils.isPhoneNumber(phone)) {
    return state.errorMsg.phone = i18n.LOGIN.ERROR.PHONE_ERROR;
  }
  if (utils.isEmpty(code)) {
    return state.errorMsg.code = i18n.LOGIN.ERROR.VERIFY_CODE_EMPTY;
  }
  User.verifyCode({ phone, code }).then((result) => {
    let errorCode = result.code;
    if(!utils.isEqual(errorCode, RESPONSE.SUCCESS)){
      return context.proxy.$toast({
        text: common.errorText(errorCode),
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
    return state.errorMsg.phone = i18n.LOGIN.ERROR.PHONE_EMPTY;
  }
  if (!utils.isPhoneNumber(phone)) {
    return state.errorMsg.phone = i18n.LOGIN.ERROR.PHONE_ERROR;
  }
  if(isSending){
    return;
  }
  isSending = true;
  User.sendCode({ phone }).then((result) => {
    let errorCode = result.code;
    if(!utils.isEqual(errorCode, RESPONSE.SUCCESS)){
      return context.proxy.$toast({
        text: common.errorText(errorCode),
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
    }, 500);
  });
}

function onInput() {
  utils.extend(state.errorMsg, { phone: '', code: '', email: '' });
}
function setLoginType(type){
  state.loginType = type;
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

let user = Storage.get(STORAGE.USER_TOKEN);
if(!utils.isMobile() && !user.id){
  getLoginQR();
}

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
function onShowServerSetting(isShow){
  state.isShowServerSetting = isShow;
}
watch(() => state.loginType, (type) => {
  if(utils.isEqual(type, LOGIN_TYPE.QRCODE)){
    startPolling();
  }else{
    stopPolling();
  }
})
watch(() => props.isShow, () => {
  if(props.isShow){
    getLoginQR();
  }else{
    stopPolling();
  }
})

let isSendingEmail = false;
function onSendEmailCode(){
  let { user } = state;
  let { email } = user;
  if (utils.isEmpty(email)) {
    return state.errorMsg.email = i18n.LOGIN.ERROR.EMAIL_EMPTY;
  }
  if (!utils.isEmail(email)) {
    return state.errorMsg.email = i18n.LOGIN.ERROR.EMAIL_ERROR;
  }
  if(isSendingEmail){
    return;
  }
  isSendingEmail = true;
  User.sendEmailCode({ email }).then((result) => {
    let errorCode = result.code;
    if(!utils.isEqual(errorCode, RESPONSE.SUCCESS)){
      return context.proxy.$toast({
        text: common.errorText(errorCode),
        icon: 'error'
      });
    }
    let seconds = 59;
    utils.extend(state, { btnLabel: seconds }); 
    let inteval = setInterval(() => {
      seconds -= 1;
      if(utils.isEqual(seconds, 1)){
        utils.extend(state, { btnLabel: defalutBtnLabel, isSendingEmail: false });
        return clearInterval(inteval);
      }
      utils.extend(state, { btnLabel: seconds });
    }, 500);
  });
}
function onEmailLogin() {
  let { user } = state;
  let { email, code } = user;
  if (utils.isEmpty(email)) {
    return state.errorMsg.email = i18n.LOGIN.ERROR.EMAIL_EMPTY;
  }
  if(!utils.isEmail(email)) {
    return state.errorMsg.email = i18n.LOGIN.ERROR.EMAIL_ERROR;
  }
  if (utils.isEmpty(code)) {
    return state.errorMsg.code = i18n.LOGIN.ERROR.VERIFY_CODE_EMPTY;
  }
  User.verifyEmailCode({ email, code }).then((result) => {
    let errorCode = result.code;
    if(!utils.isEqual(errorCode, RESPONSE.SUCCESS)){
      return context.proxy.$toast({
        text: common.errorText(errorCode),
        icon: 'error'
      });
    }
    onVerifySuccess(result);
  });
}
</script>

<template>
  <div class="tyn-root jg-login-container" :class="{ 'tyn-desktop-root': juggle.isDesktop(), 'tyn-web-root': !juggle.isDesktop() }">
    <div class="jg-server-settings wr wr-security-sum" @click="onShowServerSetting(true)" v-if="props.isLogin"></div>
    
    <div class="jg-nlogin-main" v-if="utils.isEqual(state.loginType, LOGIN_TYPE.QRCODE)">
      <div class="jg-nlogin-qrbox" :style="{ 'background-image': 'url(data:image/png;base64,' + state.qrcode.img + ')' }">
        <div class="jg-nlogin-icon"></div>
        <div class="jg-nlogin-loading-box" v-if="state.isShowRefreshQrcode">
          <div class="jg-nlogin-loading" v-if="state.isLoadingQR"></div>
          <div class="jg-nlogin-refresh" v-else>
            <button class="btn btn-sm btn-success" @click="getLoginQR()">{{ state.i18n.LOGIN.QRCODE.REFRESH }}</button>
          </div>
        </div>
      </div>
      <div class="jg-nlogin-intro-box">
        <h2 class="jg-nlogin-intro-title">{{state.i18n.LOGIN.QRCODE.TITLE}}</h2>
        <ul class="jg-nlogin-intros">
          <li class="jg-nlogin-intro wr wr-1">{{ state.i18n.LOGIN.QRCODE.ONE_STEP }}</li>
          <li class="jg-nlogin-intro wr wr-2">{{ state.i18n.LOGIN.QRCODE.TWO_STEP }}</li>
          <li class="jg-nlogin-intro wr wr-3">{{ state.i18n.LOGIN.QRCODE.THREE_STEP }}</li>
        </ul>
        <div class="jg-nlogin-button" @click="setLoginType(LOGIN_TYPE.PHONE)">{{ state.i18n.LOGIN.PHONE.BTN }}</div>
        <div class="jg-nlogin-button jg-nlogin-num-btn"  @click="setLoginType(LOGIN_TYPE.EMAIL)">{{ state.i18n.LOGIN.EMAIL.BTN }}</div>
      </div>
    </div>

    <div class="jg-nlogin-main" v-if="utils.isEqual(state.loginType, LOGIN_TYPE.PHONE)">
      <div class="jg-nlogin-normalbox">
        <div class="jg-nlogin-nlicon"></div>
        <h2 class="jg-nlogin-nltitle">JuggleGram</h2>
        <span class="fs10">v{{ state.version }}</span>
      </div>
      <div class="jg-nlogin-intro-box jg-nlogin-btnbox">
        <div class="form-group">
          <div class="form-control-wrap">
            <input type="text" class="form-control" v-model="state.user.phone" :placeholder="state.i18n.LOGIN.PHONE.PLACEHOLDER"
              @input="onInput()" @keydown.enter="onLogin()">
          </div>
          <label class="form-label" for="email-address">
            <span class="small ms-2 text-danger">{{ state.errorMsg.phone }}</span>
          </label>
        </div>
        <div class="form-group">
          <div class="form-control-wrap jg-login-sms form-control">
            <input type="text"  v-model="state.user.code" :placeholder="state.i18n.LOGIN.PHONE.VERIFYCODE"
              @input="onInput()"  @keydown.enter="onLogin()">
            <div class="jg-login-sendcode" @click="onSend">{{ state.btnLabel }}</div>
          </div>
          <label class="form-label">
            <span class="small ms-2 text-danger">{{ state.errorMsg.code }}</span>
          </label>
        </div>
        <div class="form-group">
          <div class="form-control-wrap">
            <a class="btn btn-primary w-100" @click="onLogin()">{{ state.i18n.LOGIN.COMMON.NEXT }}</a>
          </div>
        </div>

        <div class="form-group jg-login-btn-group">
          <div class="jg-nlogin-button jg-nlogin-num-btn"  @click="setLoginType(LOGIN_TYPE.QRCODE)">{{ state.i18n.LOGIN.QRCODE.BTN }} </div>
          <div class="jg-nlogin-button jg-nlogin-num-btn"  @click="setLoginType(LOGIN_TYPE.EMAIL)">{{ state.i18n.LOGIN.EMAIL.BTN }}</div>
        </div>
      </div>
    </div>
    
    <div class="jg-nlogin-main" v-if="utils.isEqual(state.loginType, LOGIN_TYPE.EMAIL)">
      <div class="jg-nlogin-normalbox">
        <div class="jg-nlogin-nlicon"></div>
        <h2 class="jg-nlogin-nltitle">JuggleGram</h2>
        <span class="fs10">v{{ state.version }}</span>
      </div>
      <div class="jg-nlogin-intro-box jg-nlogin-btnbox">
        <div class="form-group">
          <div class="form-control-wrap">
            <input type="text" class="form-control" v-model="state.user.email" :placeholder="state.i18n.LOGIN.EMAIL.PLACEHOLDER"
              @input="onInput()" @keydown.enter="onLogin()">
          </div>
          <label class="form-label" for="email-address">
            <span class="small ms-2 text-danger">{{ state.errorMsg.email }}</span>
          </label>
        </div>
        <div class="form-group">
          <div class="form-control-wrap jg-login-sms form-control">
            <input type="text"  v-model="state.user.code" :placeholder="state.i18n.LOGIN.EMAIL.VERIFYCODE"
              @input="onInput()"  @keydown.enter="onLogin()">
            <div class="jg-login-sendcode" @click="onSendEmailCode">{{ state.btnLabel }}</div>
          </div>
          <label class="form-label">
            <span class="small ms-2 text-danger">{{ state.errorMsg.code }}</span>
          </label>
        </div>
        <div class="form-group">
          <div class="form-control-wrap">
            <a class="btn btn-primary w-100" @click="onEmailLogin()">{{ state.i18n.LOGIN.COMMON.NEXT }}</a>
          </div>
        </div>
        <div class="form-group jg-login-btn-group">
          <div class="jg-nlogin-button jg-nlogin-num-btn"  @click="setLoginType(LOGIN_TYPE.QRCODE)">{{ state.i18n.LOGIN.EMAIL.BTN }}</div>
          <div class="jg-nlogin-button jg-nlogin-num-btn"  @click="setLoginType(LOGIN_TYPE.PHONE)">{{ state.i18n.LOGIN.PHONE.BTN }}</div>
        </div>
      </div>
    </div>

  </div>
  <ModalServerSetting :is-show="state.isShowServerSetting" @oncancel="onShowServerSetting(false)"></ModalServerSetting>
</template>
