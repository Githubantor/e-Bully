import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../api/client';
import toast from 'react-hot-toast';
import ProtectedRoute from '../../components/ProtectedRoute';

function SellerProductsContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/seller/products');
      setProducts(data.products);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const deleteProduct = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deactivated.');
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Link to="/seller/products/new" className="btn-primary flex items-center gap-2"><FiPlus /> Add Product</Link>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-4">You haven't listed any products yet.</p>
          <Link to="/seller/products/new" className="btn-primary">Add Your First Product</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Stock</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0]?.url || 'https://placehold.co/40x40'} alt="" className="w-10 h-10 object-cover rounded" />
                      <span className="font-medium truncate max-w-[200px]">{p.title}</span>
                    </div>
                  </td>
                  <td className="p-4">${p.variants?.[0]?.price?.toFixed(2) || '0.00'}</td>
                  <td className="p-4">{p.totalStock || 0}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="p-4 text-right">
                    <Link to={`/seller/products/edit/${p._id}`} className="text-indigo-600 hover:text-indigo-800 mr-3"><FiEdit2 className="inline" /></Link>
                    <button onClick={() => deleteProduct(p._id)} className="text-red-500 hover:text-red-700"><FiTrash2 className="inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function SellerProducts() {
  return (
    <ProtectedRoute roles={['seller', 'admin']}>
      <SellerProductsContent />
    </ProtectedRoute>
  );
}
