import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProductStore from '../../store/productStore';
import api from '../../api/client';
import toast from 'react-hot-toast';
import ProtectedRoute from '../../components/ProtectedRoute';
import { FiCopy } from 'react-icons/fi';

const KTM_TEMPLATE = {
  title: 'KTM 390 Duke 2025',
  slug: 'ktm-390-duke',
  description: 'The KTM 390 Duke is a powerful and agile naked street motorcycle, featuring a 373cc single-cylinder engine producing 44 HP, a lightweight trellis frame, WP suspension, and advanced electronics. Perfect for city commuting and weekend canyon carving.',
  brand: 'KTM',
  tags: 'motorcycle, ktm, 390-duke, naked-bike',
  variants: [
    { sku: 'KTM-390-DUKE-BASE', price: '5999', comparePrice: '6999', stock: '10', attributes: { color: 'Orange', model: '390 Duke' } },
    { sku: 'KTM-390-DUKE-PREMIUM', price: '6999', comparePrice: '7999', stock: '5', attributes: { color: 'White', model: '390 Duke', extras: 'Quick Shifter+' } },
  ],
  images: [
    { url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', alt: 'KTM 390 Duke - Front View' },
    { url: 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=800', alt: 'KTM 390 Duke - Side View' },
  ],
  isFeatured: true,
};

function SellerProductFormContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories, fetchCategories } = useProductStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    category: '',
    subcategory: '',
    brand: '',
    tags: '',
    variants: [{ sku: '', price: '', comparePrice: '', stock: '', attributes: {} }],
    images: [],
    isFeatured: false,
  });

  const loadKtmTemplate = () => {
    const bikesCat = categories.find(c => c.slug === 'bikes');
    const motorcyclesCat = bikesCat?.children?.find(c => c.slug === 'motorcycles');
    if (!motorcyclesCat) {
      toast.error('Bikes > Motorcycles category not found. Run the category seed first.');
      return;
    }
    setForm({
      ...KTM_TEMPLATE,
      category: bikesCat._id,
      subcategory: motorcyclesCat._id,
    });
    toast.success('KTM 390 Duke template loaded!');
  };

  useEffect(() => {
    fetchCategories();
    if (id) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/products/${id}`);
          const p = data.product;
          if (p.seller?._id) {
            setForm({
              title: p.title || '',
              slug: p.slug || '',
              description: p.description || '',
              category: p.category?._id || p.category || '',
              subcategory: p.subcategory || '',
              brand: p.brand || '',
              tags: p.tags?.join(', ') || '',
              variants: p.variants?.map(v => ({ ...v, price: v.price?.toString() || '', comparePrice: v.comparePrice?.toString() || '', stock: v.stock?.toString() || '', attributes: v.attributes || {} })) || [{ sku: '', price: '', comparePrice: '', stock: '', attributes: {} }],
              images: p.images || [],
              isFeatured: p.isFeatured || false,
            });
          }
        } catch (error) {
          toast.error('Failed to load product.');
          navigate('/seller/products');
        }
      };
      fetchProduct();
    }
  }, [id, fetchCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      subcategory: form.subcategory || undefined,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      variants: form.variants.map(v => ({
        sku: v.sku,
        price: parseFloat(v.price),
        comparePrice: v.comparePrice ? parseFloat(v.comparePrice) : undefined,
        stock: parseInt(v.stock),
        attributes: v.attributes || {},
      })),
    };
    try {
      if (id) {
        await api.put(`/products/${id}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created!');
      }
      navigate('/seller/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    setForm({ ...form, variants: [...form.variants, { sku: '', price: '', comparePrice: '', stock: '', attributes: {} }] });
  };

  const removeVariant = (i) => {
    if (form.variants.length <= 1) return;
    setForm({ ...form, variants: form.variants.filter((_, idx) => idx !== i) });
  };

  const updateVariant = (i, field, value) => {
    const variants = [...form.variants];
    variants[i] = { ...variants[i], [field]: value };
    setForm({ ...form, variants });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{id ? 'Edit Product' : 'Add New Product'}</h1>
        {!id && (
          <button type="button" onClick={loadKtmTemplate} className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
            <FiCopy /> Load KTM 390 Duke
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input type="text" className="input-field" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input type="text" className="input-field" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="input-field" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <input type="text" className="input-field" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="e.g., electronics, new, sale" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Variants</h2>
            <button type="button" onClick={addVariant} className="btn-secondary text-sm py-1 px-3">+ Add Variant</button>
          </div>
          <div className="space-y-4">
            {form.variants.map((v, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Variant {i + 1}</span>
                  {form.variants.length > 1 && <button type="button" onClick={() => removeVariant(i)} className="text-red-500 text-sm">Remove</button>}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">SKU</label>
                    <input type="text" className="input-field text-sm" value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Price</label>
                    <input type="number" step="0.01" className="input-field text-sm" value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Compare Price</label>
                    <input type="number" step="0.01" className="input-field text-sm" value={v.comparePrice} onChange={(e) => updateVariant(i, 'comparePrice', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Stock</label>
                    <input type="number" className="input-field text-sm" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} required />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Images</h2>
          <div className="flex flex-wrap gap-3 mb-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative w-20 h-20">
                <img src={img.url || img} alt="" className="w-full h-full object-cover rounded" />
                <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs">x</button>
              </div>
            ))}
          </div>
          <input type="text" className="input-field" placeholder="Paste image URL and press Enter" onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.value) {
              e.preventDefault();
              setForm({ ...form, images: [...form.images, { url: e.target.value }] });
              e.target.value = '';
            }
          }} />
        </div>
        <div className="card p-6 flex items-center gap-3">
          <input type="checkbox" id="featured" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="text-indigo-600" />
          <label htmlFor="featured" className="font-medium">Feature this product</label>
        </div>
        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}

export default function SellerProductForm() {
  return (
    <ProtectedRoute roles={['seller', 'admin']}>
      <SellerProductFormContent />
    </ProtectedRoute>
  );
}
