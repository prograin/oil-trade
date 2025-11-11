<template>
    <div>
        <NuxtLink to="/maker" class="btn">Make Offers</NuxtLink>
        <NuxtLink to="/published" class="btn">Published Offers</NuxtLink>

        <button v-if="!username" @click="login">Login</button>
        <button v-else @click="logout">Logout</button>
    </div>
</template>

<script setup>
    import { ref,onMounted } from 'vue';
    import { routerKey, useRouter } from 'vue-router';

    const username = ref('')
    const router = useRouter()

    onMounted(()=>{
        username.value = localStorage.getItem('user') || ''
    })

    const login=()=>{
        router.push('/login')
    }

    const logout = () => {
        localStorage.removeItem('user')
        username.value = ''
    }   

</script>

<style scoped>
.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2rem;
}

.btn {
  padding: 0.5rem 1rem;
  background-color: #00dc82;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
}

.btn:hover {
  background-color: #00b96f;
}
</style>