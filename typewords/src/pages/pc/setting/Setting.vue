<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {useSettingStore} from "@/stores/setting.ts";
import {getAudioFileUrl, useChangeAllSound, usePlayAudio, useWatchAllSound} from "@/hooks/sound.ts";
import {getShortcutKey, useEventListener} from "@/hooks/event.ts";
import {checkAndUpgradeSaveDict, checkAndUpgradeSaveSetting, cloneDeep, shakeCommonDict} from "@/utils";
import {DefaultShortcutKeyMap, ShortcutKey} from "@/types/types.ts";
import BaseButton from "@/components/BaseButton.vue";
import {APP_NAME, EXPORT_DATA_KEY, SAVE_DICT_KEY, SAVE_SETTING_KEY, SoundFileOptions} from "@/utils/const.ts";
import VolumeIcon from "@/components/icon/VolumeIcon.vue";
import {useBaseStore} from "@/stores/base.ts";
import {saveAs} from "file-saver";
import {GITHUB} from "@/config/ENV.ts";
import dayjs from "dayjs";
import BasePage from "@/pages/pc/components/BasePage.vue";
import Toast from '@/pages/pc/components/base/toast/Toast.ts'
import {Option, Select} from "@/pages/pc/components/base/select";
import Switch from "@/pages/pc/components/base/Switch.vue";
import Slider from "@/pages/pc/components/base/Slider.vue";
import RadioGroup from "@/pages/pc/components/base/radio/RadioGroup.vue";
import Radio from "@/pages/pc/components/base/radio/Radio.vue";
import InputNumber from "@/pages/pc/components/base/InputNumber.vue";
import PopConfirm from "@/pages/pc/components/PopConfirm.vue";
import {get, set} from "idb-keyval";
import BaseInput from "@/pages/pc/components/base/BaseInput.vue";
import Textarea from "@/pages/pc/components/base/Textarea.vue";
import SettingItem from "@/pages/pc/setting/SettingItem.vue";
import Checkbox from "@/pages/pc/components/base/checkbox/Checkbox.vue";

const emit = defineEmits<{
  toggleDisabledDialogEscKey: [val: boolean]
}>()

const tabIndex = $ref(0)
const settingStore = useSettingStore()
const store = useBaseStore()
//@ts-ignore
const gitLastCommitHash = ref(LATEST_COMMIT_HASH);
const simpleWords = $computed({
  get: () => store.simpleWords.join(','),
  set: v => {
    try {
      store.simpleWords = v.split(',');
    } catch (e) {

    }
  }
})
useWatchAllSound()

let editShortcutKey = $ref('')

const disabledDefaultKeyboardEvent = $computed(() => {
  return editShortcutKey && tabIndex === 2
})

watch(() => disabledDefaultKeyboardEvent, v => {
  emit('toggleDisabledDialogEscKey', !!v)
})

useEventListener('keydown', (e: KeyboardEvent) => {
  if (!disabledDefaultKeyboardEvent) return
  e.preventDefault()

  let shortcutKey = getShortcutKey(e)
  // console.log('e', e, e.keyCode, e.ctrlKey, e.altKey, e.shiftKey)
  // console.log('key', shortcutKey)

  // if (shortcutKey[shortcutKey.length-1] === '+') {
  //   settingStore.shortcutKeyMap[editShortcutKey] = DefaultShortcutKeyMap[editShortcutKey]
  //   return ElMessage.warning('设备失败！')
  // }

  if (editShortcutKey) {
    if (shortcutKey === 'Delete') {
      settingStore.shortcutKeyMap[editShortcutKey] = ''
    } else {
      for (const [k, v] of Object.entries(settingStore.shortcutKeyMap)) {
        if (v === shortcutKey && k !== editShortcutKey) {
          settingStore.shortcutKeyMap[editShortcutKey] = DefaultShortcutKeyMap[editShortcutKey]
          return Toast.warning('快捷键重复！')
        }
      }
      settingStore.shortcutKeyMap[editShortcutKey] = shortcutKey
    }
  }
})

