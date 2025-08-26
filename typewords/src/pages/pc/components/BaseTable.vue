<script setup lang="tsx">

import {nextTick, useSlots} from "vue";
import {Sort} from "@/types/types.ts";
import MiniDialog from "@/pages/pc/components/dialog/MiniDialog.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import BaseButton from "@/components/BaseButton.vue";
import {cloneDeep, debounce, reverse, shuffle} from "@/utils";
import Input from "@/pages/pc/components/Input.vue";
import PopConfirm from "@/pages/pc/components/PopConfirm.vue";
import Empty from "@/components/Empty.vue";
import Pagination from '@/pages/pc/components/base/Pagination.vue'
import Toast from '@/pages/pc/components/base/toast/Toast.ts'
import Checkbox from "@/pages/pc/components/base/checkbox/Checkbox.vue";
import DeleteIcon from "@/components/icon/DeleteIcon.vue";

let list = defineModel('list')

const props = withDefaults(defineProps<{
  loading?: boolean
  showToolbar?: boolean
  del?: Function
  batchDel?: Function
  add?: Function
}>(), {
  loading: true,
  showToolbar: true,
  del: () => void 0,
  add: () => void 0,
  batchDel: () => void 0
})

const emit = defineEmits<{
  click: [val: {
    item: any,
    index: number
  }],
}>()

let listRef: any = $ref()

function scrollToBottom() {
  nextTick(() => {
    listRef?.scrollTo(0, listRef.scrollHeight)
  })
}

function scrollToTop() {
  nextTick(() => {
    listRef?.scrollTo(0, 0)
  })
}

function scrollToItem(index: number) {
  nextTick(() => {
    listRef?.children[index]?.scrollIntoView({block: 'center', behavior: 'smooth'})
  })
}

defineExpose({scrollToBottom, scrollToItem})

let pageNo = $ref(1)
let pageSize = $ref(50)
let currentList = $computed(() => {
  if (searchKey) {
    return list.value.filter(v => v.word.includes(searchKey))
  }
  return list.value.slice((pageNo - 1) * pageSize, (pageNo - 1) * pageSize + pageSize)
})

let selectIds = $ref([])
let selectAll = $computed(() => {
  return !!selectIds.length
})

function toggleSelect(item) {
  let rIndex = selectIds.findIndex(v => v === item.id)
  if (rIndex > -1) {
    selectIds.splice(rIndex, 1)
  } else {
    selectIds.push(item.id)
  }
}

function toggleSelectAll() {
  if (selectAll) {
    selectIds = []
  } else {
    selectIds = currentList.map(v => v.id)
  }
}

let searchKey = $ref('')
let showSortDialog = $ref(false)
let showSearchInput = $ref(false)

function sort(type: Sort) {
  if (type === Sort.reverse) {
    Toast.success('已翻转排序')
    list.value = reverse(cloneDeep(list.value))
  }
  if (type === Sort.random) {
    Toast.success('已随机排序')
    list.value = shuffle(cloneDeep(list.value))
  }
  showSortDialog = false
}

function handleBatchDel() {
  props.batchDel(selectIds)
  selectIds = []
}

function handlePageNo(e) {
  pageNo = e
  scrollToTop()
}

const s = useSlots()

defineRender(
    () => {
      const d = (item) => <Checkbox
          modelValue={selectIds.includes(item.id)}
          onChange={() => toggleSelect(item)}
          size="large"/>

      return (
          <div class="flex flex-col gap-3">
            {
                props.showToolbar && <div>
                  {
                    showSearchInput ? (
                        <div
                            class="flex gap-4"
                        >
                          <Input
                              prefixIcon
                              modelValue={searchKey}
                              onUpdate:modelValue=
                                  {debounce(e => searchKey = e)}
                              class="flex-1"/>
                          <BaseButton onClick={() => (showSearchInput = false, searchKey = '')}>取消</BaseButton>
                        </div>
                    ) : (
                        <div class="flex justify-between " v-else>
                          <div class="flex gap-2 items-center">
                            <Checkbox
                                disabled={!currentList.length}
                                onChange={() => toggleSelectAll()}
                                modelValue={selectAll}
                                size="large"/>
                            <span>{selectIds.length} / {list.value.length}</span>
                          </div>

                          <div class="flex gap-2 relative">
                            {
                              selectIds.length ?
                                  <PopConfirm title="确认删除所有选中数据？"
                                              onConfirm={handleBatchDel}
                                  >
                                    <BaseIcon
                                        class="del"
                                        title="删除">
                                      <DeleteIcon/>
                                    </BaseIcon>
                                  </PopConfirm>
                                  : null
                            }
                            <BaseIcon
                                onClick={props.add}
                                icon="fluent:add-20-filled"
                                title="添加单词">
                              <IconFluentAdd20Regular/>
                            </BaseIcon>
                            <BaseIcon
                                disabled={!currentList.length}
                                title="改变顺序"
                                icon="icon-park-outline:sort-two"
                                onClick={() => showSortDialog = !showSortDialog}
                            >
                              <IconFluentArrowSort20Regular/>
                            </BaseIcon>
                            <BaseIcon
                                disabled={!currentList.length}
                                onClick={() => showSearchInput = !showSearchInput}
                                title="搜索">
                              <IconFluentSearch20Regular/>
                            </BaseIcon>
                            <MiniDialog
                                modelValue={showSortDialog}
                                onUpdate:modelValue={e => showSortDialog = e}
                                style="width: 8rem;"
                            >
                              <div class="mini-row-title">
                                列表顺序设置
                              </div>
                              <div class="mini-row">
                                <BaseButton size="small" onClick={() => sort(Sort.reverse)}>翻转
                                </BaseButton>
                                <BaseButton size="small" onClick={() => sort(Sort.random)}>随机</BaseButton>
                              </div>
                            </MiniDialog>
                          </div>
                        </div>
                    )
                  }
                </div>
            }
            {
              props.loading ?
                  <div class="h-full w-full center text-4xl">
                    <IconEosIconsLoading color="gray"/>
                  </div>
                  : currentList.length ? (
                      <>
                        <div class="flex-1 overflow-auto"
                             ref={e => listRef = e}>
                          {currentList.map((item, index) => {
                            return (
                                <div class="list-item-wrapper"
                                     key={item.word}
                                >
                                  {s.default({checkbox: d, item, index: (pageSize * (pageNo - 1)) + index + 1})}
                                </div>
                            )
                          })}
                        </div>
                        <div class="flex justify-end">
                          <Pagination
                              currentPage={pageNo}
                              onUpdate:current-page={handlePageNo}
                              pageSize={pageSize}
                              onUpdate:page-size={(e) => pageSize = e}
                              pageSizes={[20, 50, 100, 200]}
                              layout="prev, pager, next"
                              total={list.value.length}/>
                        </div>
                      </>
                  ) : <Empty/>
            }
          </div>
      )
    }
)
</script>
<style scoped lang="scss">

</style>
