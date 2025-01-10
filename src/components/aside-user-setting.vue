<script setup>
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import common from "../common/common";
import emitter from "../common/emmit";
import Asider from "./aside.vue";

import AsiderUserUpdate from "./aside-user-update.vue";
import AsiderUserConfig from "./aside-user-config.vue";
import AsiderUserAccount from "./aside-user-account.vue";
import AsiderQrCode from "./aside-qrcode.vue";

import { User } from "../services/index";
import { RESPONSE, STORAGE, ASIDE_MENU_TYPE, EVENT_NAME, SETTING_CARDS } from "../common/enum";
import Storage from "../common/storage";

const context = getCurrentInstance();
const props = defineProps(["isShow"]);
const emit = defineEmits(["oncancel"]);

let user = Storage.get(STORAGE.USER_TOKEN);
let state = reactive({
  user: user,
  cards: SETTING_CARDS,
  isShowUserUpdateAsider: false,
  isShowUserSettingAsider: false,
  isShowAccountAsider: false,
  isShowUserQrcode: false,
});

function onLogout(){
  emitter.$emit(EVENT_NAME.UN_UNATHORIZED);
}

function onClick(menu){
  let { event } = menu;
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_UPDATE)){
    onShowUserUpdateAsider(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_SETTING)){
    onShowUserSettingAsider(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_ACCOUNT)){
    onShowAccountAsider(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_QRCODE)){
    onShowUserQrCode(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_LOGOUT)){
    emitter.$emit(EVENT_NAME.UN_UNATHORIZED);
  }
}
function onShowUserQrCode(isShow){
  state.isShowUserQrcode = isShow;
}
function onShowUserUpdateAsider(isShow){
  state.isShowUserUpdateAsider = isShow;
}
function onShowUserSettingAsider(isShow){
  state.isShowUserSettingAsider = isShow;
}
function onShowAccountAsider(isShow){
  state.isShowAccountAsider = isShow;
}
function onCancel() {
  emit('oncancel', {});
}

emitter.$on(EVENT_NAME.ON_USER_INFO_UPDATE, ({ user }) => {
  utils.extend(state.user, { ...user });
});
</script>

<template>
  <Asider :is-show="props.isShow" :title="'个人设置'" @oncancel="onCancel" :cls="'jg-aside-ust-box'">
    <div class="jg-aside-userst-body jg-setting-aside">
      <ul class="jg-cards">
          <li class="jg-card jg-card-userinfo">
            <ul class="jg-ul">
              <li class="jg-li jg-card-li-userinfo">
                <div class="tyn-avatar jg-header-user-avatar" :style="{ 'background-image': 'url(' + state.user.portrait + ')' }"></div>
                <div class="jg-header-user-name">{{ state.user.name }}</div>
              </li>
              <li class="jg-li">
                <div class="label">用户 ID</div>
                <div class="value">{{ state.user.id }}</div>
              </li>
            </ul>
          </li>
          <li class="jg-card" v-for="card in state.cards">
            <ul class="jg-ul">
              <li class="jg-li" v-for="menu in card.menus" @click.prevent="onClick(menu)">
                <a class="wr " :class="{ ['wr-' + menu.icon]: true, 'jg-force-warn-letter': menu.isWarn }">{{ menu.name }}</a>
              </li>
            </ul>
          </li>
        </ul>
    </div>
  </Asider>
  <AsiderUserUpdate :is-show="state.isShowUserUpdateAsider" @oncancel="onShowUserUpdateAsider(false)"></AsiderUserUpdate>
  <AsiderUserConfig :is-show="state.isShowUserSettingAsider" @oncancel="onShowUserSettingAsider(false)"></AsiderUserConfig>
  <AsiderUserAccount :is-show="state.isShowAccountAsider" @oncancel="onShowAccountAsider(false)"></AsiderUserAccount>

  <AsiderQrCode 
    :is-show="state.isShowUserQrcode"
    :right="0"
    :title="'我的二维码'"
    :desc="'扫一扫二维码，加我为好友'"
    :isGroup="0"
    :uid="state.user.id"
    @oncancel="onShowUserQrCode(false)">
  </AsiderQrCode>

</template>
