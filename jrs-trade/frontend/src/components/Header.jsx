import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser, FiLogOut, FiPackage, FiGrid, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import useCartStore from '../store/cartStore';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            E-Bully
          </Link>
          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-8 hidden md:flex">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </form>
          <div className="flex items-center gap-4">
            <Link to="/products" className="text-gray-600 hover:text-indigo-600 hidden sm:block">
              <FiGrid className="w-5 h-5" />
            </Link>
            <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600">
              <FiShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1 text-gray-600 hover:text-indigo-600"
                >
                  <FiUser className="w-5 h-5" />
                  <span className="hidden sm:block text-sm">{user.name}</span>
                  <FiChevronDown className="w-4 h-4" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <FiPackage className="inline w-4 h-4 mr-2" />Orders
                    </Link>
                    {user.role === 'seller' && (
                      <Link to="/seller" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Seller Dashboard</Link>
                    )}
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Admin Dashboard</Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                      <FiLogOut className="inline w-4 h-4 mr-2" />Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-1.5 px-4">Sign In</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
