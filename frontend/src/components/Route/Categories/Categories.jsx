import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { brandingData, categoriesData } from '../../../static/data';
import styles from '../../../styles/styles';
import { Avatar, Collapse } from '@material-ui/core';
import { BiMenuAltLeft } from 'react-icons/bi';
import { IoIosArrowDown } from 'react-icons/io';

const Categories = () => {
  const navigate = useNavigate();

  const [dropDown, setDropDown] = useState(false);

  const handleSubmit = (item) => {
    navigate(`/products?category=${item.title}`);
  };

  return (
    <>
      {/* Branding Section */}
      <div className={`${styles.section} mt-2`}>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2'>
          {brandingData?.map((i, index) => (
            <div
              key={index}
              className='flex items-start gap-3 p-3 border rounded-md bg-white'
            >
              {i.icon}
              <div>
                <h3 className='text-sm font-semibold'>{i.title}</h3>
                <p className='text-xs text-gray-500'>{i.Description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className='lg:hidden block p-1 md:p-4'>
        <div className={`${styles.section} w-full bg-white rounded-lg  `}>
          <div
            onClick={() => setDropDown(!dropDown)}
            className='flex items-center justify-between bg-white px-3 h-[45px] rounded-md cursor-pointer'
          >
            <span className='flex items-center gap-2'>
              <BiMenuAltLeft size={22} />
              Categories
            </span>
            <IoIosArrowDown />
          </div>
        </div>
        <Collapse
          orientation='vertical'
          in={dropDown}
          collapsedSize={0}
        >
          {/* Categories Section */}
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
            {categoriesData?.map((i) => (
              <div
                key={i.id}
                onClick={() => navigate(`/products?category=${i.title}`)}
                className='bg-white border rounded-md p-3 flex items-center justify-between hover:shadow-md cursor-pointer'
              >
                <h5 className='text-sm font-medium'>{i.title}</h5>

                <img
                  src={i.image_Url}
                  className='w-12 h-12 object-contain'
                  alt=''
                />
              </div>
            ))}
          </div>
        </Collapse>
      </div>
    </>
  );
};

export default Categories;
