<script setup>
    import { useRouter } from 'vue-router';
    const router = useRouter()

    const onLoginClicked=()=>{router.push("/dashboard")}
    
    
</script>

<template>
    <div class="login-container">
        <h2>Login to Oil Market</h2>
        <div class="space-y-4">
            <div class="login-field">
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="you@example.com"/>
            </div>
            <div class="login-field">
                <label for="password">Password</label>
                <input type="password" id="password" placeholder="********"/>
            </div>
            <button class="login-button" v-on:click="onLoginClicked">
                Login
            </button>
        </div>
        <p>
            Don't have an account? <NuxtLink to="/" id="login-sign-up-btn">Sign Up</NuxtLink>
        </p>
    </div>
</template>


<style scoped>
@reference "tailwindcss";

.login-container {
    @apply w-full max-w-md self-center bg-gray-800 p-8 rounded shadow-lg
}

.login-container > h2 {
    @apply text-2xl font-bold text-yellow-400 mb-6 text-center
}

.login-field > label {
    @apply block mb-1
} 
.login-field > input {
    @apply w-full border border-gray-700 rounded px-3 py-2 bg-gray-900 text-gray-100 focus:border-yellow-400 focus:ring focus:ring-yellow-400/30
} 

.login-button {
    @apply w-full bg-yellow-400 text-black font-bold py-2 hover:bg-yellow-500 transition
}

.login-container > p {
    @apply mt-4 text-gray-400 text-center text-sm
}
#login-sign-up-btn{
    @apply text-yellow-400 hover:underline
}

</style>