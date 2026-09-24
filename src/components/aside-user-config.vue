<script setup>
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import common from "../common/common";
import emitter from "../common/emmit";
import Asider from "./aside.vue";
import im from "../common/im";
import { User } from "../services/index";
import { RESPONSE, STORAGE, EVENT_NAME } from "../common/enum";
import Storage from "../common/storage";
import JSelect from "./jselect.vue";

const props = defineProps(["isShow", "right"]);
const emit = defineEmits(["oncancel"]);
const context = getCurrentInstance();

let SETTING_KEY_TYPE = {
  LANGUAGE: 'language',
  FRIEND_VERIFY: 'friend_verify_type',
  UNDISTURB: 'undisturb'
};

let state = reactive({
  i18n: common.i18n(),
  settings: []
});

utils.extend(state, { 
  settings: getSettings()
})

function onCancel(){
  emit('oncancel', {});
}

function getUser(){
  let user = Storage.get(STORAGE.USER_TOKEN);
  User.get({ id: user.id }, ({ data, code }) => {
    if(utils.isEqual(code, RESPONSE.SUCCESS)){
      let { friend_verify_type = 0,  undisturb = '',  language = 'zh-Hans-CN'  } = data.settings;
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
    let _setting = formatTimes({ uid, value: currentValue })
    utils.extend(data, _setting)
  });
  utils.extend(data, _result);
  User.updateSetting(data).then((result) => {
    if(!utils.isEqual(result.code, RESPONSE.SUCCESS)){
      let errorCode = result.code;
      return context.proxy.$toast({
        text: common.errorText(errorCode),
        icon: 'error'
      });
    }
    context.proxy.$toast({
      text: state.i18n.COMMON.SAVE_SUCCESS,
      icon: 'success'
    });
  });
}

watch(() => props.isShow, () => {
  if(props.isShow){
    getUser();
  }
})


function getSettings(){
  let { USER_CONFIG, COMMON } = state.i18n;
  return [
    {
      uid: SETTING_KEY_TYPE.LANGUAGE,
      title: USER_CONFIG.PUSH_LANGUAGE,
      currentValue: 'zh-Hans-CN',
      items: [
        { name: state.i18n.UI.CHINESE, value: 'zh-Hans-CN' },
        { name: state.i18n.UI.ENGLISH, value: 'en_US' },
      ]
    },
    {
      uid: SETTING_KEY_TYPE.FRIEND_VERIFY,
      title: USER_CONFIG.FRIEND_VERIFY,
      currentValue: 1,
      items: [
        { name: COMMON.YES, value: 1 },
        { name: COMMON.NO, value: 0 },
      ]
    },
    {
      uid: SETTING_KEY_TYPE.UNDISTURB,
      title: USER_CONFIG.MUTE,
      currentValue: '',
      items: [
        { name: USER_CONFIG.ENABLE_MSG_NOTIFY, value: '' },
        { name: '08:00~12:00', value: '08:00~12:00' },
        { name: '19:00~20:00', value: '19:00~20:00' },
        { name: '23:00~06:00', value: '23:00~06:00' },
        
      ]
    }
  ];
}
</script>

<template>
  <Asider :is-show="props.isShow" :title="state.i18n.USER_CONFIG.TITLE" :right="props.right" @oncancel="onCancel">
    <div class="jg-aside-userconfig-body">
      <ul class="jg-ul jg-setting-ul">
        <li class="jg-li" v-for="setting in state.settings">
          <div class="jg-li-title">{{ setting.title }}</div>
          <JSelect :current="setting.currentValue" :uid="setting.uid" :list="setting.items" @onchanged="onSettingChanged"></JSelect>
        </li>
      </ul>
    </div>
  </Asider>
</template>
