<script setup lang="ts">

import {onMounted, onUnmounted, watch} from "vue";
import {useBaseStore} from "@/stores/base.ts";
import {emitter, EventKey, useEvents} from "@/utils/eventBus.ts";
import {useSettingStore} from "@/stores/setting.ts";
import {Article, ArticleItem, ArticleWord, Dict, DictType, ShortcutKey, Word} from "@/types/types.ts";
import {useDisableEventListener, useOnKeyboardEventListener, useStartKeyboardEventListener} from "@/hooks/event.ts";
import useTheme from "@/hooks/theme.ts";
import Toast from '@/pages/pc/components/base/toast/Toast.ts'
import {_getDictDataByUrl, cloneDeep} from "@/utils";
import {usePracticeStore} from "@/stores/practice.ts";
import {useArticleOptions} from "@/hooks/dict.ts";
import {genArticleSectionData, usePlaySentenceAudio} from "@/hooks/article.ts";
import {getDefaultArticle, getDefaultDict} from "@/types/func.ts";
import TypingArticle from "@/pages/pc/article/components/TypingArticle.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import Panel from "@/pages/pc/components/Panel.vue";
import ArticleList from "@/pages/pc/components/list/ArticleList.vue";
import EditSingleArticleModal from "@/pages/pc/article/components/EditSingleArticleModal.vue";
import Tooltip from "@/pages/pc/components/base/Tooltip.vue";
import ConflictNotice from "@/pages/pc/components/ConflictNotice.vue";
import {useRoute, useRouter} from "vue-router";
import book_list from "@/assets/book-list.json";
import PracticeLayout from "@/pages/pc/components/PracticeLayout.vue";

const store = useBaseStore()
const settingStore = useSettingStore()
const statisticsStore = usePracticeStore()
const {toggleTheme} = useTheme()

let articleData = $ref({
  list: [],
  article: getDefaultArticle(),
  sectionIndex: 0,
  sentenceIndex: 0,
  wordIndex: 0,
  stringIndex: 0,
})
let showEditArticle = $ref(false)
let typingArticleRef = $ref<any>()
let loading = $ref<boolean>(false)
let editArticle = $ref<Article>(getDefaultArticle())

function write() {
  // console.log('write')
  settingStore.dictation = true
  repeat()
}

//TODO 需要判断是否已忽略
//todo 使用场景是？
function repeat() {
  // console.log('repeat')
  getCurrentPractice()
}

function prev() {
  // console.log('next')
  if (store.sbook.lastLearnIndex === 0) {
    Toast.warning('已经在第一章了~')
  } else {
    store.sbook.lastLearnIndex--
    getCurrentPractice()
  }
}

const toggleShowTranslate = () => settingStore.translate = !settingStore.translate
const toggleDictation = () => settingStore.dictation = !settingStore.dictation
const togglePanel = () => settingStore.showPanel = !settingStore.showPanel
const skip = () => typingArticleRef?.nextSentence()
const collect = () => toggleArticleCollect(articleData.article)
const shortcutKeyEdit = () => edit()

function toggleConciseMode() {
  settingStore.showToolbar = !settingStore.showToolbar
  settingStore.showPanel = settingStore.showToolbar
}

function next() {
  if (store.sbook.lastLearnIndex >= articleData.list.length - 1) {
    store.sbook.lastLearnIndex = 0
    //todo 这里应该弹窗
  } else store.sbook.lastLearnIndex++
  getCurrentPractice()
}

const router = useRouter()
const route = useRoute()

async function init() {
  console.log('load好了开始加载')
  let dict = getDefaultDict()
  let dictId = route.params.id
  if (dictId) {
    //先在自己的词典列表里面找，如果没有再在资源列表里面找
    dict = store.article.bookList.find(v => v.id === dictId)
    if (!dict) dict = book_list.flat().find(v => v.id === dictId) as Dict
    if (dict && dict.id) {
      //如果是不是自定义词典，就请求数据
      if (!dict.custom) dict = await _getDictDataByUrl(dict, DictType.article)
      if (!dict.articles.length) {
        router.push('/articles')
        return Toast.warning('没有文章可学习！')
      }
      store.changeBook(dict)
      articleData.list = cloneDeep(store.sbook.articles)
      getCurrentPractice()
      loading = false
    } else {
      router.push('/articles')
    }
  } else {
    router.push('/articles')
  }
}

watch(() => store.load, (n) => {
  if (n && loading) init()
}, {immediate: true})

onMounted(() => {
  if (store.sbook?.articles?.length) {
    articleData.list = cloneDeep(store.sbook.articles)
    getCurrentPractice()
  } else {
    loading = true
  }
})


useStartKeyboardEventListener()
useDisableEventListener(() => loading)

