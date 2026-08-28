import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { getAllProductsShop } from '../../redux/actions/product';
import styles from '../../styles/styles';
import ProductCard from '../Route/ProductCard/ProductCard';
import { backend_url } from '../../server';
import Ratings from '../Products/Ratings';
import { getAllEventsShop } from '../../redux/actions/event';

const ShopProfileData = ({ isOwner }) => {
  const { products } = useSelector((state) => state.products);
  const { events } = useSelector((state) => state.events);
  const { seller } = useSelector((state) => state.seller);
  const { id } = useParams();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllEventsShop(seller?._id || id));
  }, [dispatch]);

  const [active, setActive] = useState(1);

  const allReviews =
    products && products.map((product) => product.reviews).flat();

  return (
    <div className='w-full'>
      <div className='flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex w-full flex-wrap gap-x-5 gap-y-2'>
          <h5
            onClick={() => setActive(1)}
            className={`font-[600] text-[17px] sm:text-[20px] ${
              active === 1 ? 'text-red-500' : 'text-content'
            } cursor-pointer`}
          >
            Shop Products
          </h5>
          <h5
            onClick={() => setActive(2)}
            className={`font-[600] text-[17px] sm:text-[20px] ${
              active === 2 ? 'text-red-500' : 'text-content'
            } cursor-pointer`}
          >
            Running Events
          </h5>
          <h5
            onClick={() => setActive(3)}
            className={`font-[600] text-[17px] sm:text-[20px] ${
              active === 3 ? 'text-red-500' : 'text-content'
            } cursor-pointer`}
          >
            Shop Reviews
          </h5>
        </div>
        {isOwner && (
          <Link to='/dashboard' className='shrink-0'>
            <div
              className={`${styles.button} !my-0 !w-full sm:!w-[150px] !h-[42px] !rounded-[4px]`}
            >
              <span className='text-[#fff]'>Go Dashboard</span>
            </div>
          </Link>
        )}
      </div>

      <br />

      {active === 1 && (
        <div className='grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] xl:grid-cols-4 xl:gap-[20px] mb-12 border-0'>
          {products &&
            products.map((i, index) => (
              <ProductCard
                data={i}
                key={index}
                isShop={true}
              />
            ))}
        </div>
      )}

      {active === 2 && (
        <div className='w-full'>
          <div className='grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] xl:grid-cols-4 xl:gap-[20px] mb-12 border-0'>
            {events &&
              events.map((i, index) => (
                <ProductCard
                  data={i}
                  key={index}
                  isShop={true}
                  isEvent={true}
                />
              ))}
          </div>
          {events && events.length === 0 && (
            <h5 className='w-full text-center py-5 text-[18px]'>
              No Events have for this shop!
            </h5>
          )}
        </div>
      )}

      {/* Shop reviews */}
      {active === 3 && (
        <div className='w-full'>
          {allReviews &&
            allReviews.map((item, index) => (
              <div className='w-full flex my-4'>
                <img
                  src={`${backend_url}/${item.user.avatar}`}
                  className='w-[50px] h-[50px] rounded-full'
                  alt=''
                />
                <div className='pl-2'>
                  <div className='flex w-full items-center'>
                    <h1 className='font-[600] pr-2 text-content'>{item.user.name}</h1>
                    <Ratings rating={item.rating} />
                  </div>
                  <p className='font-[400] text-muted'>{item?.comment}</p>

                  <p className='text-muted text-[14px]'>
                    {item.createdAt.substring(0, 10)}
                  </p>
                </div>
              </div>
            ))}
          {allReviews && allReviews.length === 0 && (
            <h5 className='w-full text-center py-5 text-[18px]'>
              No Reviews have for this shop!
            </h5>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopProfileData;
