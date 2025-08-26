<script setup lang="ts">

import {_getAccomplishDays} from "@/utils";
import Radio from "@/pages/pc/components/base/radio/Radio.vue";
import RadioGroup from "@/pages/pc/components/base/radio/RadioGroup.vue";
import BaseButton from "@/components/BaseButton.vue";
import Checkbox from "@/pages/pc/components/base/checkbox/Checkbox.vue";
import Slider from "@/pages/pc/components/base/Slider.vue";
import {useBaseStore} from "@/stores/base.ts";
import {defineAsyncComponent, watch} from "vue";
import {useSettingStore} from "@/stores/setting.ts";
import Toast from "@/pages/pc/components/base/toast/Toast.ts";
import ChangeLastPracticeIndexDialog from "@/pages/pc/word/components/ChangeLastPracticeIndexDialog.vue";
import Tooltip from "@/pages/pc/components/base/Tooltip.vue";

const Dialog = defineAsyncComponent(() => import('@/pages/pc/components/dialog/Dialog.vue'))

const store = useBaseStore()
const settings = useSettingStore()

const model = defineModel()

defineProps<{
  showLeftOption: boolean,
}>()

const emit = defineEmits<{
  ok: [];
}>()

let show = $ref(false)
let tempPerDayStudyNumber = $ref(0)
let tempLastLearnIndex = $ref(0)
let temPracticeMode = $ref(0)
let tempDisableShowPracticeSettingDialog = $ref(false)


function changePerDayStudyNumber() {
  store.sdict.perDayStudyNumber = tempPerDayStudyNumber
  store.sdict.lastLearnIndex = tempLastLearnIndex
  settings.wordPracticeMode = temPracticeMode
  settings.disableShowPracticeSettingDialog = tempDisableShowPracticeSettingDialog
  emit('ok')
}

watch(() => model.value, (n) => {
  if (n) {
    if (store.sdict.id) {
      tempPerDayStudyNumber = store.sdict.perDayStudyNumber
      tempLastLearnIndex = store.sdict.lastLearnIndex
      temPracticeMode = settings.wordPracticeMode
      tempDisableShowPracticeSettingDialog = settings.disableShowPracticeSettingDialog
    } else {
      Toast.warning('请先选择一本词典')
    }
  }
})
</script>

<template>
  <Dialog v-model="model" title="学习设置" :footer="true"
          @ok="changePerDayStudyNumber">
    <div class="target-modal color-main">
      <div class="text-center mt-2 mb-8">
        <span>从<span class="text-3xl mx-2 lh">{{ tempLastLearnIndex }}</span>个开始，</span>
        <span>每日<span class="text-3xl mx-2 lh">{{ tempPerDayStudyNumber }}</span>个，</span>
        <span>预计<span
            class="text-3xl mx-2 lh">{{
            _getAccomplishDays(store.sdict.length - tempLastLearnIndex, tempPerDayStudyNumber)
          }}</span>天完成</span>
      </div>
      <div class="flex mb-4 gap-space">
        <span class="shrink-0">每日学习</span>
        <Slider :min="10"
                :step="10"
                show-text
                class="mt-1"
                :max="200" v-model="tempPerDayStudyNumber"/>
      </div>
      <div class="mb-6 flex gap-space">
        <span class="shrink-0">学习进度</span>
        <div class="flex-1">
          <Slider :min="0"
                  :step="10"
                  show-text
                  class="my-1"
                  :max="store.sdict.words.length" v-model="tempLastLearnIndex"/>
          <BaseButton @click="show = true">从词典选起始位置</BaseButton>
        </div>
      </div>

      <div class="gap-space">
        <RadioGroup v-model="temPracticeMode" class="flex-col gap-0!">
          <Radio :value="0" label="智能模式，系统自动计算复习单词与默写单词"/>
          <Radio :value="1" label="自由模式，系统不强制复习与默写"/>
        </RadioGroup>
      </div>
    </div>
    <template v-slot:footer-left v-if="showLeftOption">
      <div class="flex items-center">
        <Checkbox v-model="tempDisableShowPracticeSettingDialog"/>
        <Tooltip title="可在设置页面更改">
          <span class="text-sm">保持默认，不再显示</span>
        </Tooltip>
      </div>
    </template>
  </Dialog>
  <ChangeLastPracticeIndexDialog
      v-model="show"
      @ok="e => {
        tempLastLearnIndex = e
        show = false
      }"
  />
</template>

<style scoped lang="scss">

.target-modal {
  width: 30rem;
  padding: 0 var(--space);

  .lh {
    color: rgb(176, 116, 211)
  }
}
</style>
