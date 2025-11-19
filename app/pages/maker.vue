<template>
  <section class="offer-page">
    <h2 class="offer-page__title">Explore And Edit Oil Cargo Offers</h2>
    <p v-if="username">Welcome, {{ username }}</p>

    <OfferTable class="mb-6" />

    <div class="offer-page__actions">
      <button>Publish Offer</button>
      <NuxtLink class="btn" to="/published">View Published Offer</NuxtLink>
    </div>
  </section>
</template>

<script lang="ts" setup>
  import { ref,onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter()
  

  const username = ref('')

  onMounted(()=>{
    const user = localStorage.getItem("user") || 'guest'
    if (!user){
      router.push("/login")
    }else{
      username.value = user
    }
  })

  const publishOffer = () => {
  alert('Offer published!') // Replace with API call
  } 
</script>