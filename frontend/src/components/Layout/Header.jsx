import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AiOutlineHeart,
  AiOutlineSearch,
  AiOutlineShoppingCart,
} from 'react-icons/ai';
import { BiMenuAltLeft } from 'react-icons/bi';
import { CgProfile } from 'react-icons/cg';
import { IoIosArrowDown } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { backend_url } from '../../server';
import { categoriesData } from '../../static/data';
import Cart from '../cart/Cart';
import Wishlist from '../Wishlist/Wishlist';

const Header = () => {
  const [openCart, setOpenCart] = useState(false);
  const [openWishlist, setOpenWishlist] = useState(false);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { allProducts } = useSelector((state) => state.products);

  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selectedCat, setSelectedCat] = useState('All');
  const [catOpen, setCatOpen] = useState(false);

  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!search) return setResults([]);

    const filtered =
      allProducts?.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ) || [];

    setResults(filtered);
  }, [search]);

  return (
    <header
      className={`w-full bg-white z-50 ${
        sticky ? 'fixed top-0 shadow-md' : ''
      }`}
    >
      {/* TOP BAR */}
      <div className='border-b'>
        <div className='max-w-7xl mx-auto px-3 py-3 flex items-center justify-between gap-4'>
          {/* LOGO */}
          <Link
            to='/'
            className='text-xl font-bold text-orange-500'
          >
            SHOP
          </Link>

          {/* SEARCH (DARAZ STYLE CORE) */}
          <div className='flex-1 relative flex items-center border rounded-md overflow-hidden'>
            {/* CATEGORY */}
            <div
              onClick={() => setCatOpen(!catOpen)}
              className='px-3 py-2 bg-gray-100 flex items-center gap-1 cursor-pointer'
            >
              <span className='text-sm'>{selectedCat}</span>
              <IoIosArrowDown size={14} />
            </div>

            {/* INPUT */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search in Shop...'
              className='w-full px-3 py-2 outline-none text-sm'
            />

            {/* BUTTON */}
            <button className='bg-orange-500 px-4 h-[stretch] text-white'>
              <AiOutlineSearch />
            </button>
          </div>

          {/* RIGHT ICONS */}
          <div className='flex items-center gap-4'>
            {/* ❤️ Wishlist */}
            <div
              onClick={() => setOpenWishlist(true)}
              className='relative cursor-pointer'
            >
              <AiOutlineHeart size={22} />
              <span className='absolute -top-1 -right-1 bg-green-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full'>
                {wishlist?.length}
              </span>
            </div>

            {/* 🛒 Cart */}
            <div
              onClick={() => setOpenCart(true)}
              className='relative cursor-pointer'
            >
              <AiOutlineShoppingCart size={22} />
              <span className='absolute -top-1 -right-1 bg-green-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full'>
                {cart?.length}
              </span>
            </div>

            {/* 👤 Profile */}
            {isAuthenticated ? (
              <Link to='/profile'>
                <img
                  src={`${backend_url}${user.avatar}`}
                  className='w-8 h-8 rounded-full cursor-pointer'
                  alt=''
                />
              </Link>
            ) : (
              <Link to='/login'>
                <CgProfile
                  size={22}
                  className='cursor-pointer'
                />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* CATEGORY DROPDOWN */}
      {catOpen && (
        <div className='absolute left-0 top-[60px] bg-white shadow-md w-[200px] p-2 z-50'>
          {categoriesData.map((c) => (
            <div
              key={c.title}
              onClick={() => {
                setSelectedCat(c.title);
                setCatOpen(false);
              }}
              className='p-2 hover:bg-gray-100 cursor-pointer text-sm'
            >
              {c.title}
            </div>
          ))}
        </div>
      )}

      {/* RESULTS */}
      {results.length > 0 && (
        <div className='absolute left-0 bg-white shadow-lg max-h-[300px] overflow-y-auto z-50'>
          {results.map((p) => (
            <Link
              key={p._id}
              to={`/product/${p._id}`}
              className='flex items-center gap-2 p-2 hover:bg-gray-100'
            >
              <img
                src={`${backend_url}${p.images[0]}`}
                className='w-10 h-10'
                alt=''
              />
              <span className='text-sm'>{p.name}</span>
            </Link>
          ))}
        </div>
      )}

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
    </header>
  );
};

export default Header;