function setArticle(val: Article) {
  statisticsStore.inputWordNumber = 0
  statisticsStore.wrong = 0
  statisticsStore.total = 0
  statisticsStore.startDate = Date.now()

  articleData.list[store.sbook.lastLearnIndex] = val
  articleData.article = val
  articleData.sectionIndex = 0
  articleData.sentenceIndex = 0
  articleData.wordIndex = 0
  articleData.stringIndex = 0
  let ignoreList = [store.allIgnoreWords, store.knownWords][settingStore.ignoreSimpleWord ? 0 : 1]
  articleData.article.sections.map((v, i) => {
    v.map((w, j) => {
      w.words.map(s => {
        if (!ignoreList.includes(s.word.toLowerCase()) && !s.isSymbol) {
          statisticsStore.total++
        }
      })
    })
  })
}

function getCurrentPractice() {
  emitter.emit(EventKey.resetWord)
  let currentArticle = articleData.list[store.sbook.lastLearnIndex]
  let article = getDefaultArticle(currentArticle)
  // console.log('article', article)
  if (article.sections.length) {
    setArticle(article)
  } else {
    genArticleSectionData(article)
    setArticle(article)
  }
}

function saveArticle(val: Article) {
  console.log('saveArticle', val, JSON.stringify(val.lrcPosition))
  console.log('saveArticle', val.textTranslate)
  showEditArticle = false
  let rIndex = store.sbook.articles.findIndex(v => v.id === val.id)
  if (rIndex > -1) {
    store.sbook.articles[rIndex] = cloneDeep(val)
  }
  setArticle(val)
}

function edit(val: Article = articleData.article) {
  editArticle = val
  showEditArticle = true
}

function wrong(word: Word) {
  let lowerName = word.word.toLowerCase();
  if (!store.wrong.words.find((v: Word) => v.word.toLowerCase() === lowerName)) {
    store.wrong.words.push(word)
  }
  if (!store.allIgnoreWords.includes(lowerName)) {
    //todo
  }
}

function nextWord(word: ArticleWord) {
  if (!store.allIgnoreWords.includes(word.word.toLowerCase()) && !word.isSymbol) {
    statisticsStore.inputWordNumber++
  }
}

function changeArticle(val: ArticleItem) {
  let rIndex = articleData.list.findIndex(v => v.id === val.item.id)
  if (rIndex > -1) {
    store.sbook.lastLearnIndex = rIndex
    getCurrentPractice()
  }
}

const {
  isArticleCollect,
  toggleArticleCollect
} = useArticleOptions()

function play() {
  typingArticleRef?.play()
}

function show() {
  typingArticleRef?.showSentence()
}

function onKeyUp() {
  typingArticleRef.hideSentence()
}

async function onKeyDown(e: KeyboardEvent) {
  // console.log('e', e)
  switch (e.key) {
    case 'Backspace':
      typingArticleRef.del()
      break
  }
}

useOnKeyboardEventListener(onKeyDown, onKeyUp)

useEvents([
  [EventKey.write, write],
  [EventKey.repeatStudy, repeat],
  [EventKey.continueStudy, next],

  [ShortcutKey.PreviousChapter, prev],
  [ShortcutKey.RepeatChapter, repeat],
  [ShortcutKey.DictationChapter, write],
  [ShortcutKey.ToggleShowTranslate, toggleShowTranslate],
  [ShortcutKey.ToggleDictation, toggleDictation],
  [ShortcutKey.ToggleTheme, toggleTheme],
  [ShortcutKey.ToggleConciseMode, toggleConciseMode],
  [ShortcutKey.TogglePanel, togglePanel],
  [ShortcutKey.NextChapter, next],
  [ShortcutKey.PlayWordPronunciation, play],
  [ShortcutKey.ShowWord, show],
  [ShortcutKey.Next, skip],
  [ShortcutKey.ToggleCollect, collect],
  [ShortcutKey.EditArticle, shortcutKeyEdit],
])

let speedMinute = $ref(0)
let timer = $ref(0)
onMounted(() => {
  timer = setInterval(() => {
    speedMinute = Math.floor((Date.now() - statisticsStore.startDate) / 1000 / 60)
  }, 1000)
})

onUnmounted(() => {
  timer && clearInterval(timer)
})

let audioRef = $ref<HTMLAudioElement>()
const {playSentenceAudio} = usePlaySentenceAudio()

