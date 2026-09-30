import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { withErrorHandling } from "@/lib/api/errors";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3030";

const hasJazzcashKeys = () =>
  !!(
    process.env.JAZZCASH_MERCHANT_ID &&
    process.env.JAZZCASH_PASSWORD &&
    process.env.JAZZCASH_INTEGERITY_SALT &&
    process.env.JAZZCASH_API_URL
  );

const mockRedirect = (gateway, { amount, orderRef }) =>
  `${FRONTEND_URL}/payment/mock?gateway=${gateway}` +
  `&orderRef=${encodeURIComponent(orderRef || Date.now())}` +
  `&amount=${encodeURIComponent(amount || 0)}`;

export const POST = withErrorHandling(async (request) => {
  const { amount, orderRef } = await request.json();

  if (!hasJazzcashKeys()) {
    return NextResponse.json({
      success: true,
      mock: true,
      redirectUrl: mockRedirect("jazzcash", { amount, orderRef }),
      message: "JazzCash credentials not configured — using sandbox mock flow.",
    });
  }

  const dateTime = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const expiryDateTime = new Date(Date.now() + 60 * 60 * 1000)
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  const data = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID,
    pp_SubMerchantID: "",
    pp_Password: process.env.JAZZCASH_PASSWORD,
    pp_BankID: "",
    pp_ProductID: "",
    pp_TxnRefNo: `T${dateTime}`,
    pp_Amount: `${Math.round(amount * 100)}`,
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: dateTime,
    pp_BillReference: orderRef,
    pp_Description: "Store order payment",
    pp_TxnExpiryDateTime: expiryDateTime,
    pp_ReturnURL: process.env.JAZZCASH_CALLBACK_URL,
    pp_SecureHash: "",
  };

  const sortedString = Object.values(data)
    .filter((v) => v !== "")
    .join("&");
  data.pp_SecureHash = crypto
    .createHmac("sha256", process.env.JAZZCASH_INTEGERITY_SALT)
    .update(sortedString)
    .digest("hex");

  return NextResponse.json({
    success: true,
    mock: false,
    paymentData: data,
    paymentUrl: process.env.JAZZCASH_API_URL,
  });
});
