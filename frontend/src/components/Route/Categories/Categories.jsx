import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from '../../../styles/styles';
import { Collapse } from '@material-ui/core';
import { BiMenuAltLeft } from 'react-icons/bi';
import { IoIosArrowDown } from 'react-icons/io';
import { TileIcon } from '../../../utils/tileIcons';

const Categories = () => {
  const navigate = useNavigate();
  const [dropDown, setDropDown] = useState(false);
  const { categories, featureTiles } = useSelector((state) => state.storefront);

  return (
    <>
      {/* Feature tiles */}
      {featureTiles?.length > 0 && (
        <div className={`${styles.section} mt-2`}>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2'>
            {featureTiles.map((t, index) => (
              <div
                key={index}
                className='flex items-start gap-3 p-3 border border-border rounded-md bg-surface'
              >
                <TileIcon name={t.icon} className='text-brand shrink-0' />
                <div>
                  <h3 className='text-sm font-semibold text-content'>{t.title}</h3>
                  <p className='text-xs text-muted'>{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories showcase */}
      {categories?.length > 0 && (
        <div className='block p-1 md:p-4'>
          <div className={`${styles.section} w-full`}>
            <div
              onClick={() => setDropDown(!dropDown)}
              className='lg:hidden flex items-center justify-between bg-surface border border-border px-3 h-[45px] rounded-md cursor-pointer text-content'
            >
              <span className='flex items-center gap-2'>
                <BiMenuAltLeft size={22} />
                Categories
              </span>
              <IoIosArrowDown />
            </div>

            <div className='hidden lg:grid grid-cols-3 xl:grid-cols-5 gap-3'>
              {categories.map((c) => (
                <CategoryCard key={c._id} c={c} navigate={navigate} />
              ))}
            </div>

            <Collapse orientation='vertical' in={dropDown} collapsedSize={0}>
              <div className='lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2'>
                {categories.map((c) => (
                  <CategoryCard key={c._id} c={c} navigate={navigate} />
                ))}
              </div>
            </Collapse>
          </div>
        </div>
      )}
    </>
  );
};

const CategoryCard = ({ c, navigate }) => (
  <div
    onClick={() => navigate(`/products?category=${encodeURIComponent(c.name)}`)}
    className='bg-surface border border-border rounded-md p-3 flex items-center justify-between hover:shadow-md cursor-pointer'
  >
    <div>
      <h5 className='text-sm font-medium text-content'>{c.name}</h5>
      {c.subTitle && <p className='text-xs text-muted'>{c.subTitle}</p>}
    </div>
    {c.image && (
      <img src={c.image} className='w-12 h-12 object-cover rounded' alt='' />
    )}
  </div>
);

export default Categories;
