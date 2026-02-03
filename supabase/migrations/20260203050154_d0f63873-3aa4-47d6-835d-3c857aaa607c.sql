-- Create activities table for storing all activity types
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Running & Swimming fields
  distance DECIMAL,
  time INTEGER,
  feeling INTEGER,
  
  -- Strength specific fields
  name TEXT,
  reps INTEGER,
  sets INTEGER,
  duration INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Temporary public access policy (until authentication is added)
CREATE POLICY "Allow public read access" 
ON public.activities 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert" 
ON public.activities 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update" 
ON public.activities 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete" 
ON public.activities 
FOR DELETE 
USING (true);