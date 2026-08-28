import React, { useEffect } from 'react'
import Login from '../components/Login/Login'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.user);

    // Already signed in? Send owners to the dashboard, everyone else home.
    useEffect(() => {
        if (isAuthenticated) {
            navigate(user?.role === 'business_owner' ? '/dashboard' : '/');
        }
    }, [isAuthenticated, user, navigate]);

    return (
        <div>
            <Login />
        </div>
    )
}

export default LoginPage
