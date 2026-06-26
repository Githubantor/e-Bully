import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiBox, FiDollarSign, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

const badge = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function SellerDashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/seller/dashboard');
      setStats(data.stats);
      setRecentOrders(data.recentOrders);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const changeStatus = async (orderId, newStatus) => {
    const order = recentOrders.find(o => o._id === orderId);
    if (!order) return toast.error('Order not found');

    const hasSellerItem = order.items.some(i => String(i.seller) === String(user._id));
    if (!hasSellerItem) return toast.error('Your item not found in this order');

    const oldStatus = order.sellerStatus;

    setRecentOrders(prev => prev.map(o =>
      o._id === orderId ? { ...o, sellerStatus: newStatus } : o
    ));

    try {
      await api.put(`/seller/orders/${orderId}/items`, { status: newStatus });
      toast.success(`Order ${newStatus}!`);
    } catch (error) {
      setRecentOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, sellerStatus: oldStatus } : o
      ));
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Seller Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <FiBox className="w-8 h-8 text-indigo-600 mb-2" />
          <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
          <p className="text-sm text-gray-500">Products</p>
        </div>
        <div className="card p-4">
          <FiPackage className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
          <p className="text-sm text-gray-500">Orders</p>
        </div>
        <div className="card p-4">
          <FiDollarSign className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-2xl font-bold">${(stats?.revenue || 0).toFixed(2)}</p>
          <p className="text-sm text-gray-500">Revenue</p>
        </div>
        <Link to="/seller/analytics" className="card p-4 hover:shadow-md transition-shadow">
          <FiTrendingUp className="w-8 h-8 text-purple-600 mb-2" />
          <p className="text-lg font-bold">Analytics</p>
          <p className="text-sm text-gray-500">View Reports</p>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Recent Orders</h2>
            <div className="flex items-center gap-2">
              <button onClick={fetchDashboard} className="text-gray-400 hover:text-indigo-600" title="Refresh"><FiRefreshCw className="w-4 h-4" /></button>
              <Link to="/seller/orders" className="text-sm text-indigo-600 hover:underline">View All</Link>
            </div>
          </div>
          <div className="divide-y">
            {error ? (
              <div className="p-4 text-center">
                <p className="text-red-500 text-sm mb-2">{error}</p>
                <button onClick={fetchDashboard} className="text-indigo-600 text-sm hover:underline">Try Again</button>
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">No orders yet.</p>
            ) : (
              recentOrders.map((order) => {
                const currentIdx = statusOrder.indexOf(order.sellerStatus);
                const isTerminal = order.sellerStatus === 'delivered' || order.sellerStatus === 'cancelled';

                return (
                  <div key={order._id} className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm gap-2">
                      <span className="text-gray-600 shrink-0">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className="text-gray-500 truncate">{order.user?.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${badge[order.sellerStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {order.sellerStatus || 'pending'}
                      </span>
                      <span className="font-medium shrink-0">${order.totals?.total?.toFixed(2)}</span>
                    </div>
                    {!isTerminal && (
                      <div className="flex flex-wrap gap-1.5">
                        {currentIdx < 1 && (
                          <button onClick={() => changeStatus(order._id, 'confirmed')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium">
                            Confirm
                          </button>
                        )}
                        {currentIdx < 2 && (
                          <button onClick={() => changeStatus(order._id, 'processing')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs font-medium">
                            Process
                          </button>
                        )}
                        {currentIdx < 3 && (
                          <button onClick={() => changeStatus(order._id, 'shipped')} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-medium">
                            Ship
                          </button>
                        )}
                        {currentIdx < 4 && (
                          <button onClick={() => changeStatus(order._id, 'delivered')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium">
                            Deliver
                          </button>
                        )}
                        <button onClick={() => { if (confirm('Cancel this order?')) changeStatus(order._id, 'cancelled'); }} className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1 rounded text-xs font-medium">
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/seller/products/new" className="btn-primary w-full block text-center">Add New Product</Link>
            <Link to="/seller/products" className="btn-secondary w-full block text-center">Manage Products</Link>
            <Link to="/seller/orders" className="btn-secondary w-full block text-center">View All Orders</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SellerDashboard() {
  return (
    <ProtectedRoute roles={['seller', 'admin']}>
      <SellerDashboardContent />
    </ProtectedRoute>
  );
}
