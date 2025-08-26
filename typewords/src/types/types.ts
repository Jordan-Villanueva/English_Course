export type Word = {
  id?: string,
  custom?: boolean,
  word: string,
  phonetic0: string,
  phonetic1: string,
  trans: {
    pos: string,
    cn: string,
  }[],
  sentences: {
    c: string,//content
    cn: string,
  }[],
  phrases: {
    c: string,
    cn: string,
  }[],
  synos: {
    pos: string,
    cn: string,
    ws: string[]
  }[],
  relWords: {
    root: string,
    rels: {
      pos: string,
      words: {
        c: string,
        cn: string,
      }[],
    }[]
  },
  etymology: {
    t: string,//title
    d: string,//desc
  }[],
}

export const PronunciationApi = 'https://dict.youdao.com/dictvoice?audio='

export type TranslateLanguageType = 'en' | 'zh-CN' | 'ja' | 'de' | 'common' | ''
export type LanguageType = 'en' | 'ja' | 'de' | 'code'

export enum DictType {
  collect = 'collect',
  simple = 'simple',
  wrong = 'wrong',
  known = 'known',
  word = 'word',
  article = 'article',
}

export interface ArticleWord extends Word {
  nextSpace: boolean,
  isSymbol: boolean,
  symbolPosition: 'start' | 'end' | '',
}

export interface Sentence {
  text: string,
  translate: string,
  words: ArticleWord[],
  audioPosition: number[]
}

export interface Article {
  id: string,
  title: string,
  titleTranslate: string,
  text: string,
  textTranslate: string,
  newWords: Word[],
  textAllWords: string[],
  sections: Sentence[][],
  audioSrc: string,
  lrcPosition: number[][],
  questions: {
    stem: string,
    options: string[],
    correctAnswer: string[],
    explanation: string
  }[]
}

export interface Statistics {
  startDate: number,//开始日期
  spend: number,//花费时间
  total: number//单词数量
  new: number//新学单词数量
  review: number//复习单词数量
  wrong: number//错误数
}

export interface DisplayStatistics extends Statistics {
  wrongWords: Word[]
  inputWordNumber: number//输入数
}

export enum Sort {
  normal = 0,
  random = 1,
  reverse = 2
}

export enum ShortcutKey {
  ShowWord = 'ShowWord',
  EditArticle = 'EditArticle',
  Next = 'Next',
  Replay = 'Replay',
  Previous = 'Previous',
  ToggleSimple = 'ToggleSimple',
  ToggleCollect = 'ToggleCollect',
  //todo 这里还用老的Chapter，要改
  NextChapter = 'NextChapter',
  PreviousChapter = 'PreviousChapter',
  RepeatChapter = 'RepeatChapter',
  //todo 废弃
  DictationChapter = 'DictationChapter',
  PlayWordPronunciation = 'PlayWordPronunciation',
  // PlayTranslatePronunciation = 'PlayTranslatePronunciation',
  ToggleShowTranslate = 'ToggleShowTranslate',
  ToggleDictation = 'ToggleDictation',
  ToggleTheme = 'ToggleTheme',
  ToggleConciseMode = 'ToggleConciseMode',
  TogglePanel = 'TogglePanel'
}

export const DefaultShortcutKeyMap = {
  [ShortcutKey.EditArticle]: 'Ctrl+E',
  [ShortcutKey.ShowWord]: 'Escape',
  [ShortcutKey.Previous]: 'Alt+⬅',
  [ShortcutKey.Next]: 'Tab',
  [ShortcutKey.Replay]: 'Tab',
  [ShortcutKey.ToggleSimple]: '`',
  [ShortcutKey.ToggleCollect]: 'Enter',
  [ShortcutKey.PreviousChapter]: 'Ctrl+⬅',
  [ShortcutKey.NextChapter]: 'Ctrl+➡',
  [ShortcutKey.RepeatChapter]: 'Ctrl+Enter',
  [ShortcutKey.DictationChapter]: 'Alt+Enter',
  [ShortcutKey.PlayWordPronunciation]: 'Ctrl+P',
  // [ShortcutKey.PlayTranslatePronunciation]: 'Ctrl+O',
  [ShortcutKey.ToggleShowTranslate]: 'Ctrl+Z',
  [ShortcutKey.ToggleDictation]: 'Ctrl+I',
  [ShortcutKey.ToggleTheme]: 'Ctrl+Q',
  [ShortcutKey.ToggleConciseMode]: 'Ctrl+M',
  [ShortcutKey.TogglePanel]: 'Ctrl+L',
}

export enum TranslateEngine {
  Baidu = 0,
}

export type DictResource = {
  id: string
  name: string
  description: string
  url: string
  length: number
  category: string
  tags: string[]
  translateLanguage: TranslateLanguageType
  //todo 可以考虑删除了
  type?: DictType
  language: LanguageType
}

export interface Dict extends DictResource {
  lastLearnIndex: number,
  perDayStudyNumber: number,
  words: Word[],
  articles: Article[],
  statistics: Statistics[],
  custom: boolean,//是否是自定义词典
  complete: boolean,//是否学习完成，学完了设为true，然后lastLearnIndex重置
}

export interface ArticleItem {
  item: Article,
  index: number
}

export const SlideType = {
  HORIZONTAL: 0,
  VERTICAL: 1,
}

export interface StudyData {
  index: number,
  words: any[],
  wrongWords: any[],
}

export class DictId {
  static wordCollect = 'wordCollect'
  static wordWrong = 'wordWrong'
  static wordKnown = 'wordKnown'
  static articleCollect = 'articleCollect'
}

export enum DictId2 {
  wordCollect = 'wordCollect',
  wordWrong = 'wordWrong',
  wordKnown = 'wordKnown',
  articleCollect = 'articleCollect'
}
