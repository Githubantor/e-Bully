import { Link } from 'react-router-dom';
import { FiStar, FiShoppingCart } from 'react-icons/fi';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const { user } = useAuth();
  const minPrice = product.minPrice || product.variants?.[0]?.price || 0;
  const image = product.images?.[0]?.url || 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image';

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to add items to cart.');
      return;
    }
    const variant = product.variants?.find((v) => v.isActive);
    if (variant) {
      addItem(product._id, variant.sku);
      toast.success('Added to cart!');
    }
  };

  return (
    <Link to={`/products/${product.slug}`} className="card group hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <img
          src={image}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.isFeatured && (
          <span className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">Featured</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{product.title}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-1 mt-2">
          <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium">{product.ratings?.avg?.toFixed(1) || '0.0'}</span>
          <span className="text-sm text-gray-500">({product.ratings?.count || 0})</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-indigo-600">${minPrice.toFixed(2)}</span>
          <button onClick={handleAddToCart} className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
            <FiShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
}
