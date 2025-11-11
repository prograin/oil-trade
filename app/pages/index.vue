<template>
    <section class="home-page">
        <ActionButtons/>
    </section>
</template>

<script setup>
    import ActionButtons from '~/components/ActionButtons.vue';
</script>

<style scoped>
.home-page {
  text-align: center;
}
</style>


<!-- No need for manual routing; index.vue is / -->