function resetShortcutKeyMap() {
  editShortcutKey = ''
  settingStore.shortcutKeyMap = cloneDeep(DefaultShortcutKeyMap)
  Toast.success('恢复成功')
}

function exportData(notice = '导出成功！') {
  let data = {
    version: EXPORT_DATA_KEY.version,
    val: {
      setting: {
        version: SAVE_SETTING_KEY.version,
        val: settingStore.$state
      },
      dict: {
        version: SAVE_DICT_KEY.version,
        val: shakeCommonDict(store.$state)
      }
    }
  }
  let blob = new Blob([JSON.stringify(data)], {type: "text/plain;charset=utf-8"});
  saveAs(blob, `${APP_NAME}-User-Data-${dayjs().format('YYYY-MM-DD HH-mm-ss')}.json`);
  Toast.success(notice)
}

function importData(e) {
  let file = e.target.files[0]
  if (!file) return
  // no()
  let reader = new FileReader();
  reader.onload = function (v) {
    let str: any = v.target.result;
    if (str) {
      let obj = {
        version: -1,
        val: {
          setting: {},
          dict: {},
        }
      }
      try {
        obj = JSON.parse(str)
        let data = obj.val
        let settingState = checkAndUpgradeSaveSetting(data.setting)
        settingState.load = true
        settingStore.setState(settingState)
        let baseState = checkAndUpgradeSaveDict(data.dict)
        baseState.load = true
        store.setState(baseState)
        Toast.success('导入成功！')
      } catch (err) {
        return Toast.error('导入失败！')
      }
    }
  }
  reader.readAsText(file);
}

function importOldData() {
  exportData('已为您自动保存当前数据！稍后将进行老数据导入操作')
  setTimeout(() => {
    let oldDataStr = localStorage.getItem('type-word-dict-v3')
    if (oldDataStr) {
      try {
        let obj = JSON.parse(oldDataStr)
        let data = {
          version: 3,
          val: obj
        }
        let baseState = checkAndUpgradeSaveDict(data)
        store.setState(baseState)
        Toast.success('导入成功')
      } catch (err) {
        Toast.error('导入失败')
      }
    } else {
      Toast.error('导入失败！原因：本地无老数据备份')
    }
  }, 1000)
}
</script>

