// components/Layout.js
import React from 'react';

import Navbar from '../Header/navbar';
import Footer from "../Footer/footer";
const Layout = ({ children }) => {
    return (
        <div>
            <Navbar />
            <main>{children}</main>
            <Footer />
        </div>
    );
};

export default Layout;
