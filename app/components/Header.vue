<template>
    <header >
        <h1 class="site-header__title">Oil Cargo Offers</h1>
    </header>
</template>

<script setup>
    import { ref,onMounted } from 'vue';
    const username = ref('')

    onMounted(()=>{
        username.value=localStorage.getItem('user') ||''
    })
</script>

<style scoped>

</style>