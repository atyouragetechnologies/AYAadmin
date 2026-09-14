import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabaseAdmin;
try {
  if (supabaseUrl && serviceRoleKey) {
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
} catch (e) {
  console.error('[set-username] Failed to initialize admin client:', e);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }

  const activeUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || supabaseUrl;
  const activeKey = process.env.SUPABASE_SERVICE_ROLE_KEY || serviceRoleKey;
  let adminClient = supabaseAdmin;
  if (!adminClient && activeUrl && activeKey) {
    try {
      adminClient = createClient(activeUrl, activeKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
    } catch (e) {
      console.error('[set-username] Failed to create admin client in handler:', e);
    }
  }

  if (!adminClient) {
    return res.status(500).json({ success: false, error: 'Server not configured.' });
  }

  try {
    // 1. Verify the caller's Supabase Auth session from the Bearer token
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const { data: authData, error: authError } = await adminClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session. Please sign in again.' });
    }

    const authUid = authData.user.id;
    const authEmail = authData.user.email || null;
    const { username, mobile, age } = req.body || {};

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ success: false, error: 'Username is required.' });
    }

    const cleanUsername = username.trim();

    // 2. Validate username format
    if (cleanUsername.length < 3) {
      return res.status(400).json({ success: false, error: 'Username must be at least 3 characters.' });
    }
    if (cleanUsername.length > 30) {
      return res.status(400).json({ success: false, error: 'Username must be 30 characters or fewer.' });
    }
    if (!/^[A-Za-z0-9_]+$/.test(cleanUsername)) {
      return res.status(400).json({ success: false, error: 'Username may only contain letters, numbers, and underscores.' });
    }

    // 3. Check username uniqueness (case-insensitive), excluding this user's own row
    const { data: existingUsernameUsers } = await supabaseAdmin
      .from('users')
      .select('id, auth_user_id')
      .ilike('username', cleanUsername)
      .is('deleted_at', null);

    if (existingUsernameUsers && existingUsernameUsers.length > 0) {
      const takenByOther = existingUsernameUsers.some(u => u.auth_user_id !== authUid);
      if (takenByOther) {
        return res.status(409).json({ success: false, error: 'Username is already taken. Please choose another.' });
      }
    }

    // 4. Look up existing profile row for this user by auth_user_id, mobile, or email
    let targetRow = null;

    const { data: byAuth } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_user_id', authUid);
    if (byAuth && byAuth.length > 0) targetRow = byAuth[0];

    const cleanMobile = mobile ? String(mobile).trim().replace(/\s+/g, '') : null;

    if (!targetRow && cleanMobile) {
      const { data: byMobile } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('mobile', cleanMobile)
        .is('deleted_at', null);
      if (byMobile && byMobile.length > 0) targetRow = byMobile[0];
    }

    if (!targetRow && authEmail) {
      const { data: byEmail } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', authEmail)
        .is('deleted_at', null);
      if (byEmail && byEmail.length > 0) targetRow = byEmail[0];
    }

    const numericAge = age ? Number(age) : 18;
    const payload = {
      auth_user_id: authUid,
      username: cleanUsername,
      name: cleanUsername,
      onboarding_complete: true,
      age: numericAge,
    };
    if (cleanMobile) payload.mobile = cleanMobile;
    if (authEmail) payload.email = authEmail;

    let finalRow = null;

    if (targetRow) {
      // Update existing user profile row by ID (bypasses RLS via service role)
      const { data: updatedRows, error: updateErr } = await supabaseAdmin
        .from('users')
        .update(payload)
        .eq('id', targetRow.id)
        .select();

      if (updateErr) {
        if (updateErr.code === '23505' && updateErr.message?.includes('users_username_lower_idx')) {
          return res.status(409).json({ success: false, error: 'Username is already taken. Please choose another.' });
        }
        return res.status(500).json({ success: false, error: updateErr.message });
      }
      if (updatedRows && updatedRows.length > 0) {
        finalRow = updatedRows[0];
      }
    }

    if (!finalRow) {
      // Insert new profile row
      const insertPayload = {
        ...payload,
        total_xp: 0,
        level: 1,
        stories_completed: 0,
      };

      const { data: insertedRows, error: insertErr } = await supabaseAdmin
        .from('users')
        .insert(insertPayload)
        .select();

      if (insertErr) {
        if (insertErr.code === '23505' && insertErr.message?.includes('users_username_lower_idx')) {
          return res.status(409).json({ success: false, error: 'Username is already taken. Please choose another.' });
        }
        return res.status(500).json({ success: false, error: insertErr.message });
      }
      if (insertedRows && insertedRows.length > 0) {
        finalRow = insertedRows[0];
      }
    }

    if (finalRow) {
      await supabaseAdmin.from('personality_profiles').upsert({
        user_id: finalRow.id,
        mobile: finalRow.mobile || null,
        trait_risk_taker: 50,
        trait_creative: 50,
        trait_analytical: 50,
        trait_social: 50,
        trait_ambitious: 50,
      }, { onConflict: 'user_id' });
    }

    return res.status(200).json({
      success: true,
      user: finalRow,
    });

  } catch (err) {
    console.error('[set-username] Unexpected error:', err);
    return res.status(500).json({ success: false, error: err.message || 'An unexpected error occurred.' });
  }
}
