import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';
import api from '../../api/client';
import toast from 'react-hot-toast';
import ProtectedRoute from '../../components/ProtectedRoute';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function OrderDetailContent() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleConfirm = async () => {
    setConfirmLoading(true);
    try {
      const { data } = await api.put(`/orders/${id}/confirm`);
      setOrder(data.order);
      toast.success('Order confirmed!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm order.');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelLoading(true);
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);
      setOrder(data.order);
      toast.success('Order cancelled.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-20 text-gray-500">Order not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/orders" className="inline-flex items-center gap-1 text-gray-600 hover:text-indigo-600 mb-4"><FiArrowLeft /> Back to Orders</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order #{order._id.slice(-8).toUpperCase()}</h1>
        {order.status === 'pending' && (
          <div className="flex items-center gap-2">
            <button onClick={handleConfirm} disabled={confirmLoading} className="btn-primary inline-flex items-center gap-2">
              <FiCheck className="w-4 h-4" />{confirmLoading ? 'Confirming...' : 'Confirm Order'}
            </button>
            <button onClick={handleCancel} disabled={cancelLoading} className="btn-secondary inline-flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50">
              <FiX className="w-4 h-4" />{cancelLoading ? 'Cancelling...' : 'Cancel'}
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-3">Shipping Address</h2>
          <p className="text-gray-600">{order.shippingAddress?.street}</p>
          <p className="text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-3">Payment</h2>
          <p className="text-gray-600">Method: {order.payment?.method}</p>
          <p className="text-gray-600">Status: {order.payment?.status}</p>
        </div>
      </div>
      <div className="card mt-6">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Items ({order.items?.length})</h2>
        </div>
        <div className="divide-y">
          {order.items?.map((item, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <img src={item.image || 'https://placehold.co/60x60'} alt="" className="w-16 h-16 object-cover rounded shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.title}</p>
                <p className="text-sm text-gray-500">SKU: {item.variantSku} | Qty: {item.quantity}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-xs px-2 py-1 rounded-full font-medium block mb-1 ${statusColors[item.status] || 'bg-gray-100'}`}>{item.status}</span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-gray-50">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>${order.totals?.subtotal?.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{order.totals?.shipping === 0 ? 'Free' : `$${order.totals?.shipping?.toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>${order.totals?.tax?.toFixed(2)}</span></div>
            <hr />
            <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>${order.totals?.total?.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
      <div className="card mt-6 p-6">
        <h2 className="font-semibold mb-3">Status Timeline</h2>
        {order.items?.map((item, i) => (
          <div key={i} className="mb-4">
            <p className="text-sm font-medium mb-2">{item.title}</p>
            <div className="space-y-2 ml-2">
              {(item.statusHistory?.length > 0 ? item.statusHistory : [{ status: item.status || 'pending', note: null, timestamp: order.createdAt }]).map((entry, j) => (
                <div key={j} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 shrink-0"></div>
                  <div>
                    <p className="font-medium text-sm capitalize">{entry.status}</p>
                    {entry.note && <p className="text-sm text-gray-500">{entry.note}</p>}
                    <p className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrderDetail() {
  return (
    <ProtectedRoute>
      <OrderDetailContent />
    </ProtectedRoute>
  );
}
