import React, { useEffect, useState } from 'react';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../redux/actions/product';
import { toast } from 'react-toastify';
import Cloudinary from '../../cloudinary';

const CreateProduct = () => {
  const { seller } = useSelector((state) => state.seller);
  const { success, error } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.storefront);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [images, setImages] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [originalPrice, setOriginalPrice] = useState();
  const [discountPrice, setDiscountPrice] = useState();
  const [stock, setStock] = useState();
  const [fulfillment, setFulfillment] = useState('in_stock');
  const [leadTimeDays, setLeadTimeDays] = useState('');
  const madeToOrder = fulfillment === 'made_to_order';
  const [override, setOverride] = useState({
    enabled: false,
    codEnabled: true,
    onlineFullEnabled: true,
    partialAdvanceEnabled: true,
    advancePercent: '',
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success('Product created successfully!');
      navigate('/dashboard');
      window.location.reload();
    }
  }, [dispatch, error, success]);

  const handleImageChange = (e) => {
    e.preventDefault();

    let files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  console.log(images);

  const _handleSubmit = (e) => {
    e.preventDefault();

    const newForm = new FormData();

    images.forEach((image) => {
      newForm.append('images', image);
    });
    newForm.append('name', name);
    newForm.append('description', description);
    newForm.append('category', category);
    newForm.append('tags', tags);
    newForm.append('originalPrice', originalPrice);
    newForm.append('discountPrice', discountPrice);
    newForm.append('stock', stock);
    newForm.append('shopId', seller._id);
    dispatch(createProduct(newForm));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. upload all images to Cloudinary
      const imageUrls = await Promise.all(
        images.map((img) => Cloudinary.upload(img, 'products'))
      );

      // 2. send only URLs to backend
      const payload = {
        images: imageUrls,
        name,
        description,
        category,
        tags,
        originalPrice,
        discountPrice,
        stock: madeToOrder ? 0 : stock,
        fulfillment,
        leadTimeDays: madeToOrder ? Number(leadTimeDays) || 0 : 0,
        shopId: seller._id,
        paymentOverride: override.enabled
          ? {
              enabled: true,
              codEnabled: override.codEnabled,
              onlineFullEnabled: override.onlineFullEnabled,
              partialAdvanceEnabled: override.partialAdvanceEnabled,
              ...(override.advancePercent
                ? { advancePercent: Number(override.advancePercent) }
                : {}),
            }
          : { enabled: false },
      };

      dispatch(createProduct(payload));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='w-full max-w-3xl bg-surface border border-border rounded-md p-4 sm:p-6'>
      {/* create product form */}
      <form onSubmit={handleSubmit}>
        <br />
        <div>
          <label className='pb-2'>
            Name <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            name='name'
            value={name}
            className='mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            onChange={(e) => setName(e.target.value)}
            placeholder='Enter your product name...'
          />
        </div>
        <br />
        <div>
          <label className='pb-2'>
            Description <span className='text-red-500'>*</span>
          </label>
          <textarea
            cols='30'
            required
            rows='8'
            type='text'
            name='description'
            value={description}
            className='mt-2 appearance-none block w-full pt-2 px-3 border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Enter your product description...'
          ></textarea>
        </div>
        <br />
        <div>
          <label className='pb-2'>
            Category <span className='text-red-500'>*</span>
          </label>
          <select
            className='w-full mt-2 border h-[35px] rounded-[5px]'
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value=''>Choose a category</option>
            {(categories || []).map((c) => (
              <option value={c.name} key={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          {(categories || []).length === 0 && (
            <p className='text-xs text-red-500 mt-1'>
              No categories yet — add them under Dashboard → Categories.
            </p>
          )}
        </div>
        <br />
        <div>
          <label className='pb-2'>Tags</label>
          <input
            type='text'
            name='tags'
            value={tags}
            className='mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            onChange={(e) => setTags(e.target.value)}
            placeholder='Enter your product tags...'
          />
        </div>
        <br />
        <div>
          <label className='pb-2'>Original Price</label>
          <input
            type='number'
            name='price'
            value={originalPrice}
            className='mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder='Enter your product price...'
          />
        </div>
        <br />
        <div>
          <label className='pb-2'>
            Price (With Discount) <span className='text-red-500'>*</span>
          </label>
          <input
            type='number'
            name='price'
            value={discountPrice}
            className='mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            onChange={(e) => setDiscountPrice(e.target.value)}
            placeholder='Enter your product price with discount...'
          />
        </div>
        <br />
        <div>
          <label className='pb-2'>
            Fulfillment <span className='text-red-500'>*</span>
          </label>
          <select
            className='w-full mt-2 border h-[35px] rounded-[5px]'
            value={fulfillment}
            onChange={(e) => setFulfillment(e.target.value)}
          >
            <option value='in_stock'>In stock (sell from inventory)</option>
            <option value='made_to_order'>
              Made to order (manufacture after purchase)
            </option>
          </select>
          <p className='text-xs text-gray-500 mt-1'>
            {madeToOrder
              ? 'Customers can always order; the item is produced per order and stock is not tracked.'
              : 'Customers see "Currently unavailable" once stock reaches 0.'}
          </p>
        </div>
        <br />
        {madeToOrder ? (
          <div>
            <label className='pb-2'>Lead time (days)</label>
            <input
              type='number'
              min={0}
              value={leadTimeDays}
              className='mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              onChange={(e) => setLeadTimeDays(e.target.value)}
              placeholder='e.g. 7 — shown to customers as "ships in ~7 days"'
            />
          </div>
        ) : (
          <div>
            <label className='pb-2'>
              Product Stock <span className='text-red-500'>*</span>
            </label>
            <input
              type='number'
              name='price'
              value={stock}
              className='mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              onChange={(e) => setStock(e.target.value)}
              placeholder='Enter your product stock...'
            />
          </div>
        )}
        <br />
        <div className='border border-gray-200 rounded-[4px] p-3'>
          <label className='flex items-center gap-2 font-medium'>
            <input
              type='checkbox'
              checked={override.enabled}
              onChange={(e) =>
                setOverride((o) => ({ ...o, enabled: e.target.checked }))
              }
            />
            Custom payment rules for this product
          </label>
          {override.enabled && (
            <div className='mt-3 pl-1 space-y-2 text-sm'>
              <p className='text-gray-500'>
                Unchecked options are blocked for any cart containing this
                product (intersected with the store settings).
              </p>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={override.codEnabled}
                  onChange={(e) =>
                    setOverride((o) => ({ ...o, codEnabled: e.target.checked }))
                  }
                />
                Allow Cash on Delivery
              </label>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={override.onlineFullEnabled}
                  onChange={(e) =>
                    setOverride((o) => ({
                      ...o,
                      onlineFullEnabled: e.target.checked,
                    }))
                  }
                />
                Allow full online payment
              </label>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={override.partialAdvanceEnabled}
                  onChange={(e) =>
                    setOverride((o) => ({
                      ...o,
                      partialAdvanceEnabled: e.target.checked,
                    }))
                  }
                />
                Allow partial advance
              </label>
              <div className='flex items-center gap-2'>
                <span>Minimum advance %</span>
                <input
                  type='number'
                  min={1}
                  max={100}
                  placeholder='store default'
                  value={override.advancePercent}
                  onChange={(e) =>
                    setOverride((o) => ({
                      ...o,
                      advancePercent: e.target.value,
                    }))
                  }
                  className='w-[110px] border border-gray-300 rounded px-2 h-[30px]'
                />
              </div>
            </div>
          )}
        </div>
        <br />
        <div>
          <label className='pb-2'>
            Upload Images <span className='text-red-500'>*</span>
          </label>
          <input
            type='file'
            name=''
            id='upload'
            className='hidden'
            multiple
            onChange={handleImageChange}
          />
          <div className='w-full flex items-center flex-wrap'>
            <label htmlFor='upload'>
              <AiOutlinePlusCircle
                size={30}
                className='mt-3'
                color='#555'
              />
            </label>
            {images &&
              images.map((i) => (
                <img
                  src={URL.createObjectURL(i)}
                  key={i}
                  alt=''
                  className='h-[120px] w-[120px] object-cover m-2'
                />
              ))}
          </div>
          <br />
          <div>
            <input
              type='submit'
              value='Create'
              className='mt-2 cursor-pointer appearance-none text-center block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
