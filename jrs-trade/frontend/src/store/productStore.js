import { create } from 'zustand';
import api from '../api/client';

const useProductStore = create((set) => ({
  products: [],
  product: null,
  featured: [],
  related: [],
  categories: [],
  pagination: null,
  loading: false,
  error: null,

  fetchProducts: async (params = {}) => {
    try {
      set({ loading: true });
      const query = new URLSearchParams(params).toString();
      const { data } = await api.get(`/products?${query}`);
      set({ products: data.products, pagination: data.pagination, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to load products.', loading: false });
    }
  },

  fetchProduct: async (slug) => {
    try {
      set({ loading: true, product: null });
      const { data } = await api.get(`/products/${slug}`);
      set({ product: data.product, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Product not found.', loading: false });
    }
  },

  fetchFeatured: async () => {
    try {
      const { data } = await api.get('/products/featured');
      set({ featured: data.products });
    } catch (error) {
      console.error('Failed to load featured products:', error);
    }
  },

  fetchByCategory: async (slug, params = {}) => {
    try {
      set({ loading: true });
      const query = new URLSearchParams(params).toString();
      const { data } = await api.get(`/products/category/${slug}?${query}`);
      set({ products: data.products, pagination: data.pagination, category: data.category, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to load products.', loading: false });
    }
  },

  fetchRelated: async (id) => {
    try {
      const { data } = await api.get(`/products/related/${id}`);
      set({ related: data.products });
    } catch (error) {
      console.error('Failed to load related products:', error);
    }
  },

  fetchCategories: async () => {
    try {
      const { data } = await api.get('/categories');
      set({ categories: data.categories });
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  },
}));

export default useProductStore;
