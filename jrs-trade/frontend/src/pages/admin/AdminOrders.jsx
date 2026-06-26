import { useState, useEffect } from 'react';
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

const actionButtons = [
  { status: 'confirmed', label: 'Confirm', color: 'bg-blue-500 hover:bg-blue-600' },
  { status: 'processing', label: 'Process', color: 'bg-indigo-500 hover:bg-indigo-600' },
  { status: 'shipped', label: 'Ship', color: 'bg-purple-500 hover:bg-purple-600' },
  { status: 'delivered', label: 'Deliver', color: 'bg-green-500 hover:bg-green-600' },
  { status: 'cancelled', label: 'Cancel', color: 'bg-red-500 hover:bg-red-600' },
];

function AdminOrdersContent() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.append('status', statusFilter);
      const { data } = await api.get(`/admin/orders?${params}`);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success(`Order ${status}!`);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Orders</h1>
        <select className="input-field w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <p className="font-mono text-sm text-gray-400">#{o._id.slice(-8).toUpperCase()}</p>
                    <p className="font-semibold text-gray-800">{o.user?.name || 'N/A'}</p>
                  </div>
                  <div className="h-8 w-px bg-gray-200 hidden sm:block" />
                  <div className="text-sm text-gray-500">
                    <p>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</p>
                    <p className="font-medium text-gray-700">${o.totals?.total?.toFixed(2)}</p>
                  </div>
                  <div className="h-8 w-px bg-gray-200 hidden sm:block" />
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusColors[o.status]}`}>{o.status}</span>
                  <span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {actionButtons.map((btn) => (
                    <button
                      key={btn.status}
                      onClick={() => updateStatus(o._id, btn.status)}
                      disabled={updating === o._id}
                      className={`${btn.color} text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm`}
                    >
                      {updating === o._id ? '...' : btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button key={page} onClick={() => fetchOrders(page)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${page === pagination.page ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{page}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  return (
    <ProtectedRoute roles={['admin']}>
      <AdminOrdersContent />
    </ProtectedRoute>
  );
}
