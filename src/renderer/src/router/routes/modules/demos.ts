import type { RouteRecordRaw } from 'vue-router'

import { BasicLayout } from '#/layouts'
import { $t } from '#/locales'

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:info',
      order: 9999,
      title: $t('demos.title')
    },
    name: 'Demos',
    path: '/demos',
    children: [
      {
        name: 'About',
        path: '/demos/about',
        component: () => import('#/views/_core/about/index.vue'),
        meta: {
          icon: 'lucide:copyright',
          title: $t('demos.vben.about')
        }
      },
      {
        name: 'DemosAntd',
        path: '/demos/antd',
        component: () => import('#/views/demos/antd/index.vue'),
        meta: {
          icon: 'lucide:component',
          title: $t('demos.antd')
        }
      }
    ]
  }
]

export default routes
