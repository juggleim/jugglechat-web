<script setup>
import { reactive, watch } from "vue";
import im from "../common/im";
import utils from "../common/utils";
import common from "../common/common";
const props = defineProps(['isShow', 'menus']);
const emit = defineEmits(["onhide", "onemit"]);

let state = reactive({
});
</script>
<template>
 <ul class="tyn-media-option-list">
    <li class="dropdown">
      <div class="dropdown-menu dropdown-menu-end jg-cndrop-show jg-footer-dropdownmenu" :class="{'show fadeoutxr': props.isShow }">
        <ul class="tyn-list-links">
          <li @click.stop="emit('onemit', menu)" v-for="menu in props.menus" :class="[ menu.type == 'line' ? 'dropdown-divider' : 'tyn-list-link' ]">
            <a  class="wr " :class="{ ['wr-' + menu.icon]: true, 'jg-force-warn-letter': menu.isWarn }">{{ menu.name }}</a>
          </li>
        </ul>
      </div>
    </li>
    <div class="dropmenu-backdrop" :class="{'show-menu-back': props.isShow}" @click.stop="emit('onhide')"></div>  
  </ul>
</template>
