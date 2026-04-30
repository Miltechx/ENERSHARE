-- Run this in Supabase SQL Editor
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE public.wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) UNIQUE NOT NULL,
  demo_credits DECIMAL(12,2) DEFAULT 5000
);

CREATE TABLE public.energy_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount_kwh DECIMAL(10,2) NOT NULL,
  price_per_kwh_ngn DECIMAL(10,2) NOT NULL
);
