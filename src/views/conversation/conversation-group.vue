<script setup>
import im from "../../common/im";
import { reactive, watch } from "vue";
import utils from "../../common/utils";
import group from "../../services/group";
import ModalConversationGroup from "../../components/modal-groups.vue";

const props = defineProps(["isShow"]);
const emit = defineEmits(["oncancel"]);
let juggle = im.getCurrent();
let { MessageType } = juggle;

let state = reactive({
  groups: [
    { id: 'all', isActive: true, icon: 'wr-mg-msg', name: '消息' },
    { id: 'mention', isActive: false, icon: 'wr-mg-mention', name: '@我' },
    { id: 'user', isActive: false, icon: 'wr-mg-user', name: '单聊' },
    { id: 'group', isActive: false, icon: 'wr-mg-group', name: '群组' },
  ],
  isShowGroupManager: false,
});

function onSelected(item, index){
  utils.map(state.groups, (group) => {
    let isActive = utils.isEqual(group.id, item.id);
    utils.extend(group, { isActive });
    return group;
  })
}

function onShowGroupManager(isShow){
  state.isShowGroupManager = isShow;
}
</script>

<template>
  <div class="jg-conver-group-container" :class="[props.isShow ? 'show-group' : '']">
    <div class="jg-conversations-header">
      <ul class="jg-conversations-tools">
        <li></li>
        <li class="jg-conversation-tool wr wr-setting" @click="onShowGroupManager(true)">设置</li>
      </ul>
    </div>
    <ul class="jg-conver-groups">
      <li class="jg-conver-group" v-for="(group, index) in state.groups" :key="group.id" :class="{'active': group.isActive}" @click="onSelected(group, index)">
        <div class="jg-conver-group-content wr" :class="[group.icon]" >{{ group.name }}</div>
      </li>
    </ul>
  </div>
  <ModalConversationGroup :is-show="state.isShowGroupManager" @oncancel="onShowGroupManager(false)"></ModalConversationGroup>
</template>