<template>
  <BasePage>
    <div class="setting text-md">
      <div class="left mt-10">
        <div class="tabs">
          <div class="tab" :class="tabIndex === 0 && 'active'" @click="tabIndex = 0">
            <IconFluentAppsList24Regular width="20"/>
            <span>练习设置</span>
          </div>
          <div class="tab" :class="tabIndex === 1 && 'active'" @click="tabIndex = 1">
            <IconFluentHeadphones20Regular width="20"/>
            <span>音效设置</span>
          </div>
          <div class="tab" :class="tabIndex === 2 && 'active'" @click="tabIndex = 2">
            <IconFluentKeyboardLayoutFloat20Regular width="20"/>
            <span>快捷键设置</span>
          </div>
          <div class="tab" :class="tabIndex === 3 && 'active'" @click="tabIndex = 3">
            <IconFluentDatabasePerson20Regular width="20"/>
            <span>数据管理</span>
          </div>
          <div class="tab" :class="tabIndex === 4 && 'active'" @click="tabIndex = 4">
            <IconFluentMailEdit20Regular width="20"/>
            <span>反馈</span>
          </div>
          <div class="tab" :class="tabIndex === 5 && 'active'" @click="tabIndex = 5">
            <IconFluentPerson20Regular width="20"/>
            <span>关于</span>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="page-title text-align-center">设置</div>
        <div v-if="tabIndex === 0">
          <SettingItem title="单词练习模式">
            <RadioGroup v-model="settingStore.wordPracticeMode" class="flex-col gap-0!">
              <Radio :value="0" label="智能模式，系统自动计算复习单词与默写单词"/>
              <Radio :value="1" label="自由模式，系统不强制复习与默写"/>
            </RadioGroup>
          </SettingItem>

          <SettingItem title="显示上一个/下一个单词"
                       desc="开启后，练习中会在上方显示上一个/下一个单词"
          >
            <Switch v-model="settingStore.showNearWord"/>
          </SettingItem>

          <SettingItem title="忽略大小写"
                       desc="开启后，输入时不区分大小写，如输入“hello”和“Hello”都会被认为是正确的"
          >
            <Switch v-model="settingStore.ignoreCase"/>
          </SettingItem>

          <SettingItem title="允许默写模式下显示提示"
                       :desc="`开启后，可以通过鼠标 hover 单词或者按快捷键 ${settingStore.shortcutKeyMap[ShortcutKey.ShowWord]} 显示正确答案`"
          >
            <Switch v-model="settingStore.allowWordTip"/>
          </SettingItem>

          <SettingItem title="不默认显示练习设置弹框"
                       desc="在词典详情页面，点击学习按钮后，是否显示练习设置弹框"
          >
            <Switch v-model="settingStore.disableShowPracticeSettingDialog"/>
          </SettingItem>

          <SettingItem title="单词输入错误时，清空已输入内容"
          >
            <Switch v-model="settingStore.inputWrongClear"/>
          </SettingItem>

          <div class="line" v-if="settingStore.autoNextWord"></div>
          <SettingItem title="自动切换下一个单词"
          desc="未开启自动切换时，当输入完成后请使用空格键切换下一个"
          >
            <Switch v-model="settingStore.autoNextWord"/>
          </SettingItem>

          <SettingItem title="自动切换下一个单词时间"
                       desc="正确输入单词后，自动跳转下一个单词的时间"
                       v-if="settingStore.autoNextWord"
          >
            <InputNumber v-model="settingStore.waitTimeForChangeWord"
                         :min="10"
                         :max="100"
                         type="number"
            />
            <span class="ml-4">毫秒</span>
          </SettingItem>

          <div class="line" v-if="settingStore.autoNextWord"></div>


          <SettingItem title="单词循环设置" class="gap-0!">
            <RadioGroup v-model="settingStore.repeatCount">
              <Radio :value="1" size="default">1</Radio>
              <Radio :value="2" size="default">2</Radio>
              <Radio :value="3" size="default">3</Radio>
              <Radio :value="5" size="default">5</Radio>
              <Radio :value="100" size="default">自定义</Radio>
            </RadioGroup>
            <div class="ml-2 center gap-space" v-if="settingStore.repeatCount === 100">
              <span>循环次数</span>
              <InputNumber v-model="settingStore.repeatCustomCount"
                           :min="6"
                           :max="15"
                           type="number"
              />
            </div>
          </SettingItem>

          <div class="line"></div>

          <SettingItem title="字体设置(仅单词练习界面生效)"/>
          <SettingItem title="外语字体">
            <Slider
                :min="10"
                :max="100"
                v-model="settingStore.fontSize.wordForeignFontSize"/>
            <span class="w-10 pl-5">{{ settingStore.fontSize.wordForeignFontSize }}px</span>
          </SettingItem>
          <SettingItem title="中文字体">
            <Slider
                :min="10"
                :max="100"
                v-model="settingStore.fontSize.wordTranslateFontSize"/>
            <span class="w-10 pl-5">{{ settingStore.fontSize.wordTranslateFontSize }}px</span>
          </SettingItem>

          <div class="line"></div>
          <SettingItem title="简单词过滤"
                       desc="开启后，练习单词中不会包含简单词；文章统计的总词数中不会包含简单词"
          >
            <Switch v-model="settingStore.ignoreSimpleWord"/>
          </SettingItem>

          <SettingItem title="简单词列表"
                       class="items-start!"
                       v-if="settingStore.ignoreSimpleWord"
          >
            <Textarea
                placeholder="多个单词用英文逗号隔号"
                v-model="simpleWords" :autosize="{minRows: 6, maxRows: 10}"/>
          </SettingItem>
        </div>
        <div v-if="tabIndex === 1">
          <SettingItem mainTitle="所有音效">
            <Switch v-model="settingStore.allSound" @change="useChangeAllSound"/>
          </SettingItem>

          <div class="line"></div>
          <SettingItem title="单词/句子自动发音">
            <Switch v-model="settingStore.wordSound"/>
          </SettingItem>
          <SettingItem title="单词/句子发音口音">
            <Select v-model="settingStore.wordSoundType"
                    placeholder="请选择"
                    class="w-50!"
            >
              <Option label="美音" value="us"/>
              <Option label="英音" value="uk"/>
            </Select>
          </SettingItem>
          <SettingItem title="音量">
            <Slider v-model="settingStore.wordSoundVolume"/>
            <span class="w-10 pl-5">{{ settingStore.wordSoundVolume }}%</span>
          </SettingItem>
          <SettingItem title="倍速">
            <Slider v-model="settingStore.wordSoundSpeed" :step="0.1" :min="0.5" :max="3"/>
            <span class="w-10 pl-5">{{ settingStore.wordSoundSpeed }}</span>
          </SettingItem>

          <div class="line"></div>
          <SettingItem title="按键音">
            <Switch v-model="settingStore.keyboardSound"/>
          </SettingItem>
          <SettingItem title="按键音效">
            <Select v-model="settingStore.keyboardSoundFile"
                    placeholder="请选择"
                    class="w-50!"
            >
              <Option
                  v-for="item in SoundFileOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              >
                <div class="flex justify-between items-center w-full">
                  <span>{{ item.label }}</span>
                  <VolumeIcon
                      :time="100"
                      @click="usePlayAudio(getAudioFileUrl(item.value)[0])"/>
                </div>
              </Option>
            </Select>
          </SettingItem>
          <SettingItem title="音量">
            <Slider v-model="settingStore.keyboardSoundVolume"/>
            <span class="w-10 pl-5">{{ settingStore.keyboardSoundVolume }}%</span>
          </SettingItem>

          <div class="line"></div>
          <SettingItem title="效果音（输入错误、完成时的音效）">
            <Switch v-model="settingStore.effectSound"/>
          </SettingItem>
          <SettingItem title="音量">
            <Slider v-model="settingStore.effectSoundVolume"/>
            <span class="w-10 pl-5">{{ settingStore.effectSoundVolume }}%</span>
          </SettingItem>
        </div>
        <div class="body" v-if="tabIndex === 2">
          <div class="row">
            <label class="main-title">功能</label>
            <div class="wrapper">快捷键(点击可修改)</div>
          </div>
          <div class="scroll">
            <div class="row" v-for="item of Object.entries(settingStore.shortcutKeyMap)">
              <label class="item-title">{{ item[0] }}</label>
              <div class="wrapper" @click="editShortcutKey = item[0]">
                <div class="set-key" v-if="editShortcutKey === item[0]">
                  <input :value="item[1]?item[1]:'未设置快捷键'" readonly type="text" @blur="editShortcutKey = ''">
                  <span @click.stop="editShortcutKey = ''">按键盘进行设置，<span class="text-red!">设置完成点击这里</span></span>
                </div>
                <div v-else>
                  <div v-if="item[1]">{{ item[1] }}</div>
                  <span v-else>未设置快捷键</span>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <label class="item-title"></label>
            <div class="wrapper">
              <BaseButton @click="resetShortcutKeyMap">恢复默认</BaseButton>
            </div>
          </div>
        </div>
        <div v-if="tabIndex === 3">
          <div>
            目前用户的所有数据(自定义设置、自定义词典、自定义文章、学习进度等)
            <b class="text-red">仅保存在本地</b>。如果您需要在不同的设备、浏览器或者其他非官方部署上使用 {{ APP_NAME }}，
            您需要手动进行数据同步和保存。
          </div>
          <BaseButton class="mt-3" @click="exportData()">导出数据</BaseButton>

          <div class="line my-3"></div>

          <div>请注意，导入数据后将<b class="text-red"> 完全覆盖 </b>当前所有数据(自定义设置、自定义词典、自定义文章、学习进度等)，请谨慎操作。
          </div>
          <div class="flex gap-space mt-3">
            <div class="import hvr-grow">
              <BaseButton>导入数据</BaseButton>
              <input type="file"
                     accept="application/json"
                     @change="importData">
            </div>
            <PopConfirm
                title="导入老版本数据前，请先备份当前数据，确定要导入老版本数据吗？"
                @confirm="importOldData">
              <BaseButton>老版本数据导入</BaseButton>
            </PopConfirm>
          </div>
        </div>
        <div v-if="tabIndex === 4">
          <div>
            给我发Email：<a href="mailto:zyronon@163.com">zyronon@163.com</a>
          </div>
          <span>在<a :href="GITHUB" target="_blank"> Github </a>上给作者提一个
            <a :href="`${GITHUB}/issues`" target="_blank"> Issue </a>
            </span>
        </div>
        <div v-if="tabIndex === 5" class="center flex-col">
          <h1>Type Words</h1>
          <p class="w-100 text-xl">
            感谢使用本项目！本项目是开源项目，如果觉得有帮助，请在 GitHub 点个 Star，您的支持是我持续改进的动力。
          </p>
          <p>
            GitHub地址：<a href="https://github.com/zyronon/TypeWords" target="_blank">https://github.com/zyronon/TypeWords</a>
          </p>
          <p>
            反馈：<a
              href="https://github.com/zyronon/TypeWords/issues" target="_blank">https://github.com/zyronon/TypeWords/issues</a>
          </p>
          <div class="text-md color-gray">
            Build {{ gitLastCommitHash }}
          </div>
        </div>
      </div>
    </div>
  </BasePage>
