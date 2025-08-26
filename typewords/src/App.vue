<script setup lang="ts">
import {onMounted, watch} from "vue";
import {BaseState, useBaseStore} from "@/stores/base.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";
import useTheme from "@/hooks/theme.ts";
import {SAVE_DICT_KEY, SAVE_SETTING_KEY} from "@/utils/const.ts";
import {shakeCommonDict} from "@/utils";
import {routes} from "@/router.ts";
import {set} from 'idb-keyval'

import {useRoute} from "vue-router";

const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const settingStore = useSettingStore()
const {setTheme} = useTheme()

watch(store.$state, (n: BaseState) => {
  set(SAVE_DICT_KEY.key, JSON.stringify({val: shakeCommonDict(n), version: SAVE_DICT_KEY.version}))
})

watch(settingStore.$state, (n) => {
  set(SAVE_SETTING_KEY.key, JSON.stringify({val: n, version: SAVE_SETTING_KEY.version}))
})

async function init() {
  await store.init()
  await settingStore.init()
  store.load = true
  setTheme(settingStore.theme)
}

onMounted(init)

let transitionName = $ref('go')
const route = useRoute()
watch(() => route.path, (to, from) => {
  // console.log('watch', to, from)
  // //footer下面的5个按钮，对跳不要用动画
  let noAnimation = [
    '/pc/practice',
    '/pc/dict',
    '/mobile',
    '/'
  ]
  if (noAnimation.indexOf(from) !== -1 && noAnimation.indexOf(to) !== -1) {
    return transitionName = ''
  }

  const toDepth = routes.findIndex(v => v.path === to)
  const fromDepth = routes.findIndex(v => v.path === from)
  transitionName = toDepth > fromDepth ? 'go' : 'back'
  // console.log('transitionName', transitionName, toDepth, fromDepth)
})
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition :name="transitionName">
      <keep-alive :exclude="runtimeStore.excludeRoutes">
        <component :is="Component"/>
      </keep-alive>
    </transition>
  </router-view>
</template>

<style scoped lang="scss">

</style>
