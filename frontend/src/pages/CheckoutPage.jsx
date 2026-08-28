import React from 'react'
import Layout from '../components/Layout/Layout'
import CheckoutSteps from "../components/Checkout/CheckoutSteps";
import Checkout from "../components/Checkout/Checkout";

const CheckoutPage = () => {
    return (
        <Layout>
            <CheckoutSteps active={1} />
            <Checkout />
        </Layout>
    )
}

export default CheckoutPage
