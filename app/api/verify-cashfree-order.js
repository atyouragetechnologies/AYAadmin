import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).json({ error: 'order_id is required' });
  }

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const environment = process.env.CASHFREE_ENVIRONMENT || 'SANDBOX'; 

  const baseUrl = environment === 'PRODUCTION' 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg';

  try {
    // 1. Verify with Cashfree
    const response = await fetch(`${baseUrl}/orders/${order_id}`, {
      method: 'GET',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to verify order', details: data });
    }

    if (data.order_status !== 'PAID') {
      return res.status(400).json({ error: 'Order is not paid', status: data.order_status });
    }

    // 2. Parse out the user_id and plan from the order
    const userId = data.customer_details?.customer_id;
    // e.g. "Subscription: aya_plus_monthly"
    const orderNote = data.order_note || '';
    let plan = 'aya_plus';
    if (orderNote.includes('aya_plus_annual') || orderNote.includes('annual')) {
      plan = 'aya_plus_annual';
    } else if (orderNote.includes('aya_plus_quarterly') || orderNote.includes('quarterly') || orderNote.includes('3month')) {
      plan = 'aya_plus_quarterly';
    } else if (orderNote.includes('aya_plus_monthly') || orderNote.includes('monthly')) {
      plan = 'aya_plus_monthly';
    } else if (orderNote.includes('premium_pro')) {
      plan = 'premium_pro';
    } else if (orderNote.includes('free')) {
      plan = 'free';
    }

    if (!userId || userId.startsWith('guest')) {
      // It's a guest or unauthenticated user, can't update DB
      return res.status(200).json({ success: true, plan, status: data.order_status, warning: 'Guest user' });
    }

    // 3. Update Supabase
    // We try to use the environment variables Vercel provides
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase credentials missing in backend, skipping DB update.');
        // We still return success so the frontend can optimistically update
        return res.status(200).json({ success: true, plan, status: data.order_status, warning: 'DB not updated due to missing keys' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update the user
    const today = new Date().toISOString().split('T')[0];

    const { error: updateError } = await supabase
      .from('users')
      .update({ 
          access_type: plan,
          access_start_date: today 
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Supabase Update Error:', updateError);
      // Even if DB fails (e.g., RLS prevents anon key from updating), we return success for the payment
      // The frontend can update optimistically.
      return res.status(200).json({ success: true, plan, status: data.order_status, warning: 'DB update failed', error: updateError.message });
    }

    return res.status(200).json({ success: true, plan, status: data.order_status });

  } catch (error) {
    console.error('Verify Order Exception:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
