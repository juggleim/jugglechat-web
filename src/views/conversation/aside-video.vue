<script setup>
const props = defineProps(["isShow", "messages"]);
import { reactive, getCurrentInstance } from "vue";
import utils from "../../common/utils";

let state = reactive({
  list: []
});

let context = getCurrentInstance();
function onPlay(messageId){
  let { videos } = context.refs;
  let video = utils.filter(videos, (video) => {
    return utils.isEqual(video.id, messageId);
  })[0];
  if(video){
    console.log(video, messageId) 
    if(video.paused){
      video.play();
      state.list.push(messageId);
    }else{
      video.pause();
      let index = state.list.indexOf(messageId);
      state.list.splice(index,1);
    }
  }
}

</script>

<template>
  <div class="tab-pane show active">
    <div class="row g-3">
      <div class="col-6" v-for="msg in props.messages">
        <a class="glightbox tyn-video" data-gallery="media-video" @click="onPlay(msg.messageId)">
          <video :src="msg.content.url"  ref="videos" class="tyn-image" :id="msg.messageId"></video>
          <div class="tyn-video-icon wr wr-video tyn-aside-video" v-if="state.list.indexOf(msg.messageId) == -1"></div>
        </a>
      </div>
      <div class="name tyn-aside-nothing" v-if="props.messages.length == 0">没有更多了</div>
    </div>
  </div>
</template>
