
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv/config');

// Read the JSON file synchronously
const usersFilePath = path.join(__dirname, 'user_bulk_create.json');
const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));

// Verify environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment check:');
console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set (length: ' + supabaseServiceKey.length + ')' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deleteExistingUsers() {
  console.log('🗑️  Deleting existing users...');
  
  try {
    // Get all users with @fitt-iitd.in emails
    const { data: { users: existingUsers }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return false;
    }

    const usersToDelete = existingUsers.filter(user => 
      user.email && user.email.includes('@fitt-iitd.in')
    );

    console.log(`Found ${usersToDelete.length} users to delete`);

    for (const user of usersToDelete) {
      try {
        console.log(`Deleting user: ${user.email}`);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error(`❌ Error deleting ${user.email}:`, deleteError.message);
        } else {
          console.log(`✅ Deleted ${user.email}`);
        }
      } catch (err) {
        console.error(`🔥 Unexpected error deleting ${user.email}:`, err);
      }
    }

    return true;
  } catch (error) {
    console.error('Error in deleteExistingUsers:', error);
    return false;
  }
}

async function createUsers() {
  console.log(`🚀 Starting bulk creation of ${users.length} users...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const user of users) {
    try {
      console.log(`Creating: ${user.email}`);
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email.trim().toLowerCase(),
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name
        }
      });

      if (authError) {
        console.error(`❌ Error creating ${user.email}:`, authError.message);
        errorCount++;
        continue;
      }

      console.log(`✅ Created ${user.email} with ID: ${authData.user?.id}`);
      successCount++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (err) {
      console.error(`🔥 Unexpected error for ${user.email}:`, err);
      errorCount++;
    }
  }
  
  console.log('\n=== Summary ===');
  console.log(`✅ Successfully created: ${successCount} users`);
  console.log(`❌ Failed to create: ${errorCount} users`);
  console.log('Bulk user creation completed!');
}

async function main() {
  console.log('🔄 Starting user recreation process...');
  
  // First delete existing users
  const deleteSuccess = await deleteExistingUsers();
  
  if (!deleteSuccess) {
    console.error('❌ Failed to delete existing users. Stopping.');
    process.exit(1);
  }

  // Wait a moment for deletions to complete
  console.log('⏳ Waiting for deletions to complete...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Then create new users
  await createUsers();
}

main().catch(console.error);
