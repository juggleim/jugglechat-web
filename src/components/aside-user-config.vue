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
  settings: [
    {
      uid: SETTING_KEY_TYPE.LANGUAGE,
      title: '推送语言',
      currentValue: 'zh-Hans-CN',
      items: [
        { name: '中文', value: 'zh-Hans-CN' },
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

watch(() => props.isShow, () => {
  if(props.isShow){
    getUser();
  }
})

</script>

<template>
  <Asider :is-show="props.isShow" :title="'用户设置'" :right="props.right" @oncancel="onCancel">
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
