<script setup>
import { reactive } from "vue";
import Avatar from "./avatar.vue";
const props = defineProps(['member']);
let state = reactive({});
</script>

<template>
  <div class="tyn-media-group tyn-media-group-reads fadein-o4">
    <div class="tyn-media tyn-size-xs tyn-group-msg-avatar">
      <Avatar :cls="'tyn-size-xs'" :avatar="props.member.portrait" :name="props.member.name || props.member.id"></Avatar>
    </div>
    
    <div class="tyn-media-row">
      <h6 class="name">{{ props.member.name || props.member.id }}</h6>
    </div>
  </div>
</template>