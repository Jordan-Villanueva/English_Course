<script setup lang="ts">
import {useBaseStore} from "@/stores/base.ts";
import {useRouter} from "vue-router";
import BasePage from "@/pages/pc/components/BasePage.vue";
import {_getDictDataByUrl, useNav} from "@/utils";
import {DictResource, DictType} from "@/types/types.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import BaseIcon from "@/components/BaseIcon.vue";
import Book from "@/pages/pc/components/Book.vue";
import Progress from '@/pages/pc/components/base/Progress.vue';
import Toast from '@/pages/pc/components/base/toast/Toast.ts'
import BaseButton from "@/components/BaseButton.vue";
import PopConfirm from "@/pages/pc/components/PopConfirm.vue";
import {onMounted, watch} from "vue";
import {getDefaultDict} from "@/types/func.ts";
import DeleteIcon from "@/components/icon/DeleteIcon.vue";
import recommendBookList from "@/assets/book-list.json";

const {nav} = useNav()
const base = useBaseStore()
const store = useBaseStore()
const router = useRouter()
const runtimeStore = useRuntimeStore()

onMounted(init)
watch(() => store.load, init)

async function init() {
  if (store.article.studyIndex >= 1) {
    if (!store.sbook.custom && !store.sbook.articles.length) {
      store.article.bookList[store.article.studyIndex] = await _getDictDataByUrl(store.sbook, DictType.article)
    }
  }
}

function startStudy() {
  if (base.sbook.id) {
    if (!base.sbook.articles.length) {
      return Toast.warning('没有文章可学习！')
    }
    window.umami?.track('startStudyArticle', {
      name: base.sbook.name,
      index: base.sbook.lastLearnIndex,
      custom: base.sbook.custom,
      complete: base.sbook.complete,
    })
    nav('/practice-articles/' + store.sbook.id)
  } else {
    window.umami?.track('no-book')
    Toast.warning('请先选择一本书籍')
  }
}

let isMultiple = $ref(false)
let selectIds = $ref([])

function handleBatchDel() {
  selectIds.forEach(id => {
    let r = base.article.bookList.findIndex(v => v.id === id)
    if (r !== -1) {
      if (base.article.studyIndex === r) {
        base.article.studyIndex = -1
      }
      if (base.article.studyIndex > r) {
        base.article.studyIndex--
      }
      base.article.bookList.splice(r, 1)
    }
  })
  selectIds = []
  Toast.success("删除成功！")
}

function toggleSelect(item) {
  let rIndex = selectIds.findIndex(v => v === item.id)
  if (rIndex > -1) {
    selectIds.splice(rIndex, 1)
  } else {
    selectIds.push(item.id)
  }
}

async function goBookDetail(val: DictResource) {
  runtimeStore.editDict = getDefaultDict(val)
  nav('book-detail')
}

</script>

<template>
  <BasePage>
    <div class="card ">
      <div class="flex justify-between items-center">
        <div class="bg-third p-3 gap-4 rounded-md cursor-pointer flex items-center">
          <span class="text-lg font-bold"
                @click="goBookDetail(base.currentBook)">{{
              base.currentBook.name || '请选择书籍开始学习'
            }}</span>
          <BaseIcon @click="router.push('/book-list')">
            <IconFluentArrowSort20Regular v-if="base.currentBook.name"/>
            <IconFluentAdd16Filled v-else/>
          </BaseIcon>
        </div>
        <BaseButton size="large"
                    @click="startStudy"
                    :disabled="!base.currentBook.name">
          <div class="flex items-center gap-2">
            <span class="line-height-[2]">开始学习</span>
            <IconFluentArrowCircleRight16Regular class="text-xl"/>
          </div>
        </BaseButton>
      </div>
      <div class="mt-5 text-sm">已学习{{ base.currentBook.lastLearnIndex }}篇文章</div>
      <Progress class="mt-1" :percentage="base.currentBookProgress" :show-text="false"></Progress>
    </div>

    <div class="card  flex flex-col">
      <div class="flex justify-between">
        <div class="title">我的书籍</div>
        <div class="flex gap-4 items-center">
          <PopConfirm title="确认删除所有选中书籍？" @confirm="handleBatchDel" v-if="selectIds.length">
            <BaseIcon class="del" title="删除">
              <DeleteIcon/>
            </BaseIcon>
          </PopConfirm>

          <div class="color-blue cursor-pointer" v-if="base.article.bookList.length > 1"
               @click="isMultiple = !isMultiple; selectIds = []">{{ isMultiple ? '取消' : '管理书籍' }}
          </div>
          <div class="color-blue cursor-pointer" @click="nav('book-detail', { isAdd: true })">创建个人书籍</div>
        </div>
      </div>
      <div class="flex gap-4 flex-wrap mt-4">
        <Book :is-add="false" quantifier="篇" :item="item" :checked="selectIds.includes(item.id)"
              @check="() => toggleSelect(item)"
              :show-checkbox="isMultiple && j >= 1"
              v-for="(item, j) in base.article.bookList"
              @click="goBookDetail(item)"/>
        <Book :is-add="true" @click="router.push('/book-list')"/>
      </div>
    </div>

    <div class="card  flex flex-col">
      <div class="flex justify-between">
        <div class="title">推荐</div>
        <div class="flex gap-4 items-center">
          <div class="color-blue cursor-pointer" @click="router.push('/book-list')">更多</div>
        </div>
      </div>

      <div class="flex gap-4 flex-wrap  mt-4">
        <Book :is-add="false"
              quantifier="篇"
              :item="item as any"
              v-for="(item, j) in recommendBookList[0]" @click="goBookDetail(item as any)"/>
      </div>
    </div>
  </BasePage>
</template>

<style scoped lang="scss">

</style>
