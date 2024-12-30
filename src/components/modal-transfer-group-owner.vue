<script setup>
import im from "../common/im";
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import { Group } from "../services";
import Storage from "../common/storage";
import { STORAGE, RESPONSE } from "../common/enum";
const props = defineProps(["isShow", "groupId", "members"]);
const emit = defineEmits(["oncancel", "onfinish"]);
let juggle = im.getCurrent();

let user = Storage.get(STORAGE.USER_TOKEN);
const context = getCurrentInstance();

let state = reactive({
  members: [],
  selectIndex: -1,
});
watch(() => props.isShow, () => {
  let list = [];
  utils.forEach(props.members, (member) => {
    let isSelf = utils.isEqual(user.id, member.id);
    let item = {...member};
    if(!isSelf){
      list.push(item);
    }
  });
  state.members = utils.clone(list);
});
function onCancel() {
  emit('oncancel', {});
}
function onConfirm() {
  let { selectIndex } = state;
  if(selectIndex == -1){
    return;
  }
  let member = state.members[selectIndex];
  Group.transfer({ group_id: props.groupId, memberId: member.id }).then((result) => {
    let { code } = result;
    if(!utils.isEqual(code, RESPONSE.SUCCESS)){
      context.proxy.$toast({
        text: `群主转让失败 ${code}`,
        icon: 'error'
      });
    }
    context.proxy.$toast({
      text: `转让成功`,
      icon: 'success'
    });
    emit('onfinish', { });
  })
}
function onSelected(item, index) {
  utils.forEach(state.members, (member) => {
    member.isTransferChecked = utils.isEqual(member.id, item.id);
  });
  state.selectIndex = index;
}
</script>
<template>
  <div class="modal tyn-modal" tabindex="-1" :class="[props.isShow ? 'fade show' : '']">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content border-0">
        <div class="modal-body">
          <h4 class="pb-2">转让群主</h4>
          <ul class="tyn-media-list gap gap-2">
            <li v-for="(item, index) in state.members" @click="onSelected(item, index)">
              <div class="form-check form-check-algin">
                <span class="wr tyn-tfcontact-s"
                  :class="[item.isTransferChecked ? 'wr-radio-select tyn-contact-checked' : 'wr-radio']"></span>
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
