import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AiOutlineHeart,
  AiOutlineSearch,
  AiOutlineShoppingCart,
} from 'react-icons/ai';
import { CgProfile } from 'react-icons/cg';
import { IoIosArrowDown } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { backend_url } from '../../server';
import { navItems } from '../../static/data';
import appConfig from '../../config/appConfig';
import Cart from '../cart/Cart';
import Wishlist from '../Wishlist/Wishlist';
import ThemeToggle from './ThemeToggle';
import { Avatar } from '@material-ui/core';

/* ------------------ Debounce Hook ------------------ */
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

const Brand = () => (
  <Link to='/' className='flex items-center shrink-0'>
    {appConfig.logoUrl ? (
      <img
        src={appConfig.logoUrl}
        alt={appConfig.name}
        className='h-8 w-auto object-contain'
      />
    ) : (
      <span className='text-xl font-bold text-orange-500'>{appConfig.name}</span>
    )}
  </Link>
);

const Header = () => {
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { allProducts } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.storefront);

  const [openCart, setOpenCart] = useState(false);
  const [openWishlist, setOpenWishlist] = useState(false);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  const [results, setResults] = useState([]);
  const [selectedCat, setSelectedCat] = useState('All');
  const [catOpen, setCatOpen] = useState(false);

  /* ---------------- Smart Filtering ---------------- */
  const filteredProducts = useMemo(() => {
    let filtered = allProducts || [];

    if (selectedCat !== 'All') {
      filtered = filtered.filter(
        (p) => p.category?.toLowerCase() === selectedCat.toLowerCase()
      );
    }

    if (debouncedSearch) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    return filtered;
  }, [allProducts, selectedCat, debouncedSearch]);

  useEffect(() => {
    setResults(filteredProducts);
  }, [filteredProducts]);

  const pickCategory = (name) => {
    setSelectedCat(name);
    setCatOpen(false);
    navigate(
      name === 'All'
        ? '/products'
        : `/products?category=${encodeURIComponent(name)}`
    );
  };

  const catList = ['All', ...(categories || []).map((c) => c.name)];

  return (
    <>
      {/* HEADER */}
      <header className='sticky top-0 left-0 z-[999] w-full bg-surface text-content border-b border-border shadow-sm'>
        {/* TOP BAR */}
        <div className='max-w-7xl mx-auto px-3 py-3 flex items-center justify-between gap-4'>
          {/* LOGO (hidden on the smallest screens to give search room) */}
          <div className='hidden sm:flex'>
            <Brand />
          </div>

          {/* SEARCH */}
          <div className='flex-1 relative flex items-stretch h-[42px] border border-border rounded-md overflow-visible'>
            {/* CATEGORY */}
            <button
              type='button'
              onClick={() => setCatOpen((v) => !v)}
              className='shrink-0 min-w-[104px] max-w-[150px] px-3 bg-surface-alt border-r border-border flex items-center justify-between gap-1 rounded-l-md'
            >
              <span className='text-sm truncate'>{selectedCat}</span>
              <IoIosArrowDown size={14} className='shrink-0' />
            </button>

            {/* INPUT */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search products...'
              className='flex-1 min-w-0 px-3 bg-surface text-content outline-none text-sm'
            />

            {/* BUTTON */}
            <button
              type='button'
              className='shrink-0 bg-orange-500 hover:bg-orange-600 px-4 text-white flex items-center justify-center rounded-r-md'
              aria-label='Search'
            >
              <AiOutlineSearch size={18} />
            </button>

            {/* DESKTOP CATEGORY DROPDOWN */}
            {catOpen && (
              <div className='hidden md:block absolute left-0 top-[calc(100%+4px)] w-[240px] max-h-[320px] overflow-y-auto bg-surface text-content border border-border rounded-md shadow-lg z-[100]'>
                {catList.map((name) => (
                  <button
                    key={name}
                    onClick={() => pickCategory(name)}
                    className={`block w-full text-left px-3 py-2 text-sm hover:bg-surface-alt ${
                      selectedCat === name ? 'text-orange-500 font-medium' : ''
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}

            {/* SEARCH RESULTS */}
            {search.length > 2 && results.length > 0 && (
              <div className='absolute left-0 top-[calc(100%+4px)] w-full bg-surface text-content shadow-lg max-h-[300px] overflow-y-auto z-[90] border border-border rounded-md'>
                {results.map((p) => (
                  <Link
                    key={p._id}
                    to={`/product/${p._id}`}
                    onClick={() => setSearch('')}
                    className='flex items-center gap-2 p-2 hover:bg-surface-alt'
                  >
                    <img
                      src={`${backend_url}${p.images?.[0]}`}
                      className='w-10 h-10 object-contain'
                      alt=''
                    />
                    <span className='text-sm'>{p.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ICONS */}
          <div className='hidden md:flex items-center gap-4'>
            <ThemeToggle size={20} />
            {/* Wishlist */}
            <div
              onClick={() => setOpenWishlist(true)}
              className='relative cursor-pointer'
            >
              <AiOutlineHeart size={22} />
              <span className='absolute -top-1 -right-1 bg-green-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full'>
                {wishlist?.length || 0}
              </span>
            </div>

            {/* Cart */}
            <div
              onClick={() => setOpenCart(true)}
              className='relative cursor-pointer'
            >
              <AiOutlineShoppingCart size={22} />
              <span className='absolute -top-1 -right-1 bg-green-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full'>
                {cart?.length || 0}
              </span>
            </div>

            {/* Owner dashboard shortcut */}
            {isAuthenticated && user?.role === 'business_owner' && (
              <Link
                to='/dashboard'
                className='text-sm font-semibold text-orange-500 hover:text-orange-600'
              >
                Dashboard
              </Link>
            )}

            {/* Profile */}
            {isAuthenticated ? (
              <Link to='/profile'>
                <img
                  src={`${backend_url}${user.avatar}`}
                  className='w-8 h-8 rounded-full object-cover'
                  alt=''
                />
              </Link>
            ) : (
              <Link to='/login'>
                <CgProfile size={22} />
              </Link>
            )}
          </div>
        </div>

        {/* NAV STRIP */}
        <div className='hidden md:block border-t border-border bg-surface'>
          <div className='max-w-7xl mx-auto px-3'>
            <nav className='flex items-center gap-6 h-11'>
              {navItems.map((i) => (
                <Link
                  key={i.title}
                  to={i.url}
                  className='text-sm font-medium text-muted hover:text-brand transition'
                >
                  {i.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* ---------------- MOBILE CATEGORY DRAWER ---------------- */}
      {catOpen && (
        <div
          className='md:hidden fixed inset-0 bg-black/40 z-[9999]'
          onClick={() => setCatOpen(false)}
        >
          <div
            className='w-[75%] max-w-[300px] bg-surface text-content h-full p-4 overflow-y-auto'
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className='font-semibold mb-3'>Categories</h3>
            {catList.map((name) => (
              <div
                key={name}
                onClick={() => pickCategory(name)}
                className={`p-2 border-b border-border cursor-pointer ${
                  selectedCat === name ? 'text-orange-500 font-medium' : ''
                }`}
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- MOBILE BOTTOM NAV ---------------- */}
      <div className='fixed bottom-0 left-0 w-full bg-surface border-t border-border flex justify-around py-2 md:hidden z-[999]'>
        <Link to='/' className='text-xs text-center'>
          🏠
          <div>Home</div>
        </Link>

        <button onClick={() => setCatOpen(true)} className='text-xs'>
          📂
          <div>Category</div>
        </button>

        <div className='text-xs flex flex-col items-center'>
          <ThemeToggle size={20} />
          <div>Theme</div>
        </div>

        <button onClick={() => setOpenCart(true)} className='relative text-xs'>
          🛒
          <div>Cart</div>
          {cart?.length > 0 && (
            <span className='absolute -top-1 right-3 bg-red-500 text-white text-[10px] px-1 rounded'>
              {cart.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setOpenWishlist(true)}
          className='relative text-xs'
        >
          ❤️
          <div>Wishlist</div>
          {wishlist?.length > 0 && (
            <span className='absolute -top-1 right-5 bg-red-500 text-white text-[10px] px-1 rounded'>
              {wishlist.length}
            </span>
          )}
        </button>

        {isAuthenticated ? (
          <Link to='/profile' className='text-xs'>
            <Avatar
              src={`${backend_url}${user.avatar}`}
              style={{ height: '26px', width: '26px' }}
            />
            <div>Account</div>
          </Link>
        ) : (
          <Link to='/login'>
            <CgProfile size={22} />
            <div>Login</div>
          </Link>
        )}
      </div>

      {/* POPUPS */}
      {openCart && <Cart openCart={openCart} setOpenCart={setOpenCart} />}

      {openWishlist && (
        <Wishlist
          openWishlist={openWishlist}
          setOpenWishlist={setOpenWishlist}
        />
      )}
    </>
  );
};

export default Header;
