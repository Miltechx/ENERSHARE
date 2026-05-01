-- Referrals table
CREATE TABLE public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral uses table
CREATE TABLE public.referral_uses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  bonus_paid BOOLEAN DEFAULT false
);

-- Function to add referral bonus
CREATE OR REPLACE FUNCTION add_referral_bonus(user_id_param UUID, amount DECIMAL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.wallets
  SET demo_credits = demo_credits + amount,
      updated_at = NOW()
  WHERE user_id = user_id_param;
END;
$$;

-- Create index for faster lookups
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX idx_referral_uses_user ON public.referral_uses(user_id);
CREATE INDEX idx_referral_uses_referrer ON public.referral_uses(referrer_id);
