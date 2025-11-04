-- Add theme column to companies table
ALTER TABLE public.companies 
ADD COLUMN theme TEXT NOT NULL DEFAULT 'moderno';

-- Add check constraint for allowed theme values
ALTER TABLE public.companies
ADD CONSTRAINT companies_theme_check 
CHECK (theme IN ('moderno', 'classico', 'vibrante', 'minimalista', 'rosa', 'neon'));

-- Create index for better performance
CREATE INDEX idx_companies_theme ON public.companies(theme);

-- Add comment for documentation
COMMENT ON COLUMN public.companies.theme IS 'Visual theme of the company: moderno, classico, vibrante, minimalista, rosa, or neon';