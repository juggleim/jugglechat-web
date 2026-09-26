<script setup>
import { reactive, watch } from "vue";
import utils from "../common/utils";
import { Friend, Group } from "../services";
import Storage from "../common/storage";
import { STORAGE, EVENT_NAME } from "../common/enum";
import Asider from "./aside.vue";
import Avatar from "./avatar.vue";
import emitter from "../common/emmit";
import common from "../common/common";

const props = defineProps(["isShow", "groupId", "members"]);
const emit = defineEmits(["oncancel", "onconfirm"]);

let user = Storage.get(STORAGE.USER_TOKEN);
let i18n = common.i18n();

let state = reactive({
  members: [],
  isGroupRemoveMemberLoading: false
});
watch(() => props.isShow, () => {
  let list = [];
  utils.forEach(props.members, (member) => {
    let disabled = utils.isEqual(user.id, member.id);
    let item = {...member};
    item.disabled = disabled;
    item.isTransferChecked = disabled;
    list.push(item);
  });
  state.members = utils.clone(list);
});
function onCancel() {
  emit('oncancel', {});
}
function onConfirm() {
  let list = utils.filter(state.members, (item) => {
    return item.isTransferChecked && user.id != item.id;
  });
  let members = utils.clone(list)
  removeMembers(members);
}
function removeMembers(members){
  if (state.isGroupRemoveMemberLoading) {
    return;
  }
  state.isGroupRemoveMemberLoading = true;
  if (utils.isEqual(members.length, state.members.length)) {
    return context.proxy.$toast({
      text: i18n.UI.MEMBER_REQUIRED,
      icon: 'warn'
    });
  }

  Group.removeMember({ id: props.groupId, members }).then(() => {
    let conversation = { conversationId: props.groupId };
    emitter.$emit(EVENT_NAME.ON_GROUP_MEMBER_REMOVED, { conversation, members })
    emit('onconfirm', { members });
    state.isGroupRemoveMemberLoading = false;
    // utils.forEach(list, (item) => {
    //   utils.extend(item, { isTransferChecked: false });
    // });
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
  <Asider :is-show="props.isShow" :title="i18n.UI.REMOVE_MEMBERS" @oncancel="onCancel" :right="props.right">
    <div class="jg-aside-group-body">
      <ul class="tyn-media-list gap gap-2">
        <li v-for="item in state.members" @click="onSelected(item)" class="tyn-media-item">
          <span class="wr tyn-tfcontact-s"
            :class="[item.isTransferChecked ? 'wr-success-square tyn-contact-checked' : 'wr-square', item.disabled ? 'wr-disabled' : '']"></span>

            <Avatar :cls="'tyn-size-md jg-size-md'" :avatar="item.portrait" :name="item.name"></Avatar>

            <div class="tyn-media-col">
              <div class="tyn-media-row">
                <h6 class="name">{{ item.name }}</h6>
              </div>
            </div>
        </li>
      </ul>
      <ul class="tyn-list-inline gap gap-3 pt-3 tny-content-center jg-tools">
        <li>
          <button class="btn btn-sm btn-success" @click="onConfirm()">{{ i18n.COMMON.CONFIRM_BTN }}</button>
        </li>
        <li>
          <button class="btn btn-sm btn-light" @click="onCancel()">{{ i18n.COMMON.CANCEL_BTN }}</button>
        </li>
      </ul>
      <div class="modal-body modal-loading" v-if="state.isGroupRemoveMemberLoading">
        <div class="loading-content"></div>
      </div>
    </div>
  </Asider>
</template>
