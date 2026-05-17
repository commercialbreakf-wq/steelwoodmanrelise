-- CRM Leads Table Schema
-- Reference for Supabase table structure

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    message TEXT,
    type TEXT DEFAULT 'callback',
    status TEXT DEFAULT 'new', -- 'new', 'in_progress', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow public to insert leads (for contact forms)
CREATE POLICY "Enable insert for everyone" ON public.leads
    FOR INSERT WITH CHECK (true);

-- Allow admins to do everything
-- Note: Replace 'admin' with your actual admin role check if different
CREATE POLICY "Admins can do everything" ON public.leads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_id = auth.uid()
            AND users.role = 'admin'
        )
    );
