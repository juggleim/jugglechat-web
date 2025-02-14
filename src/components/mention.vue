<script setup>
import { reactive, watch } from "vue";
import Avatar from "./avatar.vue";
import utils from "../common/utils";
import common from "../common/common";

const props = defineProps(["isShow", "members", "index"]);
const emit = defineEmits(["onselected"]);


let state = reactive({
  members: []
});

watch(() => props.members, () => {
  state.members = props.members;
});
watch(() => props.index, () => {
  state.members = utils.map(state.members, (member, index) => {
    member.isActive = false;
    if(utils.isEqual(index, props.index)){
      member.isActive = true;
    }
    return member;
  });
});

function onSelected(index){
  emit('onselected', index);
}
</script>

<template>
  <div class="tyn-chat-search tyn-mentions" :class="{'active': props.isShow}">
    <div class="flex-grow-1">
      <div class="form-group">
        <div class="form-control-wrap form-control-plaintext-wrap jg-mentions-warp">
          <ul>
            <li class="tyn-media-row mention-row" v-for="(member, index) in state.members" :class="{'mention-active': member.isActive}" @click="onSelected(index)">
              <div class="tyn-media">
                <Avatar 
                  :cls="member.isAll ? 'tyn-mention-all tyn-size-sm' : 'tyn-size-sm'"
                  :avatar="member.portrait"
                  :name="member.val || member.name"></Avatar>
              </div>  
              <h6>{{ member.name }}</h6>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
