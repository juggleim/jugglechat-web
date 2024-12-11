<script setup>
import im from "../common/im";
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import { User, Friend } from "../services/index";
import { RESPONSE, EVENT_NAME, STORAGE } from "../common/enum";
import common from "../common/common";
import Clocker from "../common/clock";
import emitter from "../common/emmit";
import Storage from "../common/storage";

const props = defineProps(["isShow", "members", "callid"]);
const emit = defineEmits(["onhangup"]);

const context = getCurrentInstance();

let { CallEvent } = im;
let juggle = im.getCurrent();
let juggleCall = im.getRTCEngine();

let state = reactive({
  list: [],
  activeCallId: '',
  callTime: '',
  isMuteSpeaker: false,
  isMuteMic: false,
  session: {},
  friends: [],
  isShowInvite: false
});

let clocker = Clocker();

juggleCall.on(CallEvent.MEMBER_JOINED, (event) => {
  console.log('CallEvent.MEMBER_JOINED', event);
  let { target: { callId, member } } = event;
  let session = juggleCall.getSession({ callId });
  let userId = member.id;
  let el = createVideoBox(userId);
  session.setVideoView([{ userId, videoElement: el }]);
});
juggleCall.on(CallEvent.MEMBER_QUIT, (event) => {
  console.log('CallEvent.MEMBER_QUIT', event);
  let { target: { member, callId } } = event;
  removeUser(member);
  let session = juggleCall.getSession({ callId });
  if(!session.isMultiCall){
    emit("onhangup", { callId: state.activeCallId, isOneSelf: false });
  }
});
juggleCall.on(CallEvent.CALL_CONNECTED, () => {
  clocker.start(({ time }) => {
    state.callTime = time;
  }); 
});

juggleCall.on(CallEvent.CALL_FINISHED, (event) => {
  clocker.stop();
  console.log('CallEvent.CALL_FINISHED', event);
  emitter.$emit(EVENT_NAME.ON_CALL_FINISHED, event)
});

function onHangup() {
  emit("onhangup", { callId: state.activeCallId, isOneSelf: true });
}
function onmutemic(){
  let { isMuteMic, activeCallId } = state;
  state.isMuteMic = !isMuteMic;
  let session = juggleCall.getSession({ callId: activeCallId })
  session.muteMicrophone(state.isMuteMic);
}
function onmutespeaker(){
  let { isMuteSpeaker, activeCallId } = state;
  state.isMuteSpeaker = !isMuteSpeaker;
  let session = juggleCall.getSession({ callId: activeCallId })
  session.muteSpeaker(state.isMuteSpeaker);
}
watch(() => props.isShow, () => {
  if (!props.isShow) {
    utils.extend(state, { list: [], callTime: '' });
  }else{
    state.activeCallId = props.callid;
    state.session = juggleCall.getSession({ callId: props.callid });
    utils.forEach(props.members, (member) => {
      let { id, name, portrait } = member;
      state.list.push({ id, name, portrait, isLoading: true });
    });
    getFriends((items) => {
      utils.extend(state, { friends: items })
    });
  }
});

function removeUser(user){
  let index = utils.find(state.list, (item) =>{
    return utils.isEqual(item.id, user.id);
  });
  if(index > -1){
    state.list.splice(index, 1);
  }
}

function createVideoBox(userId){
  let { refs } = context;
  let node = document.createElement('div');
  node.id = `v_rtc_${userId}`;
  node.className = 'jcall-video-box';
  let parent = refs.rtcusers.querySelector(`div[uid="${userId}"]`);
  if(parent){
    let videoBox = parent.querySelector('.jcall-user-video');
    videoBox.appendChild(node);
  }
  return node;
}

function getFriends(callback) {
  let user = Storage.get(STORAGE.USER_TOKEN);
  Friend.getList({ startUserId: '', count: 50, userId: user.id }).then((result) => {
    let { data: { items } } = result;
    callback(items.concat(items));
  });
}
function onSelected(item) {
  item.isTransferChecked = !item.isTransferChecked;
}
function onInvite(isShow){
  state.isShowInvite = isShow;
}
</script>
<template>
  <div class="call-modal" :class="[props.isShow ? 'show' : '']">
    <div class="modal-dialog modal-friend-add call-dialog">
      <div class="modal-content border-0 call-content">
        <div class="modal-body jcall-container">
          <div class="jcall-header">{{ state.callTime }}</div>
          <div class="jcall-users" ref="rtcusers">
            <div class="jcall-user" :uid="user.id" v-for="user in state.list" :style="{ 'background-image': 'url('+ user.portrait +')' }">
              <div class="jcall-user-loading" v-if="user.isLoading">
                <div class="loader-content"></div>
              </div>
              <div class="jcall-username">{{ user.name }}</div>
              <div class="jcall-user-video"></div>
            </div>
          </div>
          <div class="jcall-tools">
            <div class="jcall-tool" @click="onmutemic">
              <div class="jcall-tool-icon wr wr-rtc-mutemic" :class="{ 'jc-tool-active': !state.isMuteMic }"></div>
              <div class="jcall-tool-label" :class="{ 'jc-tool-active': !state.isMuteMic }">{{ state.isMuteMic ? '麦克风已禁用' : '麦克风已启用' }}</div>
            </div>
            <div class="jcall-tool" @click="onmutespeaker">
              <div class="jcall-tool-icon wr wr-rtc-ummutespeaker"  :class="{ 'jc-tool-active': !state.isMuteSpeaker }"></div>
              <div class="jcall-tool-label"  :class="{ 'jc-tool-active': !state.isMuteSpeaker }">{{ state.isMuteSpeaker ? '扬声器已关闭' : '扬声器已打开'}}</div>
            </div>
            <!-- <div class="jcall-tool" @click="on">
              <div class="jcall-tool-icon wr wr-rtc-mutecamera"></div>
              <div class="jcall-tool-label">摄像头</div>
            </div> -->
            <div class="jcall-tool" v-if="state.session.isMultiCall" @click="onInvite(true)">
              <div class="jcall-tool-icon wr wr-rtc-add jc-tool-active"></div>
              <div class="jcall-tool-label jc-tool-active">邀请成员</div>
            </div>
            <div class="jcall-tool" @click="onHangup">
              <div class="jcall-tool-icon wr wr-rtc-hangup"></div>
              <div class="jcall-tool-label jc-tool-active">挂断</div>
            </div>
          </div>
        </div>
        <div class="jcall-members-box" :class="{ 'jcall-mbox-show': state.isShowInvite }">
          <ul class="jgcall-mtools">
            <li class="jgcall-mtool wr wr-close jc-tool-active" @click="onInvite(false)"></li>
          </ul>
          <ul class="jgcall-members">
            <li class="jgcall-member" v-for="item in state.friends" @click="onSelected(item)">
              <div class="form-check form-check-algin">
                <span class="wr tyn-tfcontact-s"
                  :class="[item.isTransferChecked ? 'wr-success-square tyn-contact-checked' : 'wr-square', item.disabled ? 'wr-disabled' : '']"></span>
                <div class="form-check-label">
                  <div class="tyn-media-group">
                    <div class="tyn-media tyn-size-xs d-none d-sm-inline-flex tyn-conver-avatar"
                      :style="{ 'background-image': 'url(' + item.avatar + ')' }">
                    </div>
                    <div class="tyn-media-col">
                      <div class="tyn-media-row">
                        <h6 class="name">{{ item.nickname }}</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
          <ul class="jgcall-btns">
            <li class="jgcall-btn jc-tool-active">确定</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop call-modal-backdrop" :class="{ 'show': props.isShow }"></div>
</template>
