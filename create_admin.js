const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
  const email = 'admin@steelwoodman.ru';
  const password = 'Redhotchillipeppers123!';
  const name = 'Woodman Admin';

  console.log(`Checking for admin account: ${email}`);

  // 1. Check if user exists
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('List Users Error:', listError.message);
    return;
  }

  const existingUser = usersData.users.find(u => u.email === email);
  let authId;

  if (existingUser) {
    console.log('User exists. Updating password...');
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(existingUser.id, { password });
    if (updateAuthError) {
      console.error('Failed to update password:', updateAuthError.message);
    } else {
      console.log('Password updated successfully.');
    }
    authId = existingUser.id;
  } else {
    console.log('User does not exist. Creating...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });
    if (authError) {
      console.error('Create User Error:', authError.message);
      return;
    }
    console.log('User created successfully.');
    authId = authUser.user.id;
  }

  // 2. Update profile
  const { error: profileError } = await supabase
    .from('users')
    .upsert({ 
      auth_id: authId, 
      email: email, 
      name: name, 
      role: 'admin' 
    }, { onConflict: 'email' });

  if (profileError) {
    console.error('Profile Update Error:', profileError.message);
  } else {
    console.log('Admin profile initialized successfully with role "admin".');
    console.log('Credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  }
}

createAdmin();
