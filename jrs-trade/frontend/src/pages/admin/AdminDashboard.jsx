import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiPackage, FiBox, FiDollarSign } from 'react-icons/fi';
import api from '../../api/client';
import ProtectedRoute from '../../components/ProtectedRoute';

function AdminDashboardContent() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <FiUsers className="w-8 h-8 text-indigo-600 mb-2" />
          <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
          <p className="text-sm text-gray-500">Buyers</p>
        </div>
        <div className="card p-4">
          <FiUsers className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-2xl font-bold">{stats?.totalSellers || 0}</p>
          <p className="text-sm text-gray-500">Sellers</p>
        </div>
        <div className="card p-4">
          <FiBox className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
          <p className="text-sm text-gray-500">Products</p>
        </div>
        <div className="card p-4">
          <FiDollarSign className="w-8 h-8 text-purple-600 mb-2" />
          <p className="text-2xl font-bold">${(stats?.totalRevenue || 0).toFixed(2)}</p>
          <p className="text-sm text-gray-500">Revenue</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-indigo-600 hover:underline">View All</Link>
          </div>
          <div className="divide-y">
            {recentOrders.map((order) => (
              <div key={order._id} className="p-3 flex items-center justify-between text-sm">
                <span className="font-mono">#{order._id.slice(-8).toUpperCase()}</span>
                <span>{order.user?.name}</span>
                <span className="font-medium">${order.totals?.total?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/admin/users" className="btn-primary w-full block text-center">Manage Users</Link>
            <Link to="/admin/orders" className="btn-secondary w-full block text-center">Manage Orders</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute roles={['admin']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
