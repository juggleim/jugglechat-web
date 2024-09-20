<script setup>
import { reactive, watch } from "vue";
import im from "../common/im";
import utils from "../common/utils";
import common from "../common/common";
const props = defineProps(['isShow']);
const emit = defineEmits(["onhide"]);

let state = reactive({
});
</script>
<template>
 <ul class="tyn-media-option-list"  @mouseleave="emit('onhide')">
    <li class="dropdown">
      <div class="dropdown-menu dropdown-menu-end jg-cndrop-show" :class="{'show fadein': props.isShow }">
        <ul class="tyn-list-links">
          <li class="tyn-list-link">
            <a class="wr wr-adduser">添加好友</a>
          </li>
          <li class="tyn-list-link">
            <a href="#" class="wr wr-group">创建群组</a>
          </li>
        </ul>
      </div>
    </li>
  </ul>
</template>
