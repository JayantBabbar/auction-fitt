
import { createClient } from '@supabase/supabase-js'
import users from './users_bulk_create.json'
import 'dotenv/config'

// Verify environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Environment check:')
console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set (length: ' + supabaseServiceKey.length + ')' : 'Missing')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createUsers() {
  console.log(`Starting bulk creation of ${users.length} users...`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const user of users) {
    try {
      console.log(`Attempting to create: ${user.email}`)
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name
        }
      })

      if (authError) {
        console.error(`❌ Error creating ${user.email}:`, authError.message)
        console.error('Full error:', authError)
        errorCount++
        continue
      }

      console.log(`✅ Created ${user.email} with ID: ${authData.user?.id}`)
      successCount++

    } catch (err) {
      console.error(`🔥 Unexpected error for ${user.email}:`, err)
      errorCount++
    }
  }
  
  console.log('\n=== Summary ===')
  console.log(`✅ Successfully created: ${successCount} users`)
  console.log(`❌ Failed to create: ${errorCount} users`)
  console.log('Bulk user creation completed!')
}

createUsers()
