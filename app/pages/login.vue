<script setup>
import { ref, reactive } from 'vue'
import zod from 'zod'

const schema = zod.object({
  email: zod.string().email('Invalid email address'),
  password: zod.string().min(8, 'Password must be at least 8 characters'),
})

const data = reactive({ email: '', password: '' })
const errors = ref({})
const formError = ref('')

const onLogin = async () => {
  const result = schema.safeParse(data)
  if (!result.success) {
    errors.value = result.error.flatten((issue) => issue.message).fieldErrors
    return
  }
  errors.value = {}

  try {
    const res = await $fetch('/api/auth/login', { method: 'POST', body: result.data })
    if (res.ok) {
      return navigateTo('/dashboard')
    }
  } catch (error) {
    const msg = error?.data?.message || 'Login failed. Please try again.'
    formError.value = msg
  }
}
</script>

<template>
  <main>
    <form class="login-container" @submit.prevent="onLogin">
      <h2>Login to Oil Market</h2>
      <div class="space-y-4">
        <div class="login-field">
          <label for="email">Email</label>
          <input v-model="data.email" type="email" id="email" placeholder="you@example.com" />
          <label v-if="errors.email?.[0]" class="text-red-400 text-sm mb-1">
            {{ errors.email[0] }}
          </label>
        </div>
        <div class="login-field">
          <label for="password">Password</label>
          <input v-model="data.password" type="password" id="password" placeholder="********" />
          <label v-if="errors.password?.[0]" class="text-red-400 text-sm mb-1">
            {{ errors.password[0] }}
          </label>
        </div>
        <p v-if="formError" class="text-red-400 text-sm">
          {{ formError }}
        </p>
        <button type="submit" class="login-button">Login</button>
      </div>
      <p>Don't have an account? <NuxtLink to="/" id="login-sign-up-btn">Sign Up</NuxtLink></p>
    </form>
  </main>
</template>

<style scoped>
@reference "tailwindcss";

main {
  @apply flex-1 flex justify-center items-center;
}

.login-container {
  @apply w-full max-w-md self-center bg-gray-800 p-8 rounded shadow-lg m-6 sm:m-3;
}

.login-container > h2 {
  @apply text-2xl font-bold text-yellow-400 mb-6 text-center;
}

.login-field > label {
  @apply block mb-1;
}
.login-field > input {
  @apply w-full border border-gray-700 rounded px-3 py-2 bg-gray-900 text-gray-100 focus:border-yellow-400 focus:ring focus:ring-yellow-400/30;
}

.login-button {
  @apply w-full bg-yellow-400 text-black font-bold py-2 hover:bg-yellow-500 active:bg-yellow-600 active:scale-95 transition;
}

.login-container > p {
  @apply mt-4 text-gray-400 text-center text-sm;
}
#login-sign-up-btn {
  @apply text-yellow-400 hover:underline;
}
</style>
