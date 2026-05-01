-- KYC submissions table
CREATE TABLE public.kyc_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nin TEXT,
  bvn TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT
);

-- Encrypt sensitive data (PostgreSQL pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add admin flag to profiles
ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- Set a specific user as admin (replace with your email)
UPDATE public.profiles SET is_admin = true WHERE email = 'your-email@example.com';
