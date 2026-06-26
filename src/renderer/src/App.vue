<script setup lang="ts">
import { ref, h } from 'vue'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  SettingOutlined,
  UserOutlined,
  PlayCircleOutlined,
  FolderOutlined,
  FileOutlined,
  CloudOutlined,
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  StarOutlined,
  HeartOutlined,
  ShareAltOutlined,
  NotificationOutlined,
  AppstoreOutlined,
  PictureOutlined
} from '@ant-design/icons-vue'

const collapsed = ref(false)
const selectedKeys = ref(['1'])

const menuItems = [
  { key: '1', icon: () => h(HomeOutlined), label: '首页' },
  { key: '2', icon: () => h(VideoCameraOutlined), label: '视频管理' },
  { key: '3', icon: () => h(PlayCircleOutlined), label: '播放列表' },
  { key: '4', icon: () => h(FolderOutlined), label: '文件夹' },
  { key: '5', icon: () => h(FileOutlined), label: '文件管理' },
  { key: '6', icon: () => h(CloudOutlined), label: '云存储' },
  { key: '7', icon: () => h(DownloadOutlined), label: '下载中心' },
  { key: '8', icon: () => h(UploadOutlined), label: '上传管理' },
  { key: '9', icon: () => h(PictureOutlined), label: '图片库' },
  { key: '10', icon: () => h(StarOutlined), label: '我的收藏' },
  { key: '11', icon: () => h(HeartOutlined), label: '我的喜欢' },
  { key: '12', icon: () => h(ShareAltOutlined), label: '分享记录' },
  { key: '13', icon: () => h(SearchOutlined), label: '搜索历史' },
  { key: '14', icon: () => h(EditOutlined), label: '编辑记录' },
  { key: '15', icon: () => h(DeleteOutlined), label: '回收站' },
  { key: '16', icon: () => h(NotificationOutlined), label: '消息通知' },
  { key: '17', icon: () => h(UserOutlined), label: '个人中心' },
  { key: '18', icon: () => h(AppstoreOutlined), label: '应用管理' },
  { key: '19', icon: () => h(SettingOutlined), label: '系统设置' },
  { key: '20', icon: () => h(SettingOutlined), label: '关于' }
]
</script>

<template>
  <div class="h-screen flex flex-col bg-[#f7f4ef]">
    <!-- 顶部通栏 - 宣纸白 -->
    <header class="h-14 flex items-center justify-between px-6 bg-[#faf8f4] shrink-0 border-b border-[#e8e0d4]">
      <span class="text-lg font-bold tracking-widest text-[#8b4c3b]">流光 · 视界</span>
      <a-avatar size="small" class="!bg-[#8b4c3b]">U</a-avatar>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- 侧边栏 - 月白 -->
      <aside
        class="bg-[#faf8f4] flex flex-col shrink-0 transition-all duration-200 border-r border-[#e8e0d4]"
        :class="collapsed ? 'w-16' : 'w-52'"
      >
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="inline"
          :items="menuItems"
          :inline-collapsed="collapsed"
          class="sider-menu"
        />

        <!-- 折叠按钮 -->
        <div
          class="shrink-0 p-4 text-center text-[#b5a898] text-base cursor-pointer transition-colors hover:text-[#8b4c3b] hover:bg-[#8b4c3b]/5 border-t border-[#e8e0d4]"
          @click="collapsed = !collapsed"
        >
          <MenuUnfoldOutlined v-if="collapsed" />
          <MenuFoldOutlined v-else />
        </div>
      </aside>

      <!-- 内容区 - 绢色 -->
      <main class="flex-1 m-3 p-5 bg-[#fefcf8] rounded-xl overflow-auto shadow-[0_1px_3px_rgba(139,76,59,0.06)]">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style>
.sider-menu {
  flex: 1;
  overflow-y: auto;
  border-inline-end: none !important;
  background: transparent !important;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 76, 59, 0.1) transparent;
}
.sider-menu::-webkit-scrollbar {
  width: 4px;
}
.sider-menu::-webkit-scrollbar-track {
  background: transparent;
}
.sider-menu::-webkit-scrollbar-thumb {
  background: rgba(139, 76, 59, 0.1);
  border-radius: 2px;
}
.sider-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 76, 59, 0.2);
}

/* 菜单项 - 墨色文字 */
.sider-menu .ant-menu-item {
  color: #7a6e62 !important;
  margin: 2px 8px !important;
  border-radius: 8px !important;
}
/* hover - 淡朱砂 */
.sider-menu .ant-menu-item:hover:not(.ant-menu-item-selected) {
  background: rgba(139, 76, 59, 0.06) !important;
  color: #8b4c3b !important;
}
/* 选中态 - 朱砂 */
.sider-menu .ant-menu-item-selected {
  background: rgba(139, 76, 59, 0.1) !important;
  color: #8b4c3b !important;
}
.sider-menu .ant-menu-item-selected .anticon {
  color: #8b4c3b !important;
}
</style>