</template>

<style scoped lang="scss">

.setting {
  @apply text-lg;
  display: flex;
  color: var(--color-font-1);

  .left {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    border-right: 2px solid gainsboro;

    .tabs {
      padding: .6rem 1.6rem;
      display: flex;
      flex-direction: column;
      gap: .6rem;
      //color: #0C8CE9;

      .tab {
        cursor: pointer;
        padding: .6rem .9rem;
        border-radius: .5rem;
        display: flex;
        align-items: center;
        gap: .6rem;

        &.active {
          background: var(--color-select-bg);
          color: var(--color-select-text);
        }
      }
    }
  }

  .content {
    flex: 1;
    height: 100%;
    overflow: auto;
    padding: 0 2.6rem;

    .row {
      min-height: 2.6rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: calc(var(--space) * 5);

      .wrapper {
        height: 2rem;
        flex: 1;
        display: flex;
        justify-content: flex-end;
        gap: var(--space);

        span {
          text-align: right;
          //width: 30rem;
          font-size: .7rem;
          color: gray;
        }

        .set-key {
          align-items: center;

          input {
            width: 9rem;
            box-sizing: border-box;
            margin-right: .6rem;
            height: 1.8rem;
            outline: none;
            font-size: 1rem;
            border: 1px solid gray;
            border-radius: .2rem;
            padding: 0 .3rem;
            background: var(--color-second);
            color: var(--color-font-1);
          }
        }
      }

      .main-title {
        font-size: 1.1rem;
        font-weight: bold;
      }

      .item-title {
        font-size: 1rem;
      }

      .sub-title {
        font-size: .9rem;
      }
    }

    .body {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .scroll {
      flex: 1;
      padding-right: .6rem;
      overflow: auto;
    }

    .line {
      border-bottom: 1px solid #c4c3c3;
    }
  }
}

.import {
  display: inline-flex;
  position: relative;

  input {
    position: absolute;
    height: 100%;
    width: 100%;
    opacity: 0;
  }
}
</style>
