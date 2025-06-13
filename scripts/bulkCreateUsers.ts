
import { createClient } from '@supabase/supabase-js'
import users from './users_bulk_create.json'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createUsers() {
  console.log(`Starting bulk creation of ${users.length} users...`)
  
  for (const user of users) {
    try {
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
        continue
      }

      console.log(`✅ Created ${user.email} with profile`)

    } catch (err) {
      console.error(`🔥 Unexpected error for ${user.email}:`, err)
    }
  }
  
  console.log('Bulk user creation completed!')
}

createUsers()
