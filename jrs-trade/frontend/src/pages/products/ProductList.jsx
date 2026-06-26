import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import useProductStore from '../../store/productStore';
import ProductCard from '../../components/ProductCard';
import { ProductCardSkeleton } from '../../components/ui/Skeleton';

export default function ProductList() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, category, categories, pagination, loading, fetchProducts, fetchByCategory, fetchCategories } = useProductStore();
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (slug) {
      const params = {};
      if (sort) params.sort = sort;
      params.page = searchParams.get('page') || '1';
      fetchByCategory(slug, params);
    } else {
      const params = {};
      const q = searchParams.get('q');
      const cat = searchParams.get('category');
      if (q) params.search = q;
      if (cat) params.category = cat;
      if (sort) params.sort = sort;
      params.page = searchParams.get('page') || '1';
      fetchProducts(params);
    }
  }, [slug, searchParams, sort, fetchProducts, fetchByCategory]);

  const updateParams = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <div className="card p-4 space-y-4 md:sticky md:top-20 md:max-h-[calc(100vh-6rem)] md:overflow-y-auto">
            <div>
              <h3 className="font-semibold mb-2">Categories</h3>
              <div className="space-y-1">
                <button onClick={() => updateParams('category', '')} className={`block w-full text-left text-sm px-2 py-1 rounded ${!searchParams.get('category') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>All</button>
                {categories.map((cat) => (
                  <button key={cat._id} onClick={() => updateParams('category', cat._id)} className={`block w-full text-left text-sm px-2 py-1 rounded ${searchParams.get('category') === cat._id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>{cat.name}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Sort By</h3>
              <select className="input-field text-sm" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </aside>
        <div className="flex-1">
          {slug && category && (
            <h1 className="text-xl font-semibold mb-4">{category.name}</h1>
          )}
          {searchParams.get('q') && (
            <h1 className="text-xl font-semibold mb-4">Search results for "{searchParams.get('q')}"</h1>
          )}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No products found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => updateParams('page', page.toString())}
                      className={`px-3 py-1 rounded ${page === pagination.page ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
