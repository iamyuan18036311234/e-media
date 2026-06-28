<script lang="ts" setup>
import type { Rule } from 'ant-design-vue/es/form'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LockOutlined, UserOutlined } from '@ant-design/icons-vue'
import {
  Button,
  Checkbox,
  Divider,
  Form,
  FormItem,
  Input,
  InputPassword,
  message
} from 'ant-design-vue'
import { storeToRefs } from 'pinia'
import { $t } from '#/locales'
import { useAuthStore } from '#/store/auth'

defineOptions({ name: 'Login' })

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { loginLoading } = storeToRefs(authStore)

interface LoginForm {
  password: string
  username: string
}

const form = reactive<LoginForm>({
  password: '123456',
  username: 'admin'
})

const rules: Record<string, Rule[]> = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const formRef = ref()
const rememberMe = ref(true)

/** 登录 */
async function handleLogin() {
  try {
    await formRef.value?.validate()
    const redirect = (route.query.redirect as string) || ''
    const onSuccess = async () => {
      if (redirect) {
        await router.replace(decodeURIComponent(redirect))
      } else {
        await router.push('/')
      }
    }
    await authStore.authLogin({ ...form }, onSuccess)
  } catch (err: any) {
    if (err?.errorFields) return // 表单校验失败
    message.error(err?.message || '登录失败')
  }
}
</script>

<template>
  <div class="login-view">
    <div class="login-head">
      <h2 class="login-title">{{ $t('page.auth.login') }}</h2>
      <p class="login-sub">欢迎回来，请输入账号密码登录</p>
    </div>

    <Form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <FormItem name="username">
        <Input v-model:value="form.username" size="large" :placeholder="$t('page.auth.login')" allow-clear>
          <template #prefix>
            <UserOutlined />
          </template>
        </Input>
      </FormItem>

      <FormItem name="password">
        <InputPassword v-model:value="form.password" size="large" placeholder="密码" allow-clear>
          <template #prefix>
            <LockOutlined />
          </template>
        </InputPassword>
      </FormItem>

      <div class="login-options">
        <Checkbox v-model:checked="rememberMe">记住我</Checkbox>
        <Button type="link" size="small" @click="router.push('/auth/forget-password')">
          {{ $t('page.auth.forgetPassword') }}
        </Button>
      </div>

      <Button type="primary" size="large" block :loading="loginLoading" @click="handleLogin">
        {{ $t('page.auth.login') }}
      </Button>
    </Form>

    <Divider>其他登录方式</Divider>

    <div class="login-other">
      <Button block size="large" @click="router.push('/auth/code-login')">
        {{ $t('page.auth.codeLogin') }}
      </Button>
      <Button block size="large" @click="router.push('/auth/qrcode-login')">
        {{ $t('page.auth.qrcodeLogin') }}
      </Button>
    </div>

    <div class="login-tip">
      还没有账号？
      <Button type="link" size="small" @click="router.push('/auth/register')">
        {{ $t('page.auth.register') }}
      </Button>
    </div>

    <div class="login-mock-tip">模拟账号：admin / 123456（VITE_USE_MOCK=true）</div>
  </div>
</template>

<style scoped>
.login-view {
  width: 100%;
}

.login-head {
  margin-bottom: 28px;
  text-align: center;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.login-sub {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.login-other {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.login-tip {
  text-align: center;
  font-size: 13px;
  margin-top: 20px;
  color: hsl(var(--muted-foreground));
}

.login-mock-tip {
  text-align: center;
  font-size: 12px;
  margin-top: 12px;
  color: rgba(22, 119, 255, 0.7);
}
</style>
