<script setup>
const props = defineProps(["isShow", "messages"]);
</script>

<template>
  <div class="tab-pane show active">
    <ul class="tyn-media-list gap gap-3">
      <li>
        <a :href="msg.content.url" target="_blank"  class="tyn-file" v-for="msg in props.messages">
          <div class="tyn-media-group tyn-aside-group">
            <div class="tyn-media tyn-size-lg text-bg-light wr wr-file tyb-msg-fileicon"></div>
            <div class="tyn-media-col">
              <div class="name tyn-aside-filename">{{ msg.content.name }}</div>
              <div class="meta">{{ ((msg.content.size || 0) / 1024).toFixed(2) }} KB</div>
            </div>
          </div>
        </a>
        <div class="name tyn-aside-nothing" v-if="props.messages.length == 0">没有更多了</div>
      </li>
    </ul>
  </div>
</template>
