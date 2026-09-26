<script setup>
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import common from "../common/common";
import emitter from "../common/emmit";
import Asider from "./aside.vue";
import Avatar from "./avatar.vue";
import im from "../common/im";
import { User, Group, Friend } from "../services/index";
import { RESPONSE, STORAGE, GROUP_AVATAR, EVENT_NAME } from "../common/enum";
import Storage from "../common/storage";

const context = getCurrentInstance();
const props = defineProps(["isShow", "conversation", "members", "right"]);
const emit = defineEmits(["oncancel", "onconfirm"]);
let juggle = im.getCurrent();
let { ConversationType } = juggle;
let state = reactive({
  friends: [],
  isCreateGroupLoading: false,
  i18n: common.i18n(),
});
let user = Storage.get(STORAGE.USER_TOKEN);

function getFriends(callback) {
  Friend.getList({ startUserId: '', count: 50, userId: user.id }).then((result) => {
    let { data: { items } } = result;
    callback(items);
  });
}
watch(() => props.isShow, () => {
  getFriends((items) => {
    items.push({
      user_id: user.id,
      nickname: user.name,
      avatar: user.portrait
    });
    let { conversationType, conversationId } = props.conversation || {};
      items = utils.map(items, (item) => {
        item.isTransferChecked = utils.isEqual(item.user_id, conversationId);
        let index = utils.find(props.members, (member) => {
          return utils.isEqual(member.id, item.user_id);
        });
        if(index > -1 || utils.isEqual(user.id, item.user_id)){
          utils.extend(item, {
            disabled: true,
            isTransferChecked: true
          })
        }
        return item;
      });
      utils.extend(state, { friends: items })
  });
});

function onCancel(members = []) {
  emit('oncancel', { members });
}

function onConfirm(){
  if (state.isCreateGroupLoading) {
    return;
  }
  state.isCreateGroupLoading = true;

  let list = utils.filter(state.friends, (item) => {
    return item.isTransferChecked;
  });
  let friends = utils.clone(list)

  let name = utils.map(friends, (friend) => {
    return friend.nickname;
  }).join(', ');
  if(name.length > 20){
    name = `${name.substr(0, 20)}...`;
  }

  let members = utils.filter(friends, (friend) => {
    return !friend.disabled;
  });

  if(props.members.length > 0){
    let { conversationId } = props.conversation;
    return Group.invite({ group_id: conversationId, members }).then((result) => {
      let { code } = result;
      state.isCreateGroupLoading = false;
      onCancel(members);
      utils.forEach(list, (item) => {
        utils.extend(item, { isTransferChecked: false });
      });
    });
  }
  let avatar = GROUP_AVATAR;
  Group.create({ name, avatar, members }).then((result) => {
    let { data: group } = result;
    let conversation = {
      conversationType: ConversationType.GROUP,
      conversationId: group.group_id,
      conversationTitle: name,
      conversationPortrait: avatar,
      latestMessage: {}
    };
    emitter.$emit(EVENT_NAME.ON_GROUP_CREATED, { conversation })
    state.isCreateGroupLoading = false;
    setTimeout(() => {
      onCancel();
      utils.forEach(list, (item) => {
        utils.extend(item, { isTransferChecked: false });
      });
    }, 200)
  });
}

function onSelected(item) {
  if(item.disabled){
    return;
  }
  item.isTransferChecked = !item.isTransferChecked;
}

</script>

<template>
  <Asider :is-show="props.isShow" :title="props.title || state.i18n.CREATE_GROUP.TITLE" @oncancel="onCancel" :right="props.right">
    <div class="jg-aside-group-body">
      <ul class="tyn-media-list gap gap-2">
        <li v-for="item in state.friends" @click="onSelected(item)" class="tyn-media-item">
          <span class="wr tyn-tfcontact-s"
            :class="[item.isTransferChecked ? 'wr-success-square tyn-contact-checked' : 'wr-square', item.disabled ? 'wr-disabled' : '']"></span>

            <Avatar :cls="'tyn-size-md jg-size-md'" :avatar="item.avatar" :name="item.nickname"></Avatar>

            <div class="tyn-media-col">
              <div class="tyn-media-row">
                <h6 class="name">{{ item.nickname }}</h6>
              </div>
            </div>
        </li>
      </ul>
      <ul class="tyn-list-inline gap gap-3 pt-3 tny-content-center jg-tools">
        <li>
          <button class="btn btn-sm btn-success" @click="onConfirm()">{{ state.i18n.COMMON.CONFIRM_BTN }}</button>
        </li>
        <li>
          <button class="btn btn-sm btn-light" @click="onCancel()">{{ state.i18n.COMMON.CANCEL_BTN }}</button>
        </li>
      </ul>
      <div class="modal-body modal-loading" v-if="props.isLoading">
        <div class="loading-content"></div>
      </div>
    </div>
  </Asider>
</template>
