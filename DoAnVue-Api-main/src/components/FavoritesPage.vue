<template>
  <Header />
  <div class="favoritesPage">
    <div class="back">
      <router-link to="/product">
        <i class="fa-solid fa-caret-left"></i>BACK
      </router-link>
    </div>

    <h2>Sản phẩm yêu thích</h2>

    <p v-if="favoriteItems.length === 0">
      Bạn chưa có sản phẩm yêu thích nào.
    </p>

    <div v-else class="favorite-list">
      <div
          v-for="item in favoriteItems"
          :key="item.id"
          class="favorite-item"
          @click="goToProduct(item.productId)"
      >
        <img
            :src="item.image"
            :alt="item.name"
            class="item-image"
        />

        <div class="item-details">
          <h3>{{ item.name }}</h3>
          <p class="item-price">{{ formatPrice(item.price) }}</p>
        </div>

        <button
            class="delete-btn"
            @click.stop="removeFromFavorites(item.productId)"
        >
          Xóa
        </button>
      </div>
    </div>
  </div>
  <Foot />
</template>

<script setup>
import { useFavoritesStore } from '../stores/favoritesStore'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Foot from "@/components/Foot.vue";
import Header from "@/components/AppHeader.vue";

const favoritesStore = useFavoritesStore()
const { favoriteItems } = storeToRefs(favoritesStore)
const router = useRouter()

onMounted(() => {
  favoritesStore.fetchFavorites()
})

const removeFromFavorites = (productId) => {
  favoritesStore.removeFavorite(productId)
}

const formatPrice = (price) => {
  if (price == null) return '$0.00'
  return `$${Number(price).toFixed(2)}`
}

const goToProduct = (productId) => {
  router.push(`/product/${productId}`)

}
</script>

<style scoped>
.back a {
  color: black;
  font-weight: bold;
}

h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

p {
  text-align: center;
  color: #666;
  font-style: italic;
}

.favorite-list {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.favorite-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border: 1px solid #eee;
  border-radius: 10px;
  background-color: #fafafa;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: all 0.25s ease;
  cursor: pointer;
}

.favorite-item:hover {
  background-color: #fff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

.item-image {
  width: 110px;
  height: 110px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.item-details {
  flex-grow: 1;
  margin-left: 20px;
  text-align: left;
}

.item-details h3 {
  margin: 0 0 6px;
  font-size: 1.1rem;
}

.item-price {
  margin: 0;
  font-weight: bold;
  color: #111;
}

.delete-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background-color: #ff4d4f;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.delete-btn:hover {
  background-color: #cf1322;
}
</style>
