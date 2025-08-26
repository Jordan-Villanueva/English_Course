import * as VueRouter from 'vue-router'
import {RouteRecordRaw} from 'vue-router'
import {useRuntimeStore} from "@/stores/runtime.ts";
import WordHomePage from "@/pages/pc/word/WordHomePage.vue";
import PC from "@/pages/pc/index.vue";
import ArticleHomePage from "@/pages/pc/article/ArticleHomePage.vue";
import StudyArticle from "@/pages/pc/article/StudyArticle.vue";
import DictDetail from "@/pages/pc/word/DictDetail.vue";
import StudyWord from "@/pages/pc/word/StudyWord.vue";
import BookDetail from "@/pages/pc/article/BookDetail.vue";
import DictList from "@/pages/pc/word/DictList.vue";
import BookList from "@/pages/pc/article/BookList.vue";
import Setting from "@/pages/pc/setting/Setting.vue";
import Home from "@/pages/pc/home/index.vue";

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: PC,
    redirect: '/',
    children: [
      {path: '/', component: Home},
      {path: 'words', component: WordHomePage},
      {path: 'word', redirect: '/words'},
      {path: 'dict-list', component: DictList},
      {path: 'practice-words/:id', component: StudyWord},
      {path: 'study-word', redirect: '/word'},
      {path: 'dict-detail', component: DictDetail},

      {path: 'articles', component: ArticleHomePage},
      {path: 'article', redirect: '/articles'},
      {path: 'practice-articles/:id', component: StudyArticle},
      {path: 'study-article', redirect: '/article'},
      {path: 'book-detail', component: BookDetail},
      {path: 'book-list', component: BookList},
      {path: 'edit-article', component: () => import("@/pages/pc/article/EditArticlePage.vue")},
      {path: 'batch-edit-article', component: () => import("@/pages/pc/article/BatchEditArticlePage.vue")},

      {path: 'setting', component: Setting},
    ]
  },
  {path: '/test', component: () => import("@/pages/test/test.vue")},
  {path: '/:pathMatch(.*)*', redirect: '/word'},
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  // history: VueRouter.createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // console.log('savedPosition', savedPosition)
    if (savedPosition) {
      return savedPosition
    } else {
      return {top: 0}
    }
  },
})

router.beforeEach((to: any, from: any) => {
  // console.log('beforeEach-to',to.path)
  // console.log('beforeEach-from',from.path)
  const runtimeStore = useRuntimeStore()

  //footer下面的5个按钮，对跳不要用动画
  let noAnimation = [
    '/pc/practice',
    '/pc/dict',
    '/mobile',
    '/'
  ]
  if (noAnimation.indexOf(from.path) !== -1 && noAnimation.indexOf(to.path) !== -1) {
    return true
  }

  const toDepth = routes.findIndex(v => v.path === to.path)
  const fromDepth = routes.findIndex(v => v.path === from.path)
  // const fromDepth = routeDeep.indexOf(from.path)

  if (toDepth > fromDepth) {
    if (to.matched && to.matched.length) {
      let def = to.matched[0].components.default
      let toComponentName = def.name ?? def.__name
      runtimeStore.updateExcludeRoutes({type: 'remove', value: toComponentName})
      // console.log('删除', toComponentName)
      // console.log('前进')
      // console.log('删除', toComponentName)
    }
  } else {
    if (from.matched && from.matched.length) {
      let def = from.matched[0].components.default
      let fromComponentName = def.name ?? def.__name
      runtimeStore.updateExcludeRoutes({type: 'add', value: fromComponentName})
      // console.log('添加', fromComponentName)
      // console.log('后退')
    }
  }
  // ...
  // 返回 false 以取消导航
  return true
})


export default router
