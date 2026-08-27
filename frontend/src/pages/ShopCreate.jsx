import React, { useEffect, useState } from 'react'
import ShopCreate from "../components/Shop/ShopCreate";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { server } from '../server';

const ShopCreatePage = () => {
    const navigate = useNavigate();
    const { isSeller, seller } = useSelector((state) => state.seller);
    const [checking, setChecking] = useState(true);

    // Single-vendor: the store can only be created once.
    useEffect(() => {
        if (isSeller === true && seller?._id) {
            navigate(`/dashboard`);
            return;
        }
        let active = true;
        axios
            .get(`${server}/shop/exists`)
            .then((res) => {
                if (active && res.data?.exists) navigate('/login');
            })
            .finally(() => active && setChecking(false));
        return () => {
            active = false;
        };
    }, [isSeller, seller, navigate]);

    if (checking) return null;

    return (
        <div>
            <ShopCreate />
        </div>
    )
}

export default ShopCreatePage
