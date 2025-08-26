import {onMounted, onUnmounted, watch, onDeactivated} from "vue";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {useSettingStore} from "@/stores/setting.ts";

export function useWindowClick(cb: (e: PointerEvent) => void) {
  onMounted(() => {
    emitter.on(EventKey.closeOther, cb)
    window.addEventListener('click', cb)
  })
  onUnmounted(() => {
    window.removeEventListener('click', cb)
  })
}

export function useEventListener(type: string, listener: EventListenerOrEventListenerObject) {
  onMounted(() => window.addEventListener(type, listener))
  onUnmounted(() => window.removeEventListener(type, listener))
  onDeactivated(() => window.removeEventListener(type, listener))
}

export function getShortcutKey(e: KeyboardEvent) {
  let shortcutKey = ''
  if (e.ctrlKey) shortcutKey += 'Ctrl+'
  if (e.altKey) shortcutKey += 'Alt+'
  if (e.shiftKey) shortcutKey += 'Shift+'
  if (e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Shift') {
    if (e.keyCode >= 65 && e.keyCode <= 90) {
      shortcutKey += e.key.toUpperCase()
    } else {
      if (e.key === 'ArrowRight') {
        shortcutKey += '➡'
      } else if (e.key === 'ArrowLeft') {
        shortcutKey += '⬅'
      } else if (e.key === 'ArrowUp') {
        shortcutKey += '⬆'
      } else if (e.key === 'ArrowDown') {
        shortcutKey += '⬇'
      } else {
        shortcutKey += e.key
      }
    }
  }
  shortcutKey = shortcutKey.trim()

  // console.log('key', shortcutKey)
  return shortcutKey
}

export function useStartKeyboardEventListener() {
  const runtimeStore = useRuntimeStore()
  const settingStore = useSettingStore()

  useEventListener('keydown', (e: KeyboardEvent) => {
    if (!runtimeStore.disableEventListener) {
      let shortcutKey = getShortcutKey(e)
      // console.log('shortcutKey', shortcutKey)

      let list = Object.entries(settingStore.shortcutKeyMap)
      let shortcutEvent = ''
      for (let i = 0; i < list.length; i++) {
        let [k, v] = list[i]
        if (v === shortcutKey) {
          // console.log('快捷键', k)
          shortcutEvent = k
          break
        }
      }
      if (shortcutEvent) {
        e.preventDefault()
        emitter.emit(shortcutEvent, e)
      } else {
        //非英文模式下，输入区域的 keyCode 均为 229时，
        if (((e.keyCode >= 65 && e.keyCode <= 90)
          || (e.keyCode >= 48 && e.keyCode <= 57)
          || e.code === 'Space'
          || e.code === 'Slash'
          || e.code === 'Quote'
          || e.code === 'Comma'
          || e.code === 'BracketLeft'
          || e.code === 'BracketRight'
          || e.code === 'Period'
          || e.code === 'Minus'
          || e.code === 'Equal'
          || e.code === 'Semicolon'
          // || e.code === 'Backquote'
          || e.keyCode === 229
          //当按下功能键时，不阻止事件传播
        ) && (!e.ctrlKey && !e.altKey)) {
          e.preventDefault()
          emitter.emit(EventKey.onTyping, e)
        } else {
          emitter.emit(EventKey.keydown, e)
        }
      }

    }
  })
  useEventListener('keyup', (e: KeyboardEvent) => {
    if (!runtimeStore.disableEventListener) {
      emitter.emit(EventKey.keyup, e)
    }
  })
}

export function useOnKeyboardEventListener(onKeyDown: (e: KeyboardEvent) => void, onKeyUp: (e: KeyboardEvent) => void) {
  onMounted(() => {
    emitter.on(EventKey.keydown, onKeyDown)
    emitter.on(EventKey.keyup, onKeyUp)
  })
  onUnmounted(() => {
    emitter.off(EventKey.keydown, onKeyDown)
    emitter.off(EventKey.keyup, onKeyUp)
  })
}

//因为如果用useStartKeyboardEventListener局部变量控制，当出现多个hooks时就不行了，所以用全局变量来控制
export function useDisableEventListener(watchVal: any) {
  const runtimeStore = useRuntimeStore()
  watch(watchVal, (n: any) => {
    runtimeStore.disableEventListener = n
  })
}
