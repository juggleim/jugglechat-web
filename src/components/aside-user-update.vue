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

const props = defineProps(["isShow", "disabledClose"]);
const emit = defineEmits(["oncancel", "onconfirm"]);

let current = { };
let user = Storage.get(STORAGE.USER_TOKEN);
if(utils.isEmpty(current)){
  current.isSelected = true;
}

let state = reactive({
  i18n: common.i18n(),
  current: current,
  username: user.name || '',
  isNameError: false,
});

function onCancel(){
  emit('oncancel', {});
}

let isSaveingUser = false;
function onConfirm(){
  let { current, username } = state;
  if (utils.isEmpty(username)) {
    return state.isNameError = true;
  }
  let { id } = user;

  if(isSaveingUser){
    return;
  }
  isSaveingUser = true;
  let _user = { id, portrait: current.url, name: username };
  User.update(_user).then((result) => {
    isSaveingUser = false;
    if(!utils.isEqual(result.code, RESPONSE.SUCCESS)){
      let errorCode = result.code;
      return context.proxy.$toast({
        text: common.errorText(errorCode),
        icon: 'error'
      });
    }
    
    let existUser = Storage.get(STORAGE.USER_TOKEN);
    existUser = utils.extend(existUser, _user);
    Storage.set(STORAGE.USER_TOKEN, existUser);
    emitter.$emit(EVENT_NAME.ON_USER_INFO_UPDATE, { user: existUser });

    onCancel();
  });
}

function onNameInput(){
  state.isNameError = false;
}

</script>

<template>
  <Asider :is-show="props.isShow" :title="state.i18n.USER_MODIFY.TITLE" @oncancel="onCancel" :disabled-close="props.disabledClose">
    <div class="jg-aside-userupdate-body">
      <div class="form-group">
        <input type="text" class="form-control" :class="{'form-control-warn': state.isNameError}" :placeholder="state.i18n.USER_MODIFY.PLACEHOLDER" v-model="state.username" @input="onNameInput()">
      </div>
      <div class="form-group">
        <div class="form-control-wrap">
          <a class="btn btn-primary-soft w-100" @click="onConfirm()">{{ state.i18n.COMMON.SAVE_BTN }}</a>
        </div>
      </div>
    </div>
  </Asider>
</template>
