export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { plan_id, user_id, amount, customer_phone = '9999999999' } = req.body;

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const environment = process.env.CASHFREE_ENVIRONMENT || 'SANDBOX'; // SANDBOX or PRODUCTION

  if (!appId || !secretKey) {
    return res.status(500).json({ error: 'Cashfree API keys are missing. Please add them to Vercel Environment Variables.' });
  }

  const baseUrl = environment === 'PRODUCTION' 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg';

  try {
    const orderId = `order_${Date.now()}_${user_id || 'guest'}`;
    const host = req.headers.host || 'atyourage.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const returnUrl = `${protocol}://${host}/payment/verify?order_id={order_id}`;

    const orderPayload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: user_id || `cust_${Date.now()}`,
        customer_phone: customer_phone,
        customer_email: 'test@example.com', // Replace with real email if available
      },
      order_meta: {
        return_url: returnUrl
      },
      order_note: `Subscription: ${plan_id}`,
    };

    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'Accept': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree API Error:', data);
      return res.status(response.status).json({ error: data.message || 'Failed to create order', details: data });
    }

    // data.payment_session_id is what the frontend needs
    return res.status(200).json(data);
  } catch (error) {
    console.error('Create Order Exception:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
