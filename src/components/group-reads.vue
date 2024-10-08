<script setup>
const props = defineProps(['message']);
import { reactive } from "vue";
import Member from "./group-member.vue";
import im from "../common/im";
import utils from "../common/utils";
import commcon from "../common/common";

let juggle = im.getCurrent();

let state = reactive({
  reads: [],
  unreads: [],
  isTop: true,
});

utils.extend(state, { isTop: commcon.isElementTop(props.message) });

juggle.getMessageReadDetails(props.message).then((result) => {
  console.log('getMessageReadDetails successfully', result)
  let { readMembers, unreadMembers } = result;
  utils.extend(state, {
    reads: readMembers,
    unreads: unreadMembers
  })
}, (error) => {
  console.log(error)
});

</script>

<template>
  <div class="dropdown-menu dropdown-menu-xs tyn-group-dropdown show fadeinx " :class="[state.isTop ? 'tyn-group-dropdown-top' : 'tyn-group-dropdown-bottom']">
    <div class="tyn-group-read-box">
      <h6 class="name">{{ state.reads.length }} 人已读</h6>
      <ul class="tyn-list-links tyn-group-reads-links">
        <li v-for="read in state.reads">
          <Member :member="read.member"></Member>
        </li>
      </ul>
    </div>

    <div class="tyn-group-read-box">
      <h6 class="name">{{ state.unreads.length }} 人未读</h6>
      <ul class="tyn-list-links tyn-group-reads-links">
        <li v-for="unread in state.unreads">
        <Member :member="unread.member"></Member>
      </li>
      </ul>
    </div>
</div></template>
