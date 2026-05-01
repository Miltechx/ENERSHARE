-- Security logs table
CREATE TABLE public.security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  ip_address TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast querying
CREATE INDEX idx_security_logs_event ON public.security_logs(event_type);
CREATE INDEX idx_security_logs_user ON public.security_logs(user_id);
CREATE INDEX idx_security_logs_created ON public.security_logs(created_at DESC);
