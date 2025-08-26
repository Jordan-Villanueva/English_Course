<script setup lang="ts">

import BaseButton from "@/components/BaseButton.vue";

import {watchEffect} from "vue";
import Textarea from "@/pages/pc/components/base/Textarea.vue";

interface IProps {
  value: string,
}

const props = withDefaults(defineProps<IProps>(), {
  value: '',
})

const emit = defineEmits([
  'save'
])

let editVal = $ref('')
let edit = $ref(false)

watchEffect(() => {
  editVal = props.value
})

function save() {
  emit('save', editVal)
  edit = false
}

function toggle() {
  edit = !edit
  editVal = props.value
}
</script>

<template>
  <div
      v-if="edit"
      class="edit-text">
    <Textarea
        v-model="editVal"
        ref="inputRef"
        textarea
        autosize
        autofocus
        type="textarea"
        :input-style="`color: var(--color-font-1);font-size: 1rem;`"
    />
    <div class="flex justify-end mt-2">
      <BaseButton @click="toggle">取消</BaseButton>
      <BaseButton @click="save">应用</BaseButton>
    </div>
  </div>
  <div
      v-else
      class="text"
      @click="toggle">
    {{ value }}
  </div>
</template>

<style scoped lang="scss">
.edit-text {
  margin-top: .6rem;
  color: var(--color-font-1);
}

.text {
  color: var(--color-font-1);
  font-size: 1.2rem;
  min-height: 1.1rem;
}
</style>
