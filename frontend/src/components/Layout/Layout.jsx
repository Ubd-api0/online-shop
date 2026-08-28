import React from 'react';
import Header from './Header';
import Footer from './Footer';

// Shared shell for the customer-facing content pages.
// Keeps the footer pinned to the bottom on short pages (flex column + flex-1
// main) and reserves space for the mobile bottom nav.
const Layout = ({ children, mainClassName = '' }) => (
  <div className='min-h-screen flex flex-col bg-surface-alt text-content'>
    <Header />
    <main className={`flex-1 pb-16 md:pb-0 ${mainClassName}`}>{children}</main>
    <Footer />
  </div>
);

export default Layout;
