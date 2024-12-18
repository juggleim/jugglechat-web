<script setup>
import utils from "../../common/utils";
import { useRouter } from "vue-router";
import { reactive, getCurrentInstance, watch } from "vue";

import im from "../../common/im";
import { SETTING_TYPE, STORAGE, RESPONSE, EVENT_NAME }  from "../../common/enum";
import common from "../../common/common";
import Storage from "../../common/storage";
import { User } from "../../services/index";
import emitter from "../../common/emmit";
import JSelect from "../../components/jselect.vue";

const context = getCurrentInstance();
let { ConversationType } = im.getCurrent();
const router = useRouter();
const props = defineProps(["type"]);
let avatars = common.getAvatars();

let SETTING_KEY_TYPE = {
  LANGUAGE: 'language',
  FRIEND_VERIFY: 'friend_verify_type',
  UNDISTURB: 'undisturb'
};

let currentAvatar = { };
let user = Storage.get(STORAGE.USER_TOKEN);
avatars = utils.map(avatars, (url) => {
  let isSelected = utils.isEqual(url, user.portrait);
  let _avatar = { url, isSelected };
  if(isSelected){
    currentAvatar = _avatar;
  }
  return _avatar;
});
if(utils.isEmpty(currentAvatar)){
  currentAvatar = avatars[0];
  currentAvatar.isSelected = true;
}

let state = reactive({
  type: props.type,
  avatars: avatars,
  currentAvatar: currentAvatar,
  username: user.name || '',
  isNameError: false,

  settings: [
    {
      uid: SETTING_KEY_TYPE.LANGUAGE,
      title: '推送语言',
      currentValue: 'zh_CN',
      items: [
        { name: '中文', value: 'zh_CN' },
        { name: '英文', value: 'en_US' },
      ]
    },
    {
      uid: SETTING_KEY_TYPE.FRIEND_VERIFY,
      title: '是否开启好友验证',
      currentValue: 1,
      items: [
        { name: '是', value: 1 },
        { name: '否', value: 0 },
      ]
    },
    {
      uid: SETTING_KEY_TYPE.UNDISTURB,
      title: '全局免打扰',
      currentValue: '',
      items: [
        { name: '允许通知', value: '' },
        { name: '08:00~12:00', value: '08:00~12:00' },
        { name: '19:00~20:00', value: '19:00~20:00' },
        { name: '23:00~06:00', value: '23:00~06:00' },
        
      ]
    }
  ]
  
});

function onLogout(){
  Storage.remove(STORAGE.USER_TOKEN);
  let juggle = im.getCurrent();
  juggle.disconnect();
  router.push({ name: "Login" });
}
let isSaveingUser = false;
function onSaveUser(){
  let { currentAvatar, username: name } = state;
  if (utils.isEmpty(name)) {
    return state.isNameError = true;
  }
  if(isSaveingUser){
    return;
  }
  isSaveingUser = true;
  let _user = { id: user.id, portrait: currentAvatar.url, name };
  User.update(_user).then((result) => {
    isSaveingUser = false;
    if(!utils.isEqual(result.code, RESPONSE.SUCCESS)){
      let errorCode = result.code;
      return context.proxy.$toast({
        text: `保存失败：${errorCode}`,
        icon: 'error'
      });
    }
    context.proxy.$toast({
      text: `保存成功`,
      icon: 'success'
    });
    Storage.set(STORAGE.USER_TOKEN, { ...user, ..._user });
    emitter.$emit(EVENT_NAME.ON_USER_INFO_UPDATE, { user: _user })
  });
}

function onSelected(avatar){
  let list = utils.map(state.avatars, (_avatar) => {
    _avatar.isSelected = utils.isEqual(_avatar.url, avatar.url);
    return _avatar;
  });
  utils.extend(state, { currentAvatar: avatar, avatars: list });
}
function onNameInput(){
  state.isNameError = false;
}

function getUser(){
  User.get({ id: user.id }, ({ data, code }) => {
    if(utils.isEqual(code, RESPONSE.SUCCESS)){
      let { friend_verify_type = 0,  undisturb = '',  language = 'zh_CN'  } = data.settings;
      let result = { friend_verify_type, undisturb, language };
      utils.forEach(state.settings, (setting) => {
        let { uid } = setting;
        let value = result[uid];
        if(utils.isEqual(uid, SETTING_KEY_TYPE.UNDISTURB) && undisturb){
          let item = utils.parse(undisturb);
          let rule = item.rules[0] || {};
          value = `${rule.start}~${rule.end}`;
        }
        utils.extend(setting, { currentValue: value });
      });
    }
  })
}
function formatTimes(result){
  let { value, uid } = result;
  let _value = value;
  if(utils.isEqual(uid, SETTING_KEY_TYPE.UNDISTURB) && value){
    let items = value.split('~');
    _value = utils.toJSON({
      switch: true,
      timezone: 'Asia/Shanghai',
      rules: [{ start: items[0], end: items[1] }]
    });
  }
  let data = {};
  data[uid] = _value;
  return data;
}
function onSettingChanged(result){
  let _result = formatTimes(result);
  let data = {};
  utils.forEach(state.settings, (setting) => {
    let { uid, currentValue } = setting;
    data[uid] = currentValue;
  });
  utils.extend(data, _result);
  console.log(data)
  User.updateSetting(data).then((result) => {
    if(!utils.isEqual(result.code, RESPONSE.SUCCESS)){
      let errorCode = result.code;
      return context.proxy.$toast({
        text: `修改配置失败：${errorCode}`,
        icon: 'error'
      });
    }
    context.proxy.$toast({
      text: `保存成功`,
      icon: 'success'
    });
  });
}
if(utils.isEqual(state.type, SETTING_TYPE.SETTING)){
  getUser();
}
watch(() => props.type, () => {
  state.type = props.type;
  if(utils.isEqual(state.type, SETTING_TYPE.SETTING)){
    getUser();
  }
})
</script>
<template>
  <div class="tyn-main tyn-content-inner">
    <div class="setting-content">
      <div class="jg-setting-body" v-if="utils.isEqual(state.type, SETTING_TYPE.USER)">
        <h5 class="pb-2">个人中心</h5>
        <div class="form-group">
          <input type="text" class="form-control" :class="{'form-control-warn': state.isNameError}" placeholder="输入昵称" v-model="state.username" @input="onNameInput()">
        </div>
        <div class="form-group form-avatars">
          <div class="jg-formuser-avatar" v-for="avatar in state.avatars" >
            <div class="form-avatar wr" @click.stop="onSelected(avatar)" :class="{'wr-mark form-avatar-selected': avatar.isSelected}" :style="{ 'background-image': 'url(' + avatar.url + ')' }"></div>
          </div>
        </div>
        <div class="form-group">
          <div class="form-control-wrap">
            <a class="btn btn-primary-soft w-100 jg-button" @click="onSaveUser()">保存</a>
          </div>
        </div>
      </div>
      <div class="jg-setting-body jg-setting-box" v-if="utils.isEqual(state.type, SETTING_TYPE.SETTING)">
        <h5 class="pb-2">用户设置</h5>
        <ul class="jg-ul jg-setting-ul">
          <li class="jg-li" v-for="setting in state.settings">
            <div class="jg-li-title">{{ setting.title }}</div>
            <JSelect :current="setting.currentValue" :uid="setting.uid" :list="setting.items" @onchanged="onSettingChanged"></JSelect>
          </li>
        </ul>
        <div class="form-group">
          <div class="form-control-wrap">
            <a class="btn btn-primary-soft w-100 jg-logout" @click="onLogout()">退出登录</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>