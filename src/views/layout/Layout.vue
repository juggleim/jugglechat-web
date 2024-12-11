<script setup>

import WinHeader from '../../components/win-header.vue';
import JFooter from '../../components/footer.vue';
import im from "../../common/im";
import utils from '../../common/utils';
import ModalCall from "../../components/modal-call.vue";
import CallInviteNotify from '../../components/modal-call-invite.vue';
import CallCore from "../conversation/call";
import emitter from "../../common/emmit";
import { reactive, getCurrentInstance, nextTick, watch } from "vue";
import { EVENT_NAME } from "../../common/enum";
import conversationTools from "../conversation/conversation";

let juggle = im.getCurrent();
let juggleCall = im.getRTCEngine();
let { CallEvent } = im;
let { MediaType } = juggle;

let state = reactive({
  isShowCall: false,
  activeCallId: '',
  callMembers: [],
  callNotifyList: []
});
let callCore = CallCore(state);

juggleCall.on(CallEvent.INVITED, ({ target }) => {
  let { callId } = target;
  let session = juggleCall.getSession({ callId })
  state.callNotifyList.push(session);
});

emitter.$on(EVENT_NAME.ON_SHOW_CALL_DIALOG, ({ isShow, members, isCall, isMulti, mediaType }) => {
  state.callMembers = members;
  if(isCall){
    let session = juggleCall.create();
    state.activeCallId = session.callId;
    let isEnableCamera = true;
    if(utils.isEqual(mediaType, MediaType.AUDIO)){
      isEnableCamera = false;
    }
    if(isMulti){
      let memberIds = utils.map(members, (member) => {
        return member.id;
      });
      session.startMultiCall({ memberIds, isEnableCamera });
    }else{
      session.startSingleCall({ memberId: members[1].id, isEnableCamera });
    }
  }
  state.isShowCall = isShow;
});

function onaccept({ callId }){
  state.activeCallId = callId;
  removeNotify({ callId });

  let session = juggleCall.getSession({ callId });
  let members = session.members;
  emitter.$emit(EVENT_NAME.ON_SHOW_CALL_DIALOG, { isShow: true, members, isCall: false })
  session.accept();
}

function onhangup({ callId }){ 
  let session = juggleCall.getSession({ callId });
  session.hangup();
  removeNotify({ callId });
}

emitter.$on(EVENT_NAME.ON_CALL_FINISHED, (event) => {
  let { callId } = event;
  removeNotify({ callId });
})
function removeNotify({ callId }){
  let index = utils.find(state.callNotifyList, (item) => {
    return utils.isEqual(item.callId, callId);
  });
  if(index > -1){
    state.callNotifyList.splice(index, 1);
  }
}

</script>

<template>
  <WinHeader></WinHeader>
  <div class="tyn-root" :class="{ 'tyn-desktop-root': juggle.isDesktop(), 'tyn-web-root': !juggle.isDesktop() }">
    <RouterView v-slot="{ Component, route }">
      <component :is="Component" :key="route.fullPath" />
    </RouterView>
  </div>
  <JFooter></JFooter>
  <ModalCall :is-show="state.isShowCall" :members="state.callMembers" :callid="state.activeCallId" @onhangup="callCore.onHangup"></ModalCall>
  <CallInviteNotify v-for="(notify, index) in state.callNotifyList" :callid="notify.callId" :index="index" :inviter="notify.inviter" @onhangup="onhangup" @onaccept="onaccept"></CallInviteNotify>
</template>
