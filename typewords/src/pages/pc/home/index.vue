<script setup lang="ts">
import {GITHUB, ProjectName} from "@/config/ENV.ts";
import BaseButton from "@/components/BaseButton.vue";
import BaseIcon from "@/components/BaseIcon.vue";
import {defineAsyncComponent} from "vue";

const Dialog = defineAsyncComponent(() => import('@/pages/pc/components/dialog/Dialog.vue'))
let showWechatDialog = $ref(false)
let showXhsDialog = $ref(false)
</script>

<template>
  <div class="flex flex-col justify-between min-h-screen">
    <div class="center flex-col gap-8">
      <h1>{{ ProjectName }}</h1>
      <div class="text-center -mt-10">
        <h2>学习英语，一次敲击，一点进步</h2>
        <h2>记忆不再盲目，学习更高效，开源单词与文章练习工具</h2>
      </div>
      <div class="flex">
        <BaseButton size="large" @click="$router.push('/words')">单词练习</BaseButton>
        <BaseButton size="large" @click="$router.push('/articles')">文章练习</BaseButton>
      </div>
      <div class="w-60vw">
        <div class="flex mb-5 gap-space">
          <div class="card">
            <div class="emoji">📚</div>
            <div class="title">单词练习</div>
            <div class="desc">
              <ul>
                <li>三种输入模式：跟打 / 复习 / 默写</li>
                <li>智能模式：智能规划复习与默写</li>
                <li>自由模式：不受限制，自行规划</li>
              </ul>
            </div>
          </div>
          <div class="card">
            <div class="emoji">✍️</div>
            <div class="title">文章练习</div>
            <div class="desc">
              <ul>
                <li>内置常见书籍，也可自行添加文章</li>
                <li>跟打 + 默写双模式，让背诵更高效</li>
                <li>支持边听边默写，强化记忆</li>
              </ul>
            </div>
          </div>
          <div class="card">
            <div class="emoji">📕</div>
            <div class="title">收藏、错词本、已掌握</div>
            <div class="desc">
              <ul>
                <li>输入错误自动添加到错词本</li>
                <li>主动添加到已掌握，后续自动跳过</li>
                <li>主动添加到收藏中，以便巩固复习</li>
              </ul>
            </div>
          </div>
          <div class="card">
            <div class="emoji">🌐</div>
            <div class="title">海量词库</div>
            <div class="desc">
              内置小学、初中、高中、四六级、考研、雅思、托福、GRE、GMAT、SAT、BEC、专四、专八等词库
            </div>
          </div>

        </div>
        <div class="flex gap-space">
          <div class="card">
            <div class="emoji">🆓</div>
            <div class="title">免费开源</div>
            <div class="desc">
              <ul>
                <li>完全开源，可审查、可修改</li>
                <li>免费使用</li>
                <li>私有部署</li>
              </ul>
            </div>
          </div>
          <div class="card">
            <div class="emoji">⚙️</div>
            <div class="title">高度自由</div>
            <div class="desc">
              <ul>
                <li>丰富的键盘音效</li>
                <li>可自定义快捷键</li>
                <li>高度定制化的设置选项</li>
              </ul>
            </div>
          </div>
          <div class="card">
            <div class="emoji">🎨</div>
            <div class="title">简洁高效</div>
            <div class="desc">
              <ul>
                <li>简洁设计，现代化UI，无广告</li>
                <li>界面清爽，操作简单</li>
                <li>不强制关注任何平台</li>
              </ul>
            </div>
          </div>

          <div class="card">
            <div class="emoji">🎯</div>
            <div class="title">个性学习</div>
            <div class="desc">
              <ul>
                <li>自由添加词典与文章</li>
                <li>定制个性学习计划</li>
                <li>多种学习复习策略</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="w-60vw text-center" v-if="false">
          <h3 class="text-4xl">单词练习</h3>
          <img src="/word.png" alt="word.png" class="w-full rounded-xl">
          <h3 class="text-4xl">文章练习</h3>
          <img src="/article.png" alt="article.png" class="w-full rounded-xl">
        </div>
      </div>
    </div>
    <div class="center gap-space  my-10 bottom">
      <div class="center gap-1">
        <a
            :href="GITHUB"
            target="_blank"
            rel="noreferrer"
            aria-label="GITHUB 项目地址">
          <BaseIcon>
            <IconSimpleIconsGithub/>
          </BaseIcon>
        </a>

        <BaseIcon @click="showWechatDialog = true">
          <IconSimpleIconsWechat/>
        </BaseIcon>
        <BaseIcon @click="showXhsDialog = true" >
          <IconSimpleIconsXiaohongshu/>
        </BaseIcon>
        <a
            href="https://x.com/typewords2"
            target="_blank"
            rel="noreferrer"
            aria-label="关注我的 X 账户 typewords2">
          <BaseIcon>
            <IconRiTwitterFill/>
          </BaseIcon>
        </a>
        <a
            href="mailto:zyronon@163.com"
            target="_blank"
            rel="noreferrer"
            aria-label="发送邮件到 zyronon@163.com">
          <BaseIcon>
            <IconMaterialSymbolsMail/>
          </BaseIcon>
        </a>
      </div>
      <div>蜀ICP备2025157466号</div>
    </div>

    <Dialog v-model="showWechatDialog" title="Type Words 交流群">
      <div class="w-120 p-6 pt-0">
        <div class="mb-4">
          加入我们的用户社群后，您可以与我们的开发团队进行沟通，分享您的使用体验和建议，帮助我们改进产品，同时也能够及时了解我们的最新动态和更新内容。
        </div>
        <div class="text-center">
          <img src="/wechat.png" alt="微信群二维码" class="w-60 rounded-lg">
        </div>
      </div>
    </Dialog>
    <Dialog v-model="showXhsDialog" title="小红书">
      <div class="w-120 p-6 pt-0">
        <div class="mb-4">
          关注小红书后，您可以获得开发团队的最新动态和更新内容，反馈您的使用体验和建议，帮助我们改进产品，同时也能够及时了解我们的最新动态和更新内容。
        </div>
        <div class="text-center">
          <img src="/xhs.png" alt="小红书二维码" class="w-60 rounded-lg">
        </div>
      </div>
    </Dialog>
  </div>
</template>
<style scoped lang="scss">
h1 {
  font-size: 5rem;
  background: linear-gradient(120deg, #bd34fe 30%, #41d1ff);
  -webkit-text-fill-color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 2rem;
}

h2 {
  margin: 0;
}

h3:first-child {
  margin-top: 0;
}

.card {
  @apply flex flex-col items-start gap-2 mb-0 w-25%;
  .emoji {
    display: inline-block;
    background: var(--color-third);
    padding: .6rem;
    border-radius: 0.4rem;
    font-size: 1.5rem;
  }

  .title {
    font-weight: bold;
  }

  ul {
    margin: 0;
    padding-left: 1.2rem;
  }
}

.bottom {
  width: 100%;
  padding-top: 2rem;
  border-top: 1px solid #c4c4c4;
}

a {
  color: unset;
}

</style>
