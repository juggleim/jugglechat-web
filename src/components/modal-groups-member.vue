<script setup>
import im from "../common/im";
import { reactive, watch, nextTick, getCurrentInstance } from "vue";
import utils from "../common/utils";
import Storage from "../common/storage";
import { STORAGE } from "../common/enum";
import Conversation from "./conversation.vue";
const props = defineProps(["isShow"]);
const emit = defineEmits(["oncancel", "onconfirm"]);
let context = getCurrentInstance();

let juggle = im.getCurrent();
let { ConversationType } = juggle;
let state = reactive({
  list: [
    { conversationId: 'n1', conversationPortrait: 'https://file.lwoowl.cn/6c51-6dc0.png', conversationTitle: '正儿八经办公群' },
    { conversationId: 'n1', conversationPortrait: 'https://file.lwoowl.cn/6c51-6dc0.png', conversationTitle: '正儿八经办公群' },
    { conversationId: 'n1', conversationPortrait: 'https://file.lwoowl.cn/6c51-6dc0.png', conversationTitle: '正儿八经办公群' },
    { conversationId: 'n1', conversationPortrait: 'https://file.lwoowl.cn/6c51-6dc0.png', conversationTitle: '正儿八经办公群' },
    { conversationId: 'n1', conversationPortrait: 'https://file.lwoowl.cn/6c51-6dc0.png', conversationTitle: '正儿八经办公群' },
    { conversationId: 'n1', conversationPortrait: 'https://file.lwoowl.cn/6c51-6dc0.png', conversationTitle: '正儿八经办公群' },
    { conversationId: 'n1', conversationPortrait: 'https://file.lwoowl.cn/6c51-6dc0.png', conversationTitle: '正儿八经办公群' },
    { conversationId: 'n1', conversationPortrait: 'https://file.lwoowl.cn/6c51-6dc0.png', conversationTitle: '正儿八经办公群' },
    { conversationId: 'n1', conversationPortrait: 'https://file.lwoowl.cn/6c51-6dc0.png', conversationTitle: '正儿八经办公群' },
    { conversationId: 'n1', conversationPortrait: 'https://file.lwoowl.cn/6c51-6dc0.png', conversationTitle: '正儿八经办公群' },
    { conversationId: 'n1', conversationPortrait: 'https://file.lwoowl.cn/6c51-6dc0.png', conversationTitle: '正儿八经办公群' },
  ],
  selectList:  [
    { conversationId: 'n1', conversationPortrait: 'https://file.lwoowl.cn/6c51-6dc0.png', conversationTitle: '正儿八经办公群' },
    { conversationId: 'n1', conversationPortrait: 'https://file.lwoowl.cn/6c51-6dc0.png', conversationTitle: '正儿八经办公群' }
  ],
});
let user = Storage.get(STORAGE.USER_TOKEN);

watch(() => props.isShow, () => {

});

function onSelected(item){
  utils.map(state.list, (_item) => {
    _item.checked = false;
    if(utils.isEqual(item.time, _item.time)){
      _item.checked = !item.checked;
    }
  })
}

function onCancel() {
  emit('oncancel', {});
}

function onConfirm() {
  let item = utils.filter(state.list, (item) => {
    return item.checked;
  })[0];
  emit('onconfirm', item);
}

function scrollBottom(name) {
  nextTick(() => {
    let node = context.refs[name];
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  });
}
function onClick(item){
  let { isRemove, index, conversation } = item;
  if(isRemove){
    state.selectList.splice(index, 1);
    state.list.push(conversation);
    return scrollBottom('list');
  }
  state.list.splice(index, 1);
  state.selectList.push(conversation);
  scrollBottom('selectList');
}
</script>
<template>
  <div class="modal tyn-modal jg-conver-group-member-modal" tabindex="-1" :class="[props.isShow ? 'fade show' : '']">
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content border-0">
        <div class="modal-body">
          <div class="jg-modal-header">
            <div class="title">单聊分组</div>
          </div>
          <div class="tyn-media-list">
            <div class="jg-group-conver-box">
              <div class="jg-group-conver-header">最近聊天</div>
              <div class="jg-group-convers" ref="list">
                <Conversation v-for="(item, index) in state.list" :is-remove="0" :conversation="item" :index="index" :cls="'wr-cir-add jg-text-success'" @onemit="onClick"></Conversation>
              </div>
            </div>
            <div class="jg-line"></div>
            <div class="jg-group-conver-checkbox">
              <div class="jg-group-conver-header">已选聊天</div>
              <div class="jg-group-convers" ref="selectList">
                <Conversation v-for="(item, index) in state.selectList" :is-remove="1" :conversation="item" :index="index"  :cls="'wr-cir-remove jg-text-danger'" @onemit="onClick"></Conversation>
              </div>
            </div>
          </div>
          <ul class="tyn-list-inline gap gap-3 pt-3 tny-content-center">
            <li>
              <button class="btn btn-sm btn-success" @click="onConfirm()">确认</button>
            </li>
            <li>
              <button class="btn btn-sm btn-light" @click="onCancel()">取消</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ 'show': props.isShow }"></div>
  </div>
</template>
