<script setup lang="ts">
import {ref, useAttrs, watch} from 'vue';

const props = defineProps({
  modelValue: [String, Number],
  placeholder: String,
  disabled: Boolean,
  type: {
    type: String,
    default: 'text',
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  maxLength: Number,
});

const emit = defineEmits(['update:modelValue', 'input', 'change', 'focus', 'blur', 'validation']);
const attrs = useAttrs();

const inputValue = ref(props.modelValue);
const errorMsg = ref('');

watch(() => props.modelValue, (val) => {
  inputValue.value = val;
  validate(val);
});

const validate = (val: string | number | null | undefined) => {
  let err = '';
  const strVal = val == null ? '' : String(val);
  if (props.required && !strVal.trim()) {
    err = '不能为空';
  } else if (props.maxLength && strVal.length > props.maxLength) {
    err = `长度不能超过 ${props.maxLength} 个字符`;
  }
  errorMsg.value = err;
  emit('validation', err === '', err);
  return err === '';
};

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  inputValue.value = target.value;
  validate(target.value);
  emit('update:modelValue', target.value);
  emit('input', e);
};

const onChange = (e: Event) => {
  emit('change', e);
};

const onFocus = (e: FocusEvent) => {
  emit('focus', e);
};

const onBlur = (e: FocusEvent) => {
  validate(inputValue.value);
  emit('blur', e);
};

const clearInput = () => {
  inputValue.value = '';
  validate('');
  emit('update:modelValue', '');
};

</script>

<template>
  <div class="custom-input" :class="{ 'is-disabled': disabled, 'has-error': errorMsg }">
    <input
        v-bind="attrs"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :value="inputValue"
        @input="onInput"
        @change="onChange"
        @focus="onFocus"
        @blur="onBlur"
        class="custom-input__inner"
        :maxlength="maxLength"
    />
    <button
        v-if="clearable && inputValue && !disabled"
        type="button"
        class="custom-input__clear"
        @click="clearInput"
        aria-label="Clear input"
    >×
    </button>

    <div v-if="errorMsg" class="custom-input__error">{{ errorMsg }}</div>
  </div>
</template>

<style scoped lang="scss">
.custom-input {
  position: relative;
  display: inline-block;
  width: 100%;

  &.is-disabled {
    opacity: 0.6;
  }

  &.has-error {
    .custom-input__inner {
      border-color: #f56c6c;
    }

    .custom-input__error {
      color: #f56c6c;
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }
  }

  &__inner {
    width: 100%;
    padding: 0.4rem 1.5rem 0.4rem 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    box-sizing: border-box;
    transition: all .3s;
    color: var(--color-input-color);
    background: var(--color-input-bg);

    &:focus {
      outline: none;
      border-color: #409eff;
      box-shadow: 0 0 3px #409eff;
    }

    &:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }
  }

  &__clear {
    position: absolute;
    right: 0.4rem;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: transparent;
    font-size: 1.2rem;
    line-height: 1;
    cursor: pointer;
    color: #999;
    padding: 0;
    user-select: none;

    &:hover {
      color: #666;
    }
  }

  &__error {
    padding-left: 0.5rem;
  }
}
</style>
