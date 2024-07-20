<script setup>
import { reactive } from "vue";
const props = defineProps(['member']);
let state = reactive({
  url: 'https://file.lwoowl.cn/avatar_jgd/2f6c22f5-0043-4377-98f7-043c0b98532e.png'
});
</script>

<template>
  <div class="tyn-media-group tyn-media-group-reads">
    <div class="tyn-media tyn-size-xs tyn-group-msg-avatar"
      :style="{ 'background-image': 'url(' + (props.member.portrait || state.url ) + ')' }">
    </div>
    <div class="tyn-media-row">
      <h6 class="name">{{ props.member.name || '默认用户' }}</h6>
    </div>
  </div>
</template>