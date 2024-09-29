<script setup>
import { reactive, watch } from "vue";
import im from "../common/im";
import utils from "../common/utils";
import common from "../common/common";
const props = defineProps(['isShow', 'conversation', 'index', 'x']);
const emit = defineEmits(["onhide", "onmark", "ontop", "ondisturb", "onremove", "onclearmsg"]);

let juggle = im.getCurrent();
let { MessageType, UndisturbType } = juggle;

let state = reactive({
  isTop: true,
  dropmenuX: 0
});
watch(() => props.isShow, (value) => {
  let isTop = true;
  if(value){
    isTop = common.isConversationElementTop(props.conversation);
  }
  utils.extend(state, { isTop });
})
</script>
<template>
  <div class="dropdown-menu dropdown-menu-xxs fadein-o4"
  :style="['left:' + props.x + 'px']"
   :class="{ 'show': props.isShow, 'dropdown-menu-xxs-bottom': !state.isTop }">
    <ul class="tyn-list-links">
      <li class="tyn-list-link">
        <a class="wr wr-read" @click.stop="emit('onmark', props.index)">
          <span>{{ props.conversation.unreadTag ? '清理未读' : '标记未读' }}</span>
        </a>
      </li>
      <li class="tyn-list-link">
        <a
          class="wr wr-top"
          :class="{'wr-untop': props.conversation.isTop}"
          data-bs-toggle="modal"
          @click.stop="emit('ontop', props.conversation, !props.conversation.isTop)"
        >
          <span>{{ props.conversation.isTop ? '取消置顶' : '置顶会话' }}</span>
        </a>
      </li>
      <li class="tyn-list-link">
        <a
          class="wr wr-mute"
          :class="{'wr-unmute': utils.isEqual(props.conversation.undisturbType, UndisturbType.UNDISTURB)}"
          data-bs-toggle="modal"
          @click.stop="emit('ondisturb', props.conversation)"
        >
          <span>{{ utils.isEqual(props.conversation.undisturbType, UndisturbType.UNDISTURB) ? '免 打 扰' : '取消免打扰' }}</span>
        </a>
      </li>
      <li class="dropdown-divider"></li>
      <li class="tyn-list-link">
        <a
          class="wr wr-delete"
          data-bs-toggle="modal"
          @click.stop="emit('onremove', props.index)"
        >
          <span>删除会话</span>
        </a>
      </li>
      <li class="tyn-list-link">
        <a href="#" class="wr wr-clear" @click.stop="emit('onclearmsg', props.index)">
          <span>清空消息</span>
        </a>
      </li>
    </ul>
  </div>
  <div class="fade-bg fade-bg-conversationlist" v-if="props.isShow" @click.stop="emit('onhide', props.conversation)"></div>
</template>
