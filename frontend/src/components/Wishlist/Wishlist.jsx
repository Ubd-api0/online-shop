import React from 'react';
import {
  Drawer,
  IconButton,
  Typography,
  Box,
  Divider,
} from '@material-ui/core';
import { BsCartPlus } from 'react-icons/bs';
import { AiOutlineHeart } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromWishlist } from '../../redux/actions/wishlist';
import { addTocart } from '../../redux/actions/cart';
import { backend_url } from '../../server';
import { RxCross1 } from 'react-icons/rx';

const Wishlist = ({ openWishlist, setOpenWishlist }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();

  const removeHandler = (data) => {
    dispatch(removeFromWishlist(data));
  };

  const addToCartHandler = (data) => {
    dispatch(addTocart({ ...data, qty: 1 }));
    setOpenWishlist(false);
  };

  return (
    <Drawer
      anchor='right'
      open={openWishlist}
      onClose={() => setOpenWishlist(false)}
      PaperProps={{
        sx: { width: { xs: '85%', sm: 350 } },
      }}
    >
      {/* HEADER */}
      <Box className='flex items-center justify-between p-4'>
        <Box className='flex items-center gap-2'>
          <AiOutlineHeart size={22} />
          <Typography variant='h6'>{wishlist.length} Items</Typography>
        </Box>

        <IconButton onClick={() => setOpenWishlist(false)}>
          <RxCross1 />
        </IconButton>
      </Box>

      <Divider />

      {/* EMPTY */}
      {wishlist.length === 0 ? (
        <Box className='flex items-center justify-center h-full'>
          <Typography>No items in wishlist</Typography>
        </Box>
      ) : (
        <Box className='flex-1 overflow-y-auto'>
          {wishlist.map((item, index) => (
            <WishlistItem
              key={index}
              data={item}
              removeHandler={removeHandler}
              addToCartHandler={addToCartHandler}
            />
          ))}
        </Box>
      )}
    </Drawer>
  );
};

const WishlistItem = ({ data, removeHandler, addToCartHandler }) => {
  return (
    <Box className='flex items-center gap-3 p-4 border-b'>
      {/* Image */}
      <img
        src={`${backend_url}${data.images[0]}`}
        className='w-[70px] h-[70px] object-contain'
        alt=''
      />

      {/* Info */}
      <Box className='flex-1'>
        <Typography variant='body2'>{data.name}</Typography>
        <Typography
          color='error'
          fontWeight='bold'
        >
          ${data.discountPrice}
        </Typography>
      </Box>

      {/* Actions */}
      <Box className='flex flex-col gap-2'>
        <IconButton onClick={() => addToCartHandler(data)}>
          <BsCartPlus size={15} />
        </IconButton>
        <IconButton onClick={() => removeHandler(data)}>
          <RxCross1 size={15} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Wishlist;
