<script lang="ts" setup>
import type { Rule } from 'ant-design-vue/es/form'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Form, FormItem, Input, message } from 'ant-design-vue'
import { $t } from '#/locales'

defineOptions({ name: 'ForgetPassword' })

const router = useRouter()
const formRef = ref()
const form = reactive({ mobile: '', code: '', password: '', confirm: '' })

const rules: Record<string, Rule[]> = {
  mobile: [{ required: true, message: '请输入手机号' }],
  code: [{ required: true, message: '请输入验证码' }],
  password: [{ required: true, message: '请输入新密码' }],
  confirm: [
    { required: true, message: '请确认密码' },
    {
      validator: (_r: any, v: string) =>
        v === form.password ? Promise.resolve() : Promise.reject('两次密码不一致'),
      trigger: 'blur'
    }
  ]
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    message.success('密码已重置（模拟），请使用新密码登录')
    router.push('/auth/login')
  } catch {}
}
</script>

<template>
  <div class="forget-view">
    <div class="head">
      <h2>{{ $t('page.auth.forgetPassword') }}</h2>
      <p>通过手机号重置密码</p>
    </div>
    <Form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <FormItem name="mobile"
        ><Input v-model:value="form.mobile" size="large" placeholder="手机号"
      /></FormItem>
      <FormItem name="code">
        <div style="display: flex; gap: 8px">
          <Input v-model:value="form.code" size="large" placeholder="验证码" style="flex: 1" />
          <Button size="large" @click="message.success('已发送（模拟）')">获取</Button>
        </div>
      </FormItem>
      <FormItem name="password"
        ><Input.Password v-model:value="form.password" size="large" placeholder="新密码"
      /></FormItem>
      <FormItem name="confirm"
        ><Input.Password v-model:value="form.confirm" size="large" placeholder="确认新密码"
      /></FormItem>
      <Button type="primary" size="large" block @click="handleSubmit">重置密码</Button>
    </Form>
    <div class="back">
      <Button type="link" size="small" @click="router.push('/auth/login')">返回登录</Button>
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
  color: rgba(0, 0, 0, 0.45);
}
.back {
  text-align: center;
  margin-top: 16px;
}
</style>
