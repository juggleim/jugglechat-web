<script setup>
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import { Group } from "../services";
import Storage from "../common/storage";
import LanguageSelect from "../components/select-language.vue";
import JSwitch from "../components/switch.vue";
import { STORAGE, RESPONSE } from "../common/enum";
import Asider from "./aside.vue";

const props = defineProps(["isShow", "conversation"]);
const emit = defineEmits(["oncancel", "onfinish"]);

let user = Storage.get(STORAGE.USER_TOKEN);
const context = getCurrentInstance();

let T_UID = 'translator';

let state = reactive({
  source: 'auto',
  traget: 'en',
  isOpen: false,
  uid: T_UID
});
function onCancel() {
  emit('oncancel', {});
}
function onConfirm() {
  save();
  emit('onfinish', {});
}
function onSwitchChanged(e){
  let { isOpen } = e;
  state.isOpen = isOpen;
}
function save(){
  let { source, traget, isOpen } = state;
  let { conversationId, conversationType } = props.conversation;
  let key = getKey();
  Storage.set(key, { source: source, target: traget, isOpen })
}
function onChanged(result) {
  utils.extend(state, result);
}
function getKey(){
  let { conversationId, conversationType } = props.conversation;
  return `${STORAGE.TRANSLATE_CONF}_${conversationType}_${conversationId}`;
}
watch(() => props.isShow, () => {
  if(props.isShow){
    let key = getKey();
    let tConf = Storage.get(key);
    let { source, target, isOpen } = tConf;
    if(!isOpen){
      utils.extend(state, { isOpen });
      return;
    }
    utils.extend(state, { source: source, traget: target, isOpen })
  }
});

</script>

<template>
  <Asider :is-show="props.isShow" :title="'翻译设置'" @oncancel="onCancel" :right="1">
    <div class="jg-aside-translator-body">
      <ul class="tyn-media-list gap gap-2">
        <li class="jg-flex-row">
          <div class="tyn-aside-title">消息接收自动翻译</div>
          <JSwitch :uid="state.uid" :is-checked="state.isOpen" @onchanged="onSwitchChanged" ></JSwitch>
        </li>
        <li v-if="state.isOpen">
          <LanguageSelect :title="'原语言'" :is-auto="true" :current="state.source" :name="'source'" @save="onChanged"></LanguageSelect>
        </li>
        <li v-if="state.isOpen">
          <LanguageSelect :title="'目标语言'" :current="state.traget" :name="'traget'" @save="onChanged"></LanguageSelect>
        </li>
      </ul>
      <ul class="tyn-list-inline gap gap-3 pt-3 tny-content-center">
        <li>
          <button class="btn btn-md btn-success" @click="onConfirm()">确认</button>
        </li>
        <li>
          <button class="btn btn-md btn-light" @click="onCancel()">取消</button>
        </li>
      </ul>
    </div>
  </Asider>
</template>
