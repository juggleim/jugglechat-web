<script setup>
import im from "../common/im";
import { reactive, watch, nextTick, getCurrentInstance } from "vue";
import utils from "../common/utils";
import Storage from "../common/storage";
import { STORAGE } from "../common/enum";
import Conversation from "./conversation.vue";
import common from "../common/common";
const props = defineProps(["isShow", "tag"]);
const emit = defineEmits(["oncancel", "onconfirm"]);
let context = getCurrentInstance();

let i18n = common.i18n();

let juggle = im.getCurrent();
let { ConversationType } = juggle;
let state = reactive({
  conversations: [],
  selectList:  [],
  addList: {},
  removeList: {},
});
let user = Storage.get(STORAGE.USER_TOKEN);

function onCancel() {
  emit('oncancel', {});
}

function onConfirm() {
  let { removeList, addList } = state;
  let removes = [];
  utils.forEach(removeList, (conversation) => {
    removes.push(conversation);
  });

  let adds = [];
  utils.forEach(addList, (conversation) => {
    adds.push(conversation);
  });
  emit('onconfirm', { adds, removes, tag: props.tag });
}

function getConversations(isFirst = false, callback = utils.noop) {
  let params = {};
  if (!isFirst) {
    let index = state.conversations.length - 1;
    let item = state.conversations[index] || { sortTime: 0 };
    params = { time: item.sortTime };
  }
  let { conversations } = state;
  juggle.getConversations(params).then(result => {
    let { conversations: list } = result;
    let _list = common.filterIgnoreConversations(list);
    state.conversations = conversations.concat(_list);
    callback();
  });
}

let isCodeScroll = false;
function scrollBottom(name) {
  nextTick(() => {
    let node = context.refs[name];
    if (node) {
      isCodeScroll = true;
      node.scrollTop = node.scrollHeight;
    }
  });
}

let canscroll = true;
nextTick(() => {
  let { conversations } = context.refs;
  conversations.addEventListener("scroll", () => {
    let scrollTop = conversations.scrollTop;
    let scrollHeight = conversations.scrollHeight;
    let rectHeight = conversations.getBoundingClientRect().height;
    let isNeedLoad = scrollHeight - scrollTop - rectHeight < 100;
    if (isNeedLoad && canscroll) {
      if(isCodeScroll){
        isCodeScroll = false;
        return;
      }
      canscroll = false;
      let isFirst = false;
      getConversations(isFirst, () => {
        canscroll = true;
      });
    }
  });
});

let selectCanscroll = true;
nextTick(() => {
  let { selectList } = context.refs;
  selectList.addEventListener("scroll", () => {
    let scrollTop = selectList.scrollTop;
    let scrollHeight = selectList.scrollHeight;
    let rectHeight = selectList.getBoundingClientRect().height;
    let isNeedLoad = scrollHeight - scrollTop - rectHeight < 100;
    if (isNeedLoad && selectCanscroll) {
      if(isCodeScroll){
        isCodeScroll = false;
        return;
      }
      selectCanscroll = false;
      let isFirst = false;
      getSelectConversations(isFirst, () => {
        selectCanscroll = true;
      });
    }
  });
});

function getSelectConversations(isFirst = false, callback = utils.noop) {
  let params = {};
  if (!isFirst) {
    let index = state.selectList.length - 1;
    let item = state.selectList[index] || { sortTime: 0 };
    params = { time: item.sortTime };
  }
  utils.extend(params, { tag: props.tag.id });
  let { selectList, conversations } = state;
  juggle.getConversations(params).then(result => {
    let { conversations: list } = result;
    let _list = common.filterIgnoreConversations(list);
    list = utils.map(_list, (item) => {
      item.isRemote = true;
      return item;
    })
    state.selectList = selectList.concat(list);
    utils.forEach(list, (item) => {
      let index = utils.find(conversations, (conversation) => {
        return utils.isEqual(conversation.conversationId, item.conversationId)
      });
      if(index > -1){
        conversations.splice(index, 1);
      }
    })
    callback();
  });
}
function getId(conversation){
  return `${conversation.conversationType}_${conversation.conversationId}`;
}
function onClick(item){
  let { addList, removeList } = state;
  let { isRemove, index, conversation } = item;
  let key = getId(conversation);

  if(isRemove){
    state.selectList.splice(index, 1);
    state.conversations.unshift(conversation);
    if(conversation.isRemote){
      removeList[key] = conversation;
    }
    delete addList[key];
    return;
  }

  addList[key] = conversation;
  delete removeList[key];
  state.conversations.splice(index, 1);
  state.selectList.unshift(conversation);
}
watch(() => props.isShow, () => {
  if(props.isShow){
    getConversations(true, () => {
      getSelectConversations(true);
    });
  }else{
    utils.extend(state, { selectList: [], conversations: [], addList: {}, removeList: {} })
  }
});
</script>
<template>
  <div class="modal tyn-modal jg-conver-group-member-modal" tabindex="-1" :class="[props.isShow ? 'fade show' : '']">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content border-0">
        <div class="modal-body">
          <div class="jg-modal-header">
            <div class="title">{{ props.tag.name }}</div>
          </div>
          <div class="tyn-media-list">
            <div class="jg-group-conver-box">
              <div class="jg-group-conver-header">{{ i18n.MAIN.TAG.RECENTLY }}</div>
              <div class="jg-group-convers" ref="conversations">
                <Conversation v-for="(item, index) in state.conversations" :is-remove="0" :conversation="item" :index="index" :cls="'wr-cir-add jg-text-success'" @onemit="onClick"></Conversation>
              </div>
            </div>
            <div class="jg-line"></div>
            <div class="jg-group-conver-checkbox">
              <div class="jg-group-conver-header">{{ i18n.MAIN.TAG.SELECTED }}</div>
              <div class="jg-group-convers" ref="selectList">
                <Conversation v-for="(item, index) in state.selectList" :is-remove="1" :conversation="item" :index="index"  :cls="'wr-cir-remove jg-text-danger'" @onemit="onClick"></Conversation>
              </div>
            </div>
          </div>
          <ul class="tyn-list-inline gap gap-3 pt-3 tny-content-center">
            <li>
              <button class="btn btn-sm btn-success" @click="onConfirm()">{{ i18n.COMMON.CONFIRM_BTN }}</button>
            </li>
            <li>
              <button class="btn btn-sm btn-light" @click="onCancel()">{{ i18n.COMMON.CANCEL_BTN }}</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ 'show': props.isShow }"></div>
  </div>
</template>
