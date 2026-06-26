import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiMinus, FiPlus, FiCheck } from 'react-icons/fi';
import useProductStore from '../../store/productStore';
import useCartStore from '../../store/cartStore';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/StarRating';
import ProductCard from '../../components/ProductCard';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const { product, related, loading, fetchProduct, fetchRelated } = useProductStore();
  const addItem = useCartStore((s) => s.addItem);
  const { user } = useAuth();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });

  useEffect(() => {
    fetchProduct(slug);
    window.scrollTo(0, 0);
  }, [slug, fetchProduct]);

  useEffect(() => {
    if (product) {
      const active = product.variants?.find((v) => v.isActive);
      setSelectedVariant(active || product.variants?.[0]);
      setQuantity(1);
      setSelectedImage(0);
      fetchRelated(product._id);
      loadReviews(product._id);
    }
  }, [product, fetchRelated]);

  const loadReviews = async (productId) => {
    try {
      const { data } = await api.get(`/reviews/product/${productId}`);
      setReviews(data.reviews);
    } catch (err) {}
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please sign in to add items.');
      return;
    }
    if (selectedVariant) {
      addItem(product._id, selectedVariant.sku, quantity);
      toast.success('Added to cart!');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', { productId: product._id, ...reviewForm });
      toast.success('Review submitted!');
      loadReviews(product._id);
      setReviewForm({ rating: 5, title: '', body: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review.');
    }
  };

  if (loading || !product) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const image = product.images?.[selectedImage]?.url || 'https://placehold.co/600x600/e2e8f0/64748b?text=No+Image';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img src={image} alt={product.title} className="w-full h-full object-cover" />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-20 rounded border-2 overflow-hidden ${i === selectedImage ? 'border-indigo-600' : 'border-gray-200'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={product.ratings?.avg} size={5} />
            <span className="text-sm text-gray-500">({product.ratings?.count || 0} reviews)</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-indigo-600">${selectedVariant?.price?.toFixed(2) || '0.00'}</span>
            {selectedVariant?.comparePrice && (
              <span className="text-lg text-gray-400 line-through ml-2">${selectedVariant.comparePrice.toFixed(2)}</span>
            )}
          </div>
          <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>
          {product.variants?.length > 1 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Options</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.filter(v => v.isActive).map((v) => (
                  <button
                    key={v.sku}
                    onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                    className={`px-4 py-2 rounded-lg border text-sm ${selectedVariant?.sku === v.sku ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    {v.attributes ? Object.entries(v.attributes).map(([k, val]) => val).join(' / ') : v.sku}
                    {v.stock <= 0 && ' (Out of Stock)'}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center border rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-100"><FiMinus /></button>
              <span className="px-4 font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-100"><FiPlus /></button>
            </div>
            <button onClick={handleAddToCart} disabled={!selectedVariant || selectedVariant?.stock <= 0} className="btn-primary flex items-center gap-2">
              <FiShoppingCart /> Add to Cart
            </button>
          </div>
          {selectedVariant && (
            <p className={`text-sm mt-2 ${selectedVariant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : 'Out of stock'}
            </p>
          )}
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-6">Reviews ({reviews.length})</h2>
        {user && (
          <form onSubmit={submitReview} className="card p-6 mb-6">
            <h3 className="font-semibold mb-3">Write a Review</h3>
            <div className="mb-3">
              <StarRating rating={reviewForm.rating} size={6} interactive onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
            </div>
            <input type="text" placeholder="Title" className="input-field mb-3" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} />
            <textarea placeholder="Your review..." className="input-field mb-3" rows="4" value={reviewForm.body} onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })} />
            <button type="submit" className="btn-primary">Submit Review</button>
          </form>
        )}
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{review.user?.name || 'Anonymous'}</p>
                  <StarRating rating={review.rating} size={4} />
                </div>
                {review.verifiedPurchase && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1"><FiCheck /> Verified</span>}
              </div>
              {review.title && <p className="font-medium mt-2">{review.title}</p>}
              <p className="text-gray-600 mt-1">{review.body}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-gray-500 text-center py-8">No reviews yet.</p>}
        </div>
      </section>
    </div>
  );
}
