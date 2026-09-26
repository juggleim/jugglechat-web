<script setup>
import utils from "../../common/utils";
import { useRouter } from "vue-router";
import { reactive, getCurrentInstance, watch } from "vue";
import { RESPONSE, EVENT_NAME, ASIDE_MENU_TYPE, USER_AGREEMENT }  from "../../common/enum";

import H5TBar from "../conversation/conversation-tbar.vue";
import H5Header from "../conversation/conversation-header.vue";

import AsiderUserUpdate from "../../components/aside-user-update.vue";
import AsiderUserConfig from "../../components/aside-user-config.vue";
import AsiderUserAccount from "../../components/aside-user-account.vue";
import AsiderQrCode from "../../components/aside-qrcode.vue";
import AsideFavoriteMsg from "../../components/aside-msg-favorite.vue";
import AsideUserAgreement from "../../components/aside-user-agreement.vue";
import Avatar from "../../components/avatar.vue";

import { STORAGE } from "../../common/enum";
import Storage from "../../common/storage";
import common from "../../common/common";
import emitter from "../../common/emmit";
import im from "../../common/im";

let juggle = im.getCurrent();
let { ConversationType, Event, ConnectionState } = juggle;

let user = Storage.get(STORAGE.USER_TOKEN);
let i18n = common.i18n();
let state = reactive({
  user: user,
  cards: common.getSettingCards(),
  isShowUserUpdateAsider: false,
  isShowUserSettingAsider: false,
  isShowAccountAsider: false,
  isShowUserQrcode: false,
  isShowFavoriteMsg: false,
  isShowUserAgreement: false,
  userAgreentUrl: '',
  userAgreentTitle: '',
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
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_FAV)){
    onShowFavoriteMsg(true);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_AGREEMENT)){
    onShowUserAgreement(true, USER_AGREEMENT.USER, i18n.UI.USER_AGREEMENT);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_PRIVACY)){
    onShowUserAgreement(true, USER_AGREEMENT.PRIVACY, i18n.UI.PRIVACY_POLICY);
  }
  if(utils.isEqual(event, ASIDE_MENU_TYPE.USER_LOGOUT)){
    emitter.$emit(EVENT_NAME.UN_UNATHORIZED);
  }
}

function connect(callback){
  im.connect(user, {
  success: callback,
  error: () => {}
  });
}
function onShowUserAgreement(isShow, url, title){
  utils.extend(state, { isShowUserAgreement: isShow, userAgreentUrl: url, userAgreentTitle: title });
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
function onShowFavoriteMsg(isShow){
  if(im.isConnected()){
    state.isShowFavoriteMsg = isShow;
  }else{
    connect(() => {
      state.isShowFavoriteMsg = isShow;
    });
  }
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
                <Avatar
                  :cls="'tyn-ss-avatar jg-header-user-avatar'"
                  :avatar="state.user.portrait"
                  :name="state.user.name || state.user.id">
                </Avatar>

                <div class="jg-header-user-name">{{ state.user.name || state.user.id }}</div>
              </li>
              <li class="jg-li">
                <div class="label">{{ i18n.UI.USER_ID }}</div>
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
  <AsideFavoriteMsg :is-show="state.isShowFavoriteMsg" :right="1" @oncancel="onShowFavoriteMsg(false)"></AsideFavoriteMsg>
  <AsideUserAgreement 
    :is-show="state.isShowUserAgreement" 
    :right="1" 
    :url="state.userAgreentUrl" 
    :title="state.userAgreentTitle" 
    @oncancel="onShowUserAgreement(false)"></AsideUserAgreement>
  <AsiderQrCode 
    :is-show="state.isShowUserQrcode"
    :right="1"
    :title="i18n.UI.MY_QR_CODE"
    :desc="i18n.UI.QR_ADD_FRIEND"
    :isGroup="0"
    :uid="state.user.id"
    @oncancel="onShowUserQrCode(false)">
  </AsiderQrCode>
</template>
