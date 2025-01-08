<script setup>
import { reactive, watch, getCurrentInstance } from "vue";
import utils from "../common/utils";
import { Group } from "../services";
import Storage from "../common/storage";
import { STORAGE, RESPONSE } from "../common/enum";
import Asider from "./aside.vue";

const props = defineProps(["isShow", "groupId", "members"]);
const emit = defineEmits(["oncancel", "onfinish"]);

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
  <Asider :is-show="props.isShow" :title="'转让群主'" @oncancel="onCancel" :right="1">
    <div class="jg-aside-group-body">
      <ul class="tyn-media-list gap gap-2">
        <li v-for="(item, index) in state.members"  @click="onSelected(item, index)" class="tyn-media-item">
          <span class="wr tyn-tfcontact-s"
            :class="[item.isTransferChecked ? 'wr-radio-select tyn-contact-checked' : 'wr-radio', item.disabled ? 'wr-disabled' : '']"></span>
            <div class="tyn-media tyn-size-md tyn-conver-avatar"
              :style="{ 'background-image': 'url(' + item.portrait + ')' }">
            </div>
            <div class="tyn-media-col">
              <div class="tyn-media-row">
                <h6 class="name">{{ item.name }}</h6>
              </div>
            </div>
        </li>
      </ul>
      <ul class="tyn-list-inline gap gap-3 pt-3 tny-content-center jg-tools">
        <li>
          <button class="btn btn-sm btn-success" @click="onConfirm()">确认</button>
        </li>
        <li>
          <button class="btn btn-sm btn-light" @click="onCancel()">取消</button>
        </li>
      </ul>
    </div>
  </Asider>
</template>
