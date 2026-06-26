import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import useCartStore from '../../store/cartStore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import ProtectedRoute from '../../components/ProtectedRoute';

function CartContent() {
  const { cart, loading, fetchCart, updateItem, removeItem, clearCart, getSubtotal } = useCartStore();
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  if (loading && !cart) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <FiShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2"><FiArrowLeft /> Start Shopping</Link>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <button onClick={clearCart} className="text-red-500 text-sm hover:underline">Clear Cart</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="card p-4 flex items-center gap-4">
              <img
                src={item.product?.images?.[0]?.url || 'https://placehold.co/100x100/e2e8f0/64748b?text=N'}
                alt={item.product?.title}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product?.slug}`} className="font-medium text-gray-900 hover:text-indigo-600 truncate block">
                  {item.product?.title || 'Product'}
                </Link>
                <p className="text-sm text-gray-500">SKU: {item.variantSku}</p>
                <p className="text-indigo-600 font-semibold mt-1">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded">
                  <button onClick={() => updateItem(item._id, Math.max(1, item.quantity - 1))} className="p-1.5 hover:bg-gray-100"><FiMinus className="w-3 h-3" /></button>
                  <span className="px-3 text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateItem(item._id, item.quantity + 1)} className="p-1.5 hover:bg-gray-100"><FiPlus className="w-3 h-3" /></button>
                </div>
                <button onClick={() => { removeItem(item._id); toast.success('Item removed.'); }} className="p-2 text-gray-400 hover:text-red-500">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="card p-6 h-fit">
          <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
            {subtotal < 100 && <p className="text-xs text-gray-500">Free shipping on orders over $100</p>}
            <hr />
            <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
          <Link to="/checkout" className="btn-primary w-full text-center mt-6 block">Proceed to Checkout</Link>
          <Link to="/products" className="btn-secondary w-full text-center mt-2 block">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}
