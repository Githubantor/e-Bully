import { useState, useEffect } from 'react';
import { FiTrendingUp, FiBox, FiDollarSign } from 'react-icons/fi';
import api from '../../api/client';
import ProtectedRoute from '../../components/ProtectedRoute';

function SellerAnalyticsContent() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const { data: result } = await api.get(`/seller/analytics?period=${period}`);
        setData(result);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [period]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <select className="input-field w-auto" value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Sales Over Time</h2>
            {data?.salesByDay?.length > 0 ? (
              <div className="space-y-2">
                {data.salesByDay.map((day) => (
                  <div key={day._id} className="flex items-center justify-between text-sm">
                    <span>{day._id}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">{day.orders?.length || 0} orders</span>
                      <span className="font-medium w-24 text-right">${day.sales.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500">No sales data for this period.</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="font-semibold mb-4">Top Selling Products</h2>
              {data?.topProducts?.length > 0 ? (
                <div className="space-y-3">
                  {data.topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 w-5">{i + 1}.</span>
                        <span className="truncate max-w-[200px]">{p.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{p.quantity} sold</span>
                        <span className="font-medium w-20 text-right">${p.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500">No sales yet.</p>}
            </div>
            <div className="card p-6">
              <h2 className="font-semibold mb-4">Category Breakdown</h2>
              {data?.categoryBreakdown?.length > 0 ? (
                <div className="space-y-3">
                  {data.categoryBreakdown.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>Category {cat._id?.toString().slice(-6) || 'Unknown'}</span>
                      <span className="font-medium">{cat.count} products</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500">No categories.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SellerAnalytics() {
  return (
    <ProtectedRoute roles={['seller', 'admin']}>
      <SellerAnalyticsContent />
    </ProtectedRoute>
  );
}
