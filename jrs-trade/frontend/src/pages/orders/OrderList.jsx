import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import api from '../../api/client';
import ProtectedRoute from '../../components/ProtectedRoute';

const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

function getOverallStatus(items) {
  const active = items.filter(i => i.status !== 'cancelled');
  if (active.length === 0) return 'cancelled';
  let minIdx = Infinity;
  for (const item of active) {
    const idx = statusOrder.indexOf(item.status);
    if (idx < minIdx) minIdx = idx;
  }
  return statusOrder[minIdx] || 'pending';
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function OrderListContent() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await api.get(`/orders?${params}`);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <select className="input-field w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Orders</option>
          {statusOrder.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <FiPackage className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No orders found.</p>
          <Link to="/products" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium mt-4">Start Shopping</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => {
              const overallStatus = getOverallStatus(order.items);
              return (
                <Link key={order._id} to={`/orders/${order._id}`} className="card p-4 block hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">Order #{order._id.slice(-8).toUpperCase()}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[overallStatus] || 'bg-gray-100'}`}>{overallStatus}</span>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <img src={item.image || 'https://placehold.co/40x40'} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[item.status] || 'bg-gray-100'}`}>{item.status}</span>
                        <span className="text-sm font-semibold text-indigo-600 shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t text-right font-semibold text-indigo-600">Total: ${order.totals?.total?.toFixed(2)}</div>
                </Link>
              );
            })}
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => fetchOrders(page)} className={`px-3 py-1 rounded ${page === pagination.page ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{page}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function OrderList() {
  return (
    <ProtectedRoute>
      <OrderListContent />
    </ProtectedRoute>
  );
}
