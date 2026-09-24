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

watch(() => props.isShow, () => {
  if(props.isShow){
  }
})


function getSettings(){
  let { USER_LANGUAGE, COMMON } = common.i18n();
  let current = Storage.get(STORAGE.APP_LANGUAGE);
  return [
    {
      uid: SETTING_KEY_TYPE.LANGUAGE,
      title: USER_LANGUAGE.TITLE,
      currentValue: current.value || 'en',
      items: [
        { name: common.i18n().UI.CHINESE, value: 'zh' },
        { name: common.i18n().UI.ENGLISH, value: 'en' },
      ]
    }
  ];
}

function onSettingChanged(result){
  let { value } = result;
  Storage.set(STORAGE.APP_LANGUAGE, result);
  context.proxy.$toast({
    text: common.i18n().COMMON.SAVE_SUCCESS,
    icon: 'success'
  });
  utils.extend(state, { 
    i18n: common.i18n(),
    settings: getSettings()
  })
  setTimeout(() => {
    emitter.$emit(EVENT_NAME.ON_APP_LANGUAGE_CHANGED, {});
    location.reload();
  }, 200)
}
</script>

<template>
  <Asider :is-show="props.isShow" :title="state.i18n.USER_LANGUAGE.TITLE" :right="props.right" @oncancel="onCancel">
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
