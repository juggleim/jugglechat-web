<script setup>
import common from "../../common/common";
let i18n = common.i18n();
</script>
<template>
  <div class="dropdown-menu dropdown-menu-end show contact_dp_show ">
    <ul class="tyn-list-links">
      <li>
        <a class="wr wr-message">
          <span>{{ i18n.UI.SEND_MESSAGE }}</span>
        </a>
      </li>
      <li class="dropdown-divider"></li>
      <li>
        <a class="wr wr-block">
          <span>{{ i18n.UI.BLOCK }}</span>
        </a>
      </li>
    </ul>
    <!-- .tyn-list-links -->
  </div>
</template>
