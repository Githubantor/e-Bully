import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import useProductStore from '../store/productStore';
import ProductCard from '../components/ProductCard';
import { CategorySkeleton, ProductCardSkeleton } from '../components/ui/Skeleton';

export default function Home() {
  const { featured, categories, fetchFeatured, fetchCategories, loading } = useProductStore();

  useEffect(() => {
    fetchFeatured();
    fetchCategories();
  }, [fetchFeatured, fetchCategories]);

  return (
    <div>
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to E-Bully</h1>
            <p className="text-lg text-indigo-100 mb-8">Discover amazing products at unbeatable prices. Shop from trusted sellers worldwide.</p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
              Shop Now <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.length === 0
            ? Array.from({ length: 6 }).map((_, i) => <CategorySkeleton key={i} />)
            : categories.filter(c => !c.parent).map((cat) => (
              <Link
                key={cat._id}
                to={`/category/${cat.slug}`}
                className="card p-6 text-center hover:shadow-md hover:border-indigo-300 transition-all"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-600 font-bold text-lg">{cat.name[0]}</span>
                </div>
                <span className="font-medium text-gray-800">{cat.name}</span>
              </Link>
            ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link to="/products" className="text-indigo-600 hover:text-indigo-800 font-medium">View All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
        </div>
      </section>
    </div>
  );
}
