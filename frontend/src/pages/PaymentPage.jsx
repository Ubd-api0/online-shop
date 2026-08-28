import React from 'react'
import Layout from '../components/Layout/Layout'
import CheckoutSteps from '../components/Checkout/CheckoutSteps'
import Payment from "../components/Payment/Payment.jsx";

const PaymentPage = () => {
    return (
        <Layout>
            <CheckoutSteps active={2} />
            <Payment />
        </Layout>
    )
}

export default PaymentPage
