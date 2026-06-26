import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

const badge = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function SellerOrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/seller/orders');
        setOrders(data.orders || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const changeStatus = async (orderId, newStatus) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) return toast.error('Order not found');

    const hasSellerItem = order.items.some(i => String(i.seller) === String(user._id));
    if (!hasSellerItem) return toast.error('Your item not found in this order');

    const oldStatus = order.sellerStatus;

    setOrders(prev => prev.map(o =>
      o._id === orderId ? { ...o, sellerStatus: newStatus } : o
    ));

    try {
      await api.put(`/seller/orders/${orderId}/items`, { status: newStatus });
    } catch (error) {
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, sellerStatus: oldStatus } : o
      ));
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">No orders found</p>
          <p className="text-sm">Orders will appear here once customers purchase your products.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const currentIdx = statusOrder.indexOf(order.sellerStatus);
            const isTerminal = order.sellerStatus === 'delivered' || order.sellerStatus === 'cancelled';

            return (
              <div key={order._id} className="card p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-mono text-sm text-gray-500">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s) · ${order.totals?.total?.toFixed(2)}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${badge[order.sellerStatus] || 'bg-gray-100'}`}>
                    {order.sellerStatus || 'pending'}
                  </span>
                </div>

                {isTerminal ? (
                  <p className="text-sm text-gray-400 italic">
                    {order.sellerStatus === 'delivered' ? 'Completed' : 'Cancelled'}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentIdx < 1 && (
                      <button onClick={() => changeStatus(order._id, 'confirmed')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
                        Confirm Order
                      </button>
                    )}
                    {currentIdx < 2 && (
                      <button onClick={() => changeStatus(order._id, 'processing')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
                        Mark Processing
                      </button>
                    )}
                    {currentIdx < 3 && (
                      <button onClick={() => changeStatus(order._id, 'shipped')} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
                        Mark Shipped
                      </button>
                    )}
                    {currentIdx < 4 && (
                      <button onClick={() => changeStatus(order._id, 'delivered')} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
                        Mark Delivered
                      </button>
                    )}
                    <button onClick={() => { if (confirm('Cancel this order?')) changeStatus(order._id, 'cancelled'); }} className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-5 py-2 rounded-lg text-sm font-medium">
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SellerOrders() {
  return (
    <ProtectedRoute roles={['seller', 'admin']}>
      <SellerOrdersContent />
    </ProtectedRoute>
  );
}
