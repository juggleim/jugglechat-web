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
  <div class="tyn-root jg-login-root"  :class="{'tyn-web-root': !juggle.isDesktop()}">
      <div class="jg-login-header">
        <div class="jg-login-logo"></div>
        <span class="jg-login-appname">JuggleChat</span>
      </div>
      <div class="jg-login-main">
        <div class="jg-login-banner"></div>
        <div class="jg-login-formbox">
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
        </div>
      </div>
  </div>
  <JFooter></JFooter>
</template>