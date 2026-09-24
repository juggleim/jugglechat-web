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
let { MessageType, Event } = juggle;

let state = reactive({
  isRemote: false,
  groups: [],
  isShowGroupManager: false,
  i18n: common.i18n()
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
  let { groups } = state;
  let index = utils.find(groups, (group) => {
    return utils.isEqual(group.id, tag.id);
  });

  if(isRemove){
    if(index > -1){
      state.groups.splice(index, 1);
    }
  }

  if(!isRemove){
    if(index == -1){
      state.groups.push(tag)  
    }else{
      state.groups.splice(index, 1, tag);
    }
  }
});

function onShowGroupManager(isShow){
  state.isShowGroupManager = isShow;
}

juggle.once(Event.TAG_ADDED, (notify) => {
  let { tags } = notify;
  utils.forEach(tags, (tag) => {
    state.groups.push(tag);
  });
});
juggle.once(Event.TAG_REMOVED, (notify) => {
  let { tags } = notify;
  let { groups } = state;
  utils.forEach(tags, (tag) => {
    let index = utils.find(groups, (group) => {
      return utils.isEqual(group.id, tag.id);
    });
    if(index > -1){
      groups.splice(index, 1);
    }
  });
});
juggle.once(Event.TAG_CHANGED, (notify) => {
  let { tags } = notify;
  let { groups } = state;
  utils.forEach(tags, (tag) => {
    let index = utils.find(groups, (group) => {
      return utils.isEqual(group.id, tag.id);
    });
    if(index > -1){
      let _tag = groups[index];
      utils.extend(_tag, tag);
      // groups.splice(index, 1, tag);
    }else{
      groups.push(tag);
    }
  });
});

watch(() => props.isShow, async () => {
  if(props.isShow){
    let { tags = [] } = await juggle.getConversationTags();
    // let tags = [{id: CONVERATION_TAG_ID.ALL, name: '消息'}];
    state.i18n = common.i18n();
    if(!state.isRemote){
      state.isRemote = true;
    }
    state.groups = common.formatTags(tags);
  }
});

</script>

<template>
  <div class="jg-conver-group-container" :class="[props.isShow ? 'show-group' : '']">
    <div class="jg-conversations-header">
      <ul class="jg-conversations-tools">
        <li></li>
        <li class="jg-conversation-tool wr wr-setting" @click="onShowGroupManager(true)">{{ state.i18n.MAIN.TAG.SETTING }}</li>
      </ul>
    </div>
    <ul class="jg-conver-groups">
      <li class="jg-conver-group" v-for="(group, index) in state.groups" :key="group.id" :class="{'active': group.isActive}" @click="onSelected(group, index)">
        <div class="jg-conver-group-content wr wr-mg-tag" :class="[group.icon]" >
          <span class="jg-conver-group-content-name">{{ group.name }}</span>
        </div>
      </li>
    </ul>
  </div>
  <ModalConversationGroup :is-show="state.isShowGroupManager" @oncancel="onShowGroupManager(false)"></ModalConversationGroup>
</template>
