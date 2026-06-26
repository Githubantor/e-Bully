import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

function CheckoutContent() {
  const { cart, loading: cartLoading, getSubtotal, fetchCart } = useCartStore();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shippingAddress: { street: '', city: '', state: '', zip: '', country: 'US' },
    paymentMethod: 'cod',
    notes: '',
  });

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setForm(prev => ({
        ...prev,
        shippingAddress: {
          street: defaultAddr.street || '',
          city: defaultAddr.city || '',
          state: defaultAddr.state || '',
          zip: defaultAddr.zip || '',
          country: defaultAddr.country || 'US',
        },
      }));
    }
  }, [user]);

  const items = cart?.items || [];
  if (!cartLoading && items.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = getSubtotal();
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/orders', form);
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.order._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Street Address" className="input-field" value={form.shippingAddress.street} onChange={(e) => setForm({ ...form, shippingAddress: { ...form.shippingAddress, street: e.target.value } })} required />
              <div className="grid grid-cols-3 gap-3">
                <input type="text" placeholder="City" className="input-field" value={form.shippingAddress.city} onChange={(e) => setForm({ ...form, shippingAddress: { ...form.shippingAddress, city: e.target.value } })} required />
                <input type="text" placeholder="State" className="input-field" value={form.shippingAddress.state} onChange={(e) => setForm({ ...form, shippingAddress: { ...form.shippingAddress, state: e.target.value } })} required />
                <input type="text" placeholder="ZIP Code" className="input-field" value={form.shippingAddress.zip} onChange={(e) => setForm({ ...form, shippingAddress: { ...form.shippingAddress, zip: e.target.value } })} required />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
            <div className="space-y-2">
              {[
                { value: 'stripe', label: 'Credit Card (Stripe)' },
                { value: 'paypal', label: 'PayPal' },
                { value: 'cod', label: 'Cash on Delivery' },
              ].map((method) => (
                <label key={method.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="payment" value={method.value} checked={form.paymentMethod === method.value} onChange={() => setForm({ ...form, paymentMethod: method.value })} className="text-indigo-600" />
                  <span>{method.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Order Notes (Optional)</h2>
            <textarea className="input-field" rows="3" placeholder="Special instructions..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary w-full py-3 text-lg" disabled={loading}>
            {loading ? 'Placing Order...' : `Place Order — $${total.toFixed(2)}`}
          </button>
        </form>
        <div className="card p-6 h-fit">
          <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-3 text-sm">
                <img src={item.product?.images?.[0]?.url || ''} alt="" className="w-12 h-12 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <p className="truncate">{item.product?.title}</p>
                  <p className="text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <hr className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
            <hr />
            <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
