import React, { useEffect } from 'react'
import Signup from '../components/Signup/Signup'
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SignupPage = () => {

    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.user);
    useEffect(() => {
        if (isAuthenticated) {
            navigate(user?.role === 'business_owner' ? '/dashboard' : '/');
        }
    }, [isAuthenticated, user, navigate])

    return (
        <div>
            <Signup />
        </div>
    )
}

export default SignupPage