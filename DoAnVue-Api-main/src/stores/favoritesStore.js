import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE = 'http://localhost:8082/api/favorites'
const USER_ID = '1'

export const useFavoritesStore = defineStore('favorites', {
    state: () => ({
        favoriteItems: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchFavorites() {
            this.loading = true
            this.error = null
            try {
                console.log('[Favorites] GET', `${API_BASE}/${USER_ID}`)
                const res = await axios.get(`${API_BASE}/${USER_ID}`)

                this.favoriteItems = Array.isArray(res.data) ? res.data : []

                console.log('[Favorites] items =', this.favoriteItems)
            } catch (err) {
                console.error('[Favorites] fetchFavorites error:', err)
                this.error = 'Không tải được danh sách yêu thích'
                this.favoriteItems = []
            } finally {
                this.loading = false
            }
        },

        async addFavorite(product) {
            if (!product?.id) return
            this.error = null
            try {
                await axios.post(
                    `${API_BASE}/${USER_ID}`,
                    null,
                    { params: { productId: product.id } }
                )
                await this.fetchFavorites()
            } catch (err) {
                console.error('[Favorites] addFavorite error:', err)
                this.error = 'Không thêm được vào yêu thích'
            }
        },

        async removeFavorite(productId) {
            if (!productId) return
            this.error = null
            try {
                await axios.delete(
                    `${API_BASE}/${USER_ID}`,
                    { params: { productId } }
                )
                this.favoriteItems = this.favoriteItems.filter(
                    item => item.productId !== productId
                )
            } catch (err) {
                console.error('[Favorites] removeFavorite error:', err)
                this.error = 'Không xoá được khỏi yêu thích'
            }
        },

        isFavorite(productId) {
            return this.favoriteItems.some(item => item.productId === productId)
        },

        async toggleFavorite(product) {
            if (!product?.id) return
            if (this.isFavorite(product.id)) {
                await this.removeFavorite(product.id)
            } else {
                await this.addFavorite(product)
            }
        }
    }
})
