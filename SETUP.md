# DysLexia Support Platform - Setup Guide

## 🚀 Quick Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Choose your organization and fill in project details:
   - **Name**: DysLexia Support Platform
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your location
4. Wait for the project to be created (2-3 minutes)

### Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 3: Update Environment Variables

1. Open `dyslexia-frontend/.env` file
2. Replace the placeholder values:

```env
# Replace these with your actual Supabase values
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# App Configuration (keep these as is)
VITE_APP_NAME=DysLexia Support Platform
VITE_APP_URL=http://localhost:3000
```

### Step 4: Set Up Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire content from `supabase-setup.sql`
4. Click **Run** to execute the SQL

This will create:
- `profiles` table for user information
- `game_results` table for assessment results
- Row Level Security policies
- Automatic triggers for user creation

### Step 5: Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Try creating an account:
   - Click "Get Started" or go to `/auth`
   - Click "Create a new account"
   - Fill in the form and submit

### Step 6: Create Admin Account (Optional)

To create an admin account:
1. Sign up with email: `admin@dyslexia.com`
2. This will automatically be marked as admin
3. Or manually update any user in the database:
   ```sql
   UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';
   ```

## 🔧 Troubleshooting

### Common Issues:

#### 1. "Invalid API key" error
- Double-check your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Make sure there are no extra spaces or quotes
- Restart the dev server after changing `.env`

#### 2. "Table doesn't exist" error
- Make sure you ran the SQL setup script in Supabase
- Check the **Table Editor** in Supabase to see if tables were created

#### 3. "Row Level Security" error
- The SQL script should handle this automatically
- If issues persist, you can temporarily disable RLS for testing:
  ```sql
  ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
  ALTER TABLE game_results DISABLE ROW LEVEL SECURITY;
  ```

#### 4. Signup works but login fails
- Check browser console for errors
- Verify email confirmation (check your email)
- In Supabase, go to **Authentication** → **Settings** and disable email confirmation for testing

### Development Tips:

1. **View Users**: Go to Supabase → **Authentication** → **Users**
2. **View Data**: Go to Supabase → **Table Editor**
3. **Check Logs**: Go to Supabase → **Logs** → **Auth**
4. **Browser Console**: Press F12 to see detailed error messages

## 🎯 Next Steps

Once setup is complete:
1. Test user registration and login
2. Try accessing the dashboard
3. Test the admin panel (if you created an admin account)
4. Explore the game pages (currently showing "Coming Soon")

## 📞 Need Help?

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Check Supabase logs in the dashboard
3. Verify your `.env` file has the correct values
4. Make sure the SQL setup script ran successfully

The most common issue is incorrect Supabase credentials, so double-check those first!