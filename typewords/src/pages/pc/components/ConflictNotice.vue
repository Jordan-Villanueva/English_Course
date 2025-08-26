<script setup lang="ts">

import {defineAsyncComponent, onMounted, watch} from "vue";
import {useSettingStore} from "@/stores/setting.ts";

const Dialog = defineAsyncComponent(() => import('@/pages/pc/components/dialog/Dialog.vue'))

let settingStore = useSettingStore()
let show = $ref(false)

watch(() => settingStore.load, (n) => {
  if (n && settingStore.conflictNotice) {
    setTimeout(() => {
      show = true
    }, 300)
  }
}, {immediate: true})

</script>

<template>
  <Dialog v-model="show"
          title="提示"
          footer
          cancel-button-text="不再提醒"
          confirm-button-text="关闭"
          @cancel="settingStore.conflictNotice = false"
  >
    <div class="card w-120 center flex-col color-main py-0 mb-0">
      <div>
        <div class="text">
          1、 如果您安装了 <span class="font-bold text-red">“调速” “Vim”</span> 等会接管键盘点击的插件/脚本，将导致本网站无法正常使用
        </div>
        <div class="pl-4">
          <div>①：在对应插件/脚本的设置里面排除本网站</div>
          <div>②：临时禁用对应插件/脚本</div>
        </div>
        <div class="text mt-2">
          2、如果您未安装以上插件/脚本，还是无法使用
        </div>
        <div class="pl-4">
          <div>①：请打开浏览器无痕模式尝试</div>
          <div>②：无痕模式下无法正常使用，请给<a href="https://github.com/zyronon/TypeWords/issues">作者提 BUG</a>
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>
