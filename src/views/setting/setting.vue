<script setup>
import utils from "../../common/utils";
import { useRouter } from "vue-router";
import { reactive, getCurrentInstance, watch } from "vue";
import { RESPONSE, EVENT_NAME, ASIDE_MENU_TYPE, SETTING_CARDS }  from "../../common/enum";

import H5TBar from "../conversation/conversation-tbar.vue";
import H5Header from "../conversation/conversation-header.vue";

import AsiderUserUpdate from "../../components/aside-user-update.vue";
import AsiderUserConfig from "../../components/aside-user-config.vue";
import AsiderUserAccount from "../../components/aside-user-account.vue";
import AsiderQrCode from "../../components/aside-qrcode.vue";

import { STORAGE } from "../../common/enum";
import Storage from "../../common/storage";
import common from "../../common/common";
import emitter from "../../common/emmit";

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
emitter.$on(EVENT_NAME.ON_USER_INFO_UPDATE, ({ user }) => {
  utils.extend(state.user, { ...user });
});
</script>
<template>
  <div class="tyn-contact tyn-content tyn-content-full-height tyn-chat has-aside-base">
    <div class="tyn-aside tyn-contact-aside">
      <H5Header></H5Header>
      <div class="tyn-aside-body jg-setting-aside">
        <ul class="jg-cards">
          <li class="jg-card jg-card-userinfo">
            <ul class="jg-ul">
              <li class="jg-li jg-card-li-userinfo">
                <div class="tyn-avatar jg-header-user-avatar" :style="{ 'background-image': 'url(' + state.user.portrait + ')' }"></div>
                <div class="jg-header-user-name">{{ state.user.name || state.user.id }}</div>
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
      <!-- <H5TBar></H5TBar> -->
    </div>
  </div>
  <AsiderUserUpdate :is-show="state.isShowUserUpdateAsider" :right="1" @oncancel="onShowUserUpdateAsider(false)"></AsiderUserUpdate>
  <AsiderUserConfig :is-show="state.isShowUserSettingAsider" :right="1" @oncancel="onShowUserSettingAsider(false)"></AsiderUserConfig>
  <AsiderUserAccount :is-show="state.isShowAccountAsider" :right="1" @oncancel="onShowAccountAsider(false)"></AsiderUserAccount>
  <AsiderQrCode 
    :is-show="state.isShowUserQrcode"
    :right="1"
    :title="'我的二维码'"
    :desc="'扫一扫二维码，加我为好友'"
    :isGroup="0"
    :uid="state.user.id"
    @oncancel="onShowUserQrCode(false)">
  </AsiderQrCode>
</template>