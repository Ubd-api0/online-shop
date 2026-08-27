import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { categoriesData, navItems } from '../../static/data';
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

const Header = () => {
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { allProducts } = useSelector((state) => state.products);

  const [openCart, setOpenCart] = useState(false);
  const [openWishlist, setOpenWishlist] = useState(false);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  const [results, setResults] = useState([]);
  const [selectedCat, setSelectedCat] = useState('All');
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [sticky, setSticky] = useState(false);

  /* ---------------- Sticky Header ---------------- */
  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ---------------- Smart Filtering (Daraz style) ---------------- */
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

  return (
    <>
      {/* HEADER */}
      <header
        className={`relative w-full bg-surface text-content z-[999] ${
          sticky ? 'fixed top-0 shadow-md' : ''
        }`}
      >
        {/* TOP BAR */}
        <div className='border-b border-border'>
          <div className='max-w-7xl mx-auto px-3 py-3 flex items-center justify-between gap-4'>
            {/* LOGO */}
            <Link
              to='/'
              className='text-xl font-bold text-orange-500 md:block hidden'
            >
              SHOP
            </Link>

            {/* SEARCH */}
            <div className='flex-1 relative flex items-center border rounded-md overflow-hidden'>
              {/* CATEGORY */}
              <div
                onClick={() => setMobileCatOpen(!mobileCatOpen)}
                className='px-3 py-2 bg-surface-alt flex items-center gap-1 cursor-pointer'
              >
                <span className='text-sm'>{selectedCat}</span>
                <IoIosArrowDown size={14} />
              </div>

              {/* INPUT */}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search products...'
                className='w-full px-3 py-2 outline-none text-sm'
              />

              {/* BUTTON */}
              <button className='bg-orange-500 px-4 text-white'>
                <AiOutlineSearch />
              </button>
            </div>

            {/* ICONS */}
            <div className='md:block hidden'>
              <div className='flex items-center gap-4'>
                <ThemeToggle size={20} />
                {/* Wishlist */}
                <div
                  onClick={() => setOpenWishlist(true)}
                  className='relative cursor-pointer'
                >
                  <AiOutlineHeart size={22} />
                  <span className='absolute -top-1 -right-1 bg-green-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full'>
                    {wishlist?.length}
                  </span>
                </div>

                {/* Cart */}
                <div
                  onClick={() => setOpenCart(true)}
                  className='relative cursor-pointer'
                >
                  <AiOutlineShoppingCart size={22} />
                  <span className='absolute -top-1 -right-1 bg-green-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full'>
                    {cart?.length}
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
          </div>
        </div>

        {/* NAV STRIP */}
        <div className='hidden md:block border-b border-border bg-surface'>
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
      {mobileCatOpen && (
        <div
          className='fixed inset-0 bg-black/40 z-[9999]'
          onClick={() => setMobileCatOpen(!mobileCatOpen)}
        >
          <div className='w-[75%] max-w-[300px] bg-surface h-full p-4 overflow-y-auto'>
            <h3 className='font-semibold mb-3'>Categories</h3>

            {categoriesData.map((c) => (
              <div
                key={c.title}
                onClick={() => {
                  setSelectedCat(c.title);
                  navigate(`/products?category=${c.title}`);
                  setMobileCatOpen(false);
                }}
                className='p-2 border-b cursor-pointer'
              >
                {c.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- MOBILE BOTTOM NAV ---------------- */}
      <div className='fixed bottom-0 left-0 w-full bg-surface border-t flex justify-around py-2 md:hidden z-[999]'>
        <Link
          to='/'
          className='text-xs text-center'
        >
          🏠
          <div>Home</div>
        </Link>

        <button
          onClick={() => setMobileCatOpen(true)}
          className='text-xs'
        >
          📂
          <div>Category</div>
        </button>

        <div className='text-xs flex flex-col items-center'>
          <ThemeToggle size={20} />
          <div>Theme</div>
        </div>

        <button
          onClick={() => setOpenCart(true)}
          className='relative text-xs'
        >
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
          <Link
            to='/profile'
            className='text-xs'
          >
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
      {openCart && (
        <Cart
          openCart={openCart}
          setOpenCart={setOpenCart}
        />
      )}

      {openWishlist && (
        <Wishlist
          openWishlist={openWishlist}
          setOpenWishlist={setOpenWishlist}
        />
      )}
      {/* SEARCH RESULTS */}
      {search.length > 2 && results.length > 0 && (
        <div className='absolute left-0 w-full bg-surface shadow-lg max-h-[300px] overflow-y-auto z-[9999] border mt-1 rounded-md'>
          {results.map((p) => (
            <Link
              key={p._id}
              to={`/product/${p._id}`}
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
    </>
  );
};

export default Header;
