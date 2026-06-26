import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: null,
      loading: false,
      error: null,

      fetchCart: async () => {
        try {
          set({ loading: true });
          const { data } = await api.get('/cart');
          set({ cart: data.cart, loading: false });
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to load cart.', loading: false });
        }
      },

      addItem: async (productId, variantSku, quantity = 1) => {
        try {
          set({ loading: true });
          const { data } = await api.post('/cart/items', { productId, variantSku, quantity });
          set({ cart: data.cart, loading: false });
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to add item.', loading: false });
        }
      },

      updateItem: async (itemId, quantity) => {
        try {
          set({ loading: true });
          const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
          set({ cart: data.cart, loading: false });
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to update item.', loading: false });
        }
      },

      removeItem: async (itemId) => {
        try {
          set({ loading: true });
          const { data } = await api.delete(`/cart/items/${itemId}`);
          set({ cart: data.cart, loading: false });
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to remove item.', loading: false });
        }
      },

      clearCart: async () => {
        try {
          set({ loading: true });
          await api.delete('/cart');
          set({ cart: { items: [] }, loading: false });
        } catch (error) {
          set({ error: error.response?.data?.message || 'Failed to clear cart.', loading: false });
        }
      },

      getItemCount: () => {
        const { cart } = get();
        if (!cart?.items) return 0;
        return cart.items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        const { cart } = get();
        if (!cart?.items) return 0;
        return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'jrs-cart-storage',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);

export default useCartStore;
