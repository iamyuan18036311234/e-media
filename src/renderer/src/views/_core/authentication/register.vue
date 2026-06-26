<script lang="ts" setup>
import type { Rule } from 'ant-design-vue/es/form'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Checkbox, Form, FormItem, Input, message } from 'ant-design-vue'
import { $t } from '#/locales'

defineOptions({ name: 'Register' })

const router = useRouter()
const formRef = ref()
const form = reactive({ username: '', mobile: '', password: '', confirm: '' })
const agree = ref(false)

const rules: Record<string, Rule[]> = {
  username: [{ required: true, message: '请输入用户名' }],
  mobile: [{ required: true, message: '请输入手机号' }],
  password: [{ required: true, message: '请输入密码' }],
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
    if (!agree.value) {
      message.warning('请先同意用户协议')
      return
    }
    message.success('注册成功（模拟），请登录')
    router.push('/auth/login')
  } catch {}
}
</script>

<template>
  <div class="register-view">
    <div class="head">
      <h2>{{ $t('page.auth.register') }}</h2>
      <p>创建一个新账号</p>
    </div>
    <Form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <FormItem name="username"
        ><Input v-model:value="form.username" size="large" placeholder="用户名"
      /></FormItem>
      <FormItem name="mobile"
        ><Input v-model:value="form.mobile" size="large" placeholder="手机号"
      /></FormItem>
      <FormItem name="password"
        ><Input.Password v-model:value="form.password" size="large" placeholder="密码"
      /></FormItem>
      <FormItem name="confirm"
        ><Input.Password v-model:value="form.confirm" size="large" placeholder="确认密码"
      /></FormItem>
      <FormItem>
        <Checkbox v-model:checked="agree">我已阅读并同意《用户协议》</Checkbox>
      </FormItem>
      <Button type="primary" size="large" block @click="handleSubmit">注册</Button>
    </Form>
    <div class="back">
      <Button type="link" size="small" @click="router.push('/auth/login')">已有账号？去登录</Button>
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
