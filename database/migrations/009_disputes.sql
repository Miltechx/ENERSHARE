-- Disputes table
CREATE TABLE public.disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
  raised_by UUID REFERENCES public.profiles(id) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'rejected')),
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Admin dispute resolution endpoint
CREATE INDEX idx_disputes_transaction ON public.disputes(transaction_id);
CREATE INDEX idx_disputes_status ON public.disputes(status);
