
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { goodsApi, categoriesApi } from '@/api/supabaseApi'

export const useGoodsStore = defineStore('goods', () => {
  const goodsList = ref([])
  const categoriesList = ref([])
  const loading = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  const selectedCategoryId = ref('all')
  const searchKeyword = ref('')

  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.getCategories()
      if (res.success) {
        categoriesList.value = res.data.filter(c => c.status === 'active')
      }
    } catch (error) {
      console.error('获取分类列表失败:', error)
    }
  }

  const fetchGoods = async (page = 1) => {
    loading.value = true
    try {
      const params = { page, limit: 20 }
      if (selectedCategoryId.value && selectedCategoryId.value !== 'all') {
        params.categoryId = selectedCategoryId.value
      }
      if (searchKeyword.value) {
        params.search = searchKeyword.value
      }
      const res = await goodsApi.getGoods(params)
      if (res.success) {
        goodsList.value = res.data
        total.value = res.total
        currentPage.value = page
      }
    } catch (error) {
      console.error('获取商品列表失败:', error)
      goodsList.value = []
    } finally {
      loading.value = false
    }
  }

  const getGoodsById = async (id) => {
    try {
      const res = await goodsApi.getGoodsById(id)
      if (res.success) {
        return res.data
      }
      return null
    } catch (error) {
      console.error('获取商品详情失败:', error)
      return null
    }
  }

  const setCategory = (categoryId) => {
    selectedCategoryId.value = categoryId
    goodsList.value = []
    fetchGoods(1)
  }

  const setSearchKeyword = (keyword) => {
    searchKeyword.value = keyword
    goodsList.value = []
    fetchGoods(1)
  }

  return {
    goodsList,
    categoriesList,
    loading,
    total,
    currentPage,
    selectedCategoryId,
    searchKeyword,
    fetchCategories,
    fetchGoods,
    getGoodsById,
    setCategory,
    setSearchKeyword
  }
})
