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
import AsiderUserLogin from "../components/aside-user-login.vue";
import Avatar from "./avatar.vue";

const props = defineProps(["isShow", "right"]);
const emit = defineEmits(["oncancel"]);
const context = getCurrentInstance();

let i18n = common.i18n();

let state = reactive({
  accounts: [],
  isShowLogin: false,
});

function onCancel(){
  emit('oncancel', {});
}

function onSelected(account, index){
  if(account.isUsed){
    return;
  }
  Storage.set(STORAGE.USER_TOKEN, account);
  setTimeout(() => {
    location.reload();
  }, 100);
}
function onShowLogin(isShow){
  console.log(state.isShowLogin)
  state.isShowLogin = isShow;
}
function onRemove(index){
  state.accounts.splice(index, 1);
  Storage.set(STORAGE.USERS, state.accounts);
}
function getAccounts(){
  let user = Storage.get(STORAGE.USER_TOKEN);
  let users = Storage.get(STORAGE.USERS);
  
  // 兼容老用户
  if(utils.isEmpty(users)){
    user.isUsed = true;
    users = [user];
  }
  users = utils.map(users, (_user) => {
    _user.isUsed = utils.isEqual(_user.id, user.id);
    return _user;
  });
  state.accounts = users;
}

watch(() => props.isShow, () => {
  if(props.isShow){
    getAccounts();
  }
})

</script>

<template>
  <Asider :is-show="props.isShow" :title="i18n.ACCOUNT_MANAGE.TITLE" :right="props.right" @oncancel="onCancel">
    <div class="jg-aside-useraccount-body">
      <ul class="jg-ul jg-acount-ul">
        <li class="jg-li jg-acount-li" @click="onShowLogin(true)">
          <div class="jg-account">
            <div class="tyn-size-rg wr wr-user-st jg-acount-avatar"></div>
            <div class="jg-account-name jg-account-add">{{ i18n.ACCOUNT_MANAGE.ADD }}</div>
          </div>
          <div class="jg-account-status wr wr-plus"></div>
        </li>
        <li class="jg-li jg-acount-li" v-for="(account, index) in state.accounts" @click="onSelected(account, index)" :class="{'jg-account-status-selected': account.isUsed}">
          <div class="jg-account">
            <Avatar :cls="'tyn-size-md jg-size-md '" :avatar="account.portrait" :name="account.name"></Avatar>
            <div class="jg-account-name">{{ account.name }}</div>
          </div>
          <div class="jg-account-remove" v-if="!account.isUsed" @click.prevent="onRemove(index)">{{ i18n.ACCOUNT_MANAGE.REMOVE }}</div>
        </li>
      </ul>
    </div>
  </Asider>
  <AsiderUserLogin :is-show="state.isShowLogin" @oncancel="onShowLogin(false)" :right="props.right"></AsiderUserLogin>
</template>