</script>
<template>
  <PracticeLayout
      v-loading="loading"
      panelLeft="var(--article-panel-margin-left)">
    <template v-slot:practice>
      <TypingArticle
          ref="typingArticleRef"
          @edit="edit"
          @wrong="wrong"
          @next="next"
          @nextWord="nextWord"
          @play="e => playSentenceAudio(e,audioRef,articleData.article)"
          :article="articleData.article"
      />
    </template>
    <template v-slot:panel>
      <Panel :style="{width:'var(--article-panel-width)'}">
        <template v-slot:title>
            <span>{{
                store.sbook.name
              }} ({{ store.sbook.lastLearnIndex + 1 }} / {{ articleData.list.length }})</span>
        </template>
        <div class="panel-page-item pl-4">
          <ArticleList
              :isActive="true"
              :static="false"
              :show-translate="settingStore.translate"
              @click="changeArticle"
              :active-id="articleData.article.id"
              :list="articleData.list ">
            <template v-slot:suffix="{item,index}">
              <BaseIcon
                  :class="!isArticleCollect(item) ? 'collect' : 'fill'"
                  @click.stop="toggleArticleCollect(item)"
                  :title="!isArticleCollect(item) ? '收藏' : '取消收藏'">
                <IconFluentStar16Regular v-if="!isArticleCollect(item)"/>
                <IconFluentStar16Filled v-else/>
              </BaseIcon>
            </template>
          </ArticleList>
        </div>
      </Panel>
    </template>
    <template v-slot:footer>
      <div class="footer">
        <Tooltip :title="settingStore.showToolbar?'收起':'展开'">
          <IconFluentChevronLeft20Filled
              @click="settingStore.showToolbar = !settingStore.showToolbar"
              class="arrow"
              :class="!settingStore.showToolbar && 'down'"
              color="#999"/>
        </Tooltip>
        <div class="bottom">
          <div class="flex justify-between items-center">
            <div class="stat">
              <div class="row">
                <div class="num">{{ speedMinute }}分钟</div>
                <div class="line"></div>
                <div class="name">时间</div>
              </div>
              <div class="row">
                <div class="num">{{ statisticsStore.total }}</div>
                <div class="line"></div>
                <div class="name">单词总数</div>
              </div>
            </div>
            <audio ref="audioRef" v-if="articleData.article.audioSrc" :src="articleData.article.audioSrc"
                   controls></audio>
            <div class="flex flex-col items-center justify-center gap-1">
              <div class="flex gap-2 center">
                <BaseIcon
                    :title="`下一句(${settingStore.shortcutKeyMap[ShortcutKey.Next]})`"
                    @click="skip">
                  <IconFluentArrowBounce20Regular class="transform-rotate-180"/>
                </BaseIcon>
                <BaseIcon
                    :title="`重听(${settingStore.shortcutKeyMap[ShortcutKey.PlayWordPronunciation]})`"
                    @click="play">
                  <IconFluentReplay20Regular/>
                </BaseIcon>

                <BaseIcon
                    @click="settingStore.dictation = !settingStore.dictation"
                    :title="`开关默写模式(${settingStore.shortcutKeyMap[ShortcutKey.ToggleDictation]})`"
                >
                  <IconFluentEyeOff16Regular v-if="settingStore.dictation"/>
                  <IconFluentEye16Regular v-else/>
                </BaseIcon>

                <BaseIcon
                    :title="`开关释义显示(${settingStore.shortcutKeyMap[ShortcutKey.ToggleShowTranslate]})`"
                    @click="settingStore.translate = !settingStore.translate">
                  <IconFluentTranslate16Regular v-if="settingStore.translate"/>
                  <IconFluentTranslateOff16Regular v-else/>
                </BaseIcon>

                <!--              <BaseIcon-->
                <!--                  :title="`编辑(${settingStore.shortcutKeyMap[ShortcutKey.EditArticle]})`"-->
                <!--                  icon="tabler:edit"-->
                <!--                  @click="emitter.emit(ShortcutKey.EditArticle)"-->
                <!--              />-->
                <BaseIcon
                    @click="settingStore.showPanel = !settingStore.showPanel"
                    :title="`面板(${settingStore.shortcutKeyMap[ShortcutKey.TogglePanel]})`">
                  <IconFluentTextListAbcUppercaseLtr20Regular/>
                </BaseIcon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </PracticeLayout>

  <EditSingleArticleModal
      v-model="showEditArticle"
      :article="editArticle"
      @save="saveArticle"
  />

  <ConflictNotice/>
</template>

<style scoped lang="scss">

.footer {
  width: var(--article-toolbar-width);

  .bottom {
    position: relative;
    width: 100%;
    box-sizing: border-box;
    border-radius: .6rem;
    background: var(--color-second);
    padding: .5rem var(--space);
    z-index: 2;
    border: 1px solid var(--color-item-border);
    box-shadow: var(--shadow);

    .stat {
      margin-top: .5rem;
      display: flex;
      justify-content: space-around;
      gap: var(--stat-gap);

      .row {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: .3rem;
        width: 5rem;
        color: gray;

        .line {
          height: 1px;
          width: 100%;
          background: var(--color-sub-gray);
        }
      }
    }
  }

  .arrow {
    position: absolute;
    top: -40%;
    left: 50%;
    cursor: pointer;
    transition: all .5s;
    transform: rotate(-90deg);
    padding: .5rem;
    font-size: 1.2rem;

    &.down {
      top: -70%;
      transform: rotate(90deg);
    }
  }
}
</style>
