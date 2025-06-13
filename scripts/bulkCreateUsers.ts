import { createClient } from '@supabase/supabase-js'
import users from './users_bulk_create.json' // path to your JSON file
import 'dotenv/config' // to load from .env file

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createUsers() {
  for (const user of users) {
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true
      })

      if (authError) {
        console.error(`❌ Error creating ${user.email}:`, authError.message)
        continue
      }

      const { id } = authData.user

      const { error: profileError } = await supabase
        .from('profile')
        .insert({
          id,
          name: user.name,
          email: user.email,
          role: user.role
        })

      if (profileError) {
        console.error(`⚠️ Profile insert failed for ${user.email}:`, profileError.message)
      } else {
        console.log(`✅ Created ${user.email} with profile`)
      }

    } catch (err) {
      console.error(`🔥 Unexpected error for ${user.email}:`, err)
    }
  }
}

createUsers()
