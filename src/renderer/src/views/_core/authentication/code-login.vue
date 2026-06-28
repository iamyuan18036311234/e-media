<script lang="ts" setup>
import type { Rule } from 'ant-design-vue/es/form'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { MobileOutlined } from '@ant-design/icons-vue'
import { Button, Form, FormItem, Input, message } from 'ant-design-vue'
import { $t } from '#/locales'

defineOptions({ name: 'CodeLogin' })

const router = useRouter()
const form = reactive({ mobile: '', code: '' })
const formRef = ref()
const countdown = ref(0)

const rules: Record<string, Rule[]> = {
  mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

function sendCode() {
  if (!/^1\d{10}$/.test(form.mobile)) {
    message.warning('请输入正确的手机号')
    return
  }
  countdown.value = 60
  const t = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(t)
  }, 1000)
  message.success('验证码已发送（模拟）')
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    message.info('验证码登录为模拟功能，请使用账号密码登录')
    router.push('/auth/login')
  } catch {}
}
</script>

<template>
  <div class="code-login-view">
    <div class="head">
      <h2>{{ $t('page.auth.codeLogin') }}</h2>
      <p>输入手机号接收验证码</p>
    </div>
    <Form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <FormItem name="mobile">
        <Input v-model:value="form.mobile" size="large" placeholder="手机号">
          <template #prefix><MobileOutlined /></template>
        </Input>
      </FormItem>
      <FormItem name="code">
        <div class="code-row">
          <Input v-model:value="form.code" size="large" placeholder="验证码" />
          <Button size="large" :disabled="countdown > 0" @click="sendCode">
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </Button>
        </div>
      </FormItem>
      <Button type="primary" size="large" block @click="handleSubmit">登录</Button>
    </Form>
    <div class="back">
      <Button type="link" size="small" @click="router.push('/auth/login')"> 返回账号登录 </Button>
    </div>
  </div>
</template>

<style scoped>
.head {
  text-align: center;
  margin-bottom: 24px;
}
.head h2 {
  font-size: 22px;
  margin-bottom: 6px;
}
.head p {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}
.code-row {
  display: flex;
  gap: 8px;
}
.code-row > :first-child {
  flex: 1;
}
.back {
  text-align: center;
  margin-top: 16px;
}
</style>
