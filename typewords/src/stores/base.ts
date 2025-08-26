import {defineStore} from 'pinia'
import {Dict, DictId, Word} from "../types/types.ts"
import {_getAccomplishDate, _getStudyProgress, checkAndUpgradeSaveDict} from "@/utils";
import {SAVE_DICT_KEY} from "@/utils/const.ts";
import {shallowReactive} from "vue";
import {getDefaultDict} from "@/types/func.ts";
import {get, set} from 'idb-keyval'

export interface BaseState {
  simpleWords: string[],
  load: boolean
  word: {
    studyIndex: number,
    bookList: Dict[],
  },
  article: {
    bookList: Dict[],
    studyIndex: number,
  }
}

export const DefaultBaseState = (): BaseState => ({
  simpleWords: [
    'a', 'an',
    'i', 'my', 'me', 'you', 'your', 'he', 'his', 'she', 'her', 'it',
    'what', 'who', 'where', 'how', 'when', 'which',
    'be', 'am', 'is', 'was', 'are', 'were', 'do', 'did', 'can', 'could', 'will', 'would',
    'the', 'that', 'this', 'and', 'not', 'no', 'yes',
    'to', 'of', 'for', 'at', 'in'
  ],
  load: false,
  word: {
    bookList: [
      getDefaultDict({id: DictId.wordCollect, name: '收藏'}),
      getDefaultDict({id: DictId.wordWrong, name: '错词'}),
      getDefaultDict({id: DictId.wordKnown, name: '已掌握',description:'已掌握后的单词不会出现在练习中'}),
      // getDefaultDict({
      //   id: 'nce-new-2',
      //   name: '新概念英语(新版)-2',
      //   description: '新概念英语新版第二册',
      //   category: '青少年英语',
      //   tags: ['新概念英语'],
      //   url: 'nce-new-2_v2.json',
      //   length: 862,
      //   translateLanguage: 'common',
      //   language: 'en',
      //   type: DictType.word
      // }),
    ],
    studyIndex: -1,
  },
  article: {
    bookList: [
      getDefaultDict({id: DictId.articleCollect, name: '收藏'})
    ],
    studyIndex: -1,
  }
})

export const useBaseStore = defineStore('base', {
  state: (): BaseState => {
    return DefaultBaseState()
  },
  getters: {
    collectWord(): Dict {
      return this.word.bookList[0]
    },
    collectArticle(): Dict {
      return this.article.bookList[0]
    },
    wrong(): Dict {
      return this.word.bookList[1]
    },
    known(): Dict {
      return this.word.bookList[2]
    },
    knownWords(): string[] {
      return this.known.words.map((v: Word) => v.word.toLowerCase())
    },
    allIgnoreWords() {
      return this.known.words.map((v: Word) => v.word.toLowerCase()).concat(this.simpleWords.map((v: string) => v.toLowerCase()))
    },
    currentStudyWordDict(): Dict {
      if (this.word.studyIndex >= 0) {
        return this.word.bookList[this.word.studyIndex] ?? getDefaultDict()
      }
      return getDefaultDict()
    },
    sdict(): Dict {
      if (this.word.studyIndex >= 0) {
        return this.word.bookList[this.word.studyIndex] ?? getDefaultDict()
      }
      return getDefaultDict()
    },
    currentStudyProgress(): number {
      if (!this.sdict.length) return 0
      if (this.sdict.complete) return 100
      return _getStudyProgress(this.sdict.lastLearnIndex, this.sdict.length)
    },
    getDictCompleteDate(): number {
      if (!this.sdict.length) return 0
      if (!this.sdict.perDayStudyNumber) return 0
      return Math.ceil((this.sdict.length - this.sdict.lastLearnIndex) / this.sdict.perDayStudyNumber)
    },
    currentBook(): Dict {
      return this.article.bookList[this.article.studyIndex] ?? {}
    },
    sbook(): Dict {
      return this.article.bookList[this.article.studyIndex] ?? {}
    },
    currentBookProgress(): number {
      if (!this.sbook.length) return 0
      if (this.sbook.complete) return 100
      return _getStudyProgress(this.sbook.lastLearnIndex, this.sbook.length)
    },
  },
  actions: {
    setState(obj: BaseState) {
      obj.word.bookList.map(book => {
        book.words = shallowReactive(book.words)
        book.articles = shallowReactive(book.articles)
        book.statistics = shallowReactive(book.statistics)
      })
      obj.article.bookList.map(book => {
        book.words = shallowReactive(book.words)
        book.articles = shallowReactive(book.articles)
        book.statistics = shallowReactive(book.statistics)
      })
      this.$patch(obj)
    },
    async init(outData?: any) {
      return new Promise(async resolve => {
        try {
          if (outData) {
            this.setState(outData)
          } else {
            let configStr: string = await get(SAVE_DICT_KEY.key)
            let data = checkAndUpgradeSaveDict(configStr)
            this.setState(data)
          }
          set(SAVE_DICT_KEY.key, JSON.stringify({val: this.$state, version: SAVE_DICT_KEY.version}))
        } catch (e) {
          console.error('读取本地dict数据失败', e)
        }
        resolve(true)
      })
    },
    //改变词典
    changeDict(val: Dict) {
      //把其他的词典的单词数据都删掉，全保存在内存里太卡了
      this.word.bookList.slice(3).map(v => {
        if (!v.custom) {
          v.words = shallowReactive([])
        }
      })
      let rIndex = this.word.bookList.findIndex((v: Dict) => v.id === val.id)
      if (val.words.length < val.perDayStudyNumber) {
        val.perDayStudyNumber = val.words.length
      }
      if (rIndex > -1) {
        this.word.studyIndex = rIndex
        this.word.bookList[this.word.studyIndex].words = shallowReactive(val.words)
        this.word.bookList[this.word.studyIndex].perDayStudyNumber = val.perDayStudyNumber
      } else {
        this.word.bookList.push(getDefaultDict(val))
        this.word.studyIndex = this.word.bookList.length - 1
      }
    },
    //改变书籍
    changeBook(val: Dict) {
      //把其他的书籍里面的文章数据都删掉，全保存在内存里太卡了
      this.article.bookList.slice(1).map(v => {
        if (!v.custom) {
          v.articles = shallowReactive([])
        }
      })
      let rIndex = this.article.bookList.findIndex((v: Dict) => v.id === val.id)
      if (rIndex > -1) {
        this.article.studyIndex = rIndex
        this.article.bookList[this.article.studyIndex].articles = shallowReactive(val.articles)
      } else {
        this.article.bookList.push(getDefaultDict(val))
        this.article.studyIndex = this.article.bookList.length - 1
      }
    },
  },
})
