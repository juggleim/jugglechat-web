<script setup>
import im from "../common/im";
import { reactive, watch } from "vue";
import utils from "../common/utils";
import { Friend } from "../services";
import Storage from "../common/storage";
import { STORAGE } from "../common/enum";
const props = defineProps(["isShow", "conversation", "isLoading", "members"]);
const emit = defineEmits(["oncancel", "onconfirm"]);
let juggle = im.getCurrent();
let { ConversationType } = juggle;
let state = reactive({
  friends: []
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
    let { conversationType, conversationId } = props.conversation;
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

function onCancel() {
  emit('oncancel', {});
}
function onConfirm() {
  let list = utils.filter(state.friends, (item) => {
    return item.isTransferChecked;
  });
  let friends = utils.clone(list)
  emit('onconfirm', { friends });
  utils.forEach(list, (item) => {
    utils.extend(item, { isTransferChecked: false });
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
  <div class="modal tyn-modal" tabindex="-1" :class="[props.isShow ? 'fade show' : '']">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content border-0">
        <div class="modal-body">
          <h4 class="pb-2">联系人</h4>
          <ul class="tyn-media-list gap gap-2">
            <li v-for="item in state.friends" @click="onSelected(item)">
              <div class="form-check form-check-algin">
                <span class="wr tyn-tfcontact-s"
                  :class="[item.isTransferChecked ? 'wr-success-square tyn-contact-checked' : 'wr-square', item.disabled ? 'wr-disabled' : '']"></span>
                <div class="form-check-label">
                  <div class="tyn-media-group">
                    <div class="tyn-media tyn-size-md d-none d-sm-inline-flex tyn-conver-avatar"
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
          <ul class="tyn-list-inline gap gap-3 pt-3 tny-content-center">
            <li>
              <button class="btn btn-md btn-success" @click="onConfirm()">确认</button>
            </li>
            <li>
              <button class="btn btn-md btn-light" @click="onCancel()">取消</button>
            </li>
          </ul>
        </div>
        <button @click="onCancel()" class="btn btn-md btn-icon btn-pill btn-white shadow position-absolute top-0 end-0 mt-n3 me-n3 wr wr-close"></button>
        <div class="modal-body modal-loading" v-if="props.isLoading">
          <div class="loading-content"></div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ 'show': props.isShow }"></div>
  </div>
</template>
