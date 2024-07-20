<script setup>
import im from "../common/im";
import { reactive, watch } from "vue";
import utils from "../common/utils";
import { Friend, Group } from "../services";
import Storage from "../common/storage";
import { STORAGE } from "../common/enum";
const props = defineProps(["isShow", "groupId", "isLoading", "members"]);
const emit = defineEmits(["oncancel", "onconfirm"]);
let juggle = im.getCurrent();

let user = Storage.get(STORAGE.USER_TOKEN);

let state = reactive({
  members: []
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
  state.members = list;
});
function onCancel() {
  emit('oncancel', {});
}
function onConfirm() {
  let list = utils.filter(state.members, (item) => {
    return item.isTransferChecked && user.id != item.id;
  });
  let members = utils.clone(list)
  emit('onconfirm', { members });
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
          <h4 class="pb-2">群成员</h4>
          <ul class="tyn-media-list gap gap-2">
            <li v-for="item in state.members" @click="onSelected(item)">
              <div class="form-check form-check-algin">
                <span class="wr tyn-tfcontact-s"
                  :class="[item.isTransferChecked ? 'wr-success-square tyn-contact-checked' : 'wr-square', item.disabled ? 'wr-disabled' : '']"></span>
                <div class="form-check-label">
                  <div class="tyn-media-group">
                    <div class="tyn-media tyn-size-md d-none d-sm-inline-flex tyn-conver-avatar"
                      :style="{ 'background-image': 'url(' + item.portrait + ')' }">
                    </div>
                    <div class="tyn-media-col">
                      <div class="tyn-media-row">
                        <h6 class="name">{{ item.name }}</h6>
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
