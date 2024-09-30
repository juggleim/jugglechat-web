<script setup>
import im from "../../common/im";
import common from "../../common/common";

import { reactive, watch } from "vue";
import utils from "../../common/utils";
import group from "../../services/group";
import ModalConversationGroup from "../../components/modal-groups.vue";
import emitter from "../../common/emmit";
import { EVENT_NAME, CONVERATION_TAG_ID } from "../../common/enum";

const props = defineProps(["isShow"]);
const emit = defineEmits(["oncancel", "onchange"]);
let juggle = im.getCurrent();
let { MessageType } = juggle;

let state = reactive({
  groups: [],
  isShowGroupManager: false,
});

function onSelected(item, index){
  utils.map(state.groups, (group) => {
    let isActive = utils.isEqual(group.id, item.id);
    utils.extend(group, { isActive });
    return group;
  })
  emit('onchange', { item })
}

emitter.$on(EVENT_NAME.ON_CONVERSATION_TAG_CHANGED, ({ isRemove, tag }) => {
  if(isRemove){
    let { groups } = state;
    let index = utils.find(groups, (group) => {
      return utils.isEqual(group.id, tag.id);
    });
    if(index > -1){
      state.groups.splice(index, 1);
    }
    return;
  }
  state.groups.push(tag)
});

function onShowGroupManager(isShow){
  state.isShowGroupManager = isShow;
}

watch(() => props.isShow, async () => {
  if(props.isShow){
    // let { tags = [] } = await juggle.getConversationTags();
    let tags = [{id: CONVERATION_TAG_ID.ALL, name: '消息'}]
    if(utils.isEqual(state.groups.length, 0)){
      state.groups = common.formatTags(tags);
    }
  }
});

</script>

<template>
  <div class="jg-conver-group-container" :class="[props.isShow ? 'show-group' : '']">
    <div class="jg-conversations-header">
      <ul class="jg-conversations-tools">
        <li></li>
        <!-- <li class="jg-conversation-tool wr wr-setting" @click="onShowGroupManager(true)">设置</li> -->
      </ul>
    </div>
    <ul class="jg-conver-groups">
      <li class="jg-conver-group" v-for="(group, index) in state.groups" :key="group.id" :class="{'active': group.isActive}" @click="onSelected(group, index)">
        <div class="jg-conver-group-content wr wr-mg-tag" :class="[group.icon]" >{{ group.name }}</div>
      </li>
    </ul>
  </div>
  <ModalConversationGroup :is-show="state.isShowGroupManager" @oncancel="onShowGroupManager(false)"></ModalConversationGroup>
</template>
