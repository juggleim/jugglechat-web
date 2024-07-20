<script setup>
const props = defineProps(["isShow"]);
</script>

<template>
  <div class="tab-pane show active">
    <ul class="tyn-media-list gap gap-3">
      <li>
        <a href="../../assets/#" class="tyn-links">
          <div class="tyn-media-group">
            <div class="tyn-media tyn-size-xl">
              <img src="../../assets/images/gallery/chat/thumb-7.jpg" alt />
            </div>
            <div class="tyn-media-col">
              <h6 class="name">Digital Marketing Guide</h6>
              <div class="anchor">https://www.envato.com/blog/digital-marketing-guide/</div>
            </div>
          </div>
        </a>
      </li>
      <li>
        <a href="../../assets/#" class="tyn-links">
          <div class="tyn-media-group">
            <div class="tyn-media tyn-size-xl">
              <img src="../../assets/images/gallery/chat/thumb-8.jpg" alt />
            </div>
            <div class="tyn-media-col">
              <h6 class="name">Atomic power plant engine</h6>
              <div class="anchor">https://www.envato.com/atomic-power-plant-engine/</div>
            </div>
          </div>
        </a>
      </li>
    </ul>
  </div>
</template>
