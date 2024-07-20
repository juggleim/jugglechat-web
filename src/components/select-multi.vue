<script setup>
import { reactive, watch, nextTick } from "vue";
import utils from '@/common/utils';

const emit = defineEmits(['onChange'])
const props = defineProps(['list', 'favorites']);
let state = reactive({
  favorites: props.favorites.split(','),
  isShow: false
});
function onClick(){
  state.isShow = true;
}
function updateStatus(){
  props.list.map((_item) => {
    state.favorites.forEach((fav) => {
      if(utils.isEqual(_item.name, fav)){
        _item.isSelected = true;
      }
    })
    return _item;
  })
}
updateStatus();
function onItemClick(item){
  props.list.map((_item) => {
    if(utils.isEqual(_item.name, item.name)){
      _item.isSelected = !_item.isSelected;
      if(_item.isSelected){
        state.favorites.push(_item.name);
      }else{
        let index = utils.findIndex(state.favorites, (name) => {
          return utils.isEqual(name, _item.name)
        })
        state.favorites.splice(index, 1);
      }
    }
    return _item;
  })
  state.favorites = state.favorites.filter((fav) => {
    return fav != '';
  })
  emit('onChange', { data: state.favorites })
}
watch(() => props.favorites, val => {
  state.favorites = val.split(',');
  nextTick(() => {
    updateStatus();
  })
});
function onMouseleave(){
  state.isShow = false;
}
</script>

<template>
  <div class="ai-select-box">
    <div class="ai-select-favorites" @click="onClick">{{ state.favorites.join(',') }}</div>
    <ul class="ai-select-list" v-if="state.isShow" @mouseleave="onMouseleave">
      <span class="ai-select-shouqi wr wr-shouqi" @click="onMouseleave"></span>
      <li class="ai-select-item" :class="{'ai-select-item-selected': item.isSelected}" @click="onItemClick(item)" v-for="item in props.list" >{{ item.name }}</li>
    </ul>
  </div>
</template>
