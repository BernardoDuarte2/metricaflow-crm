-- Add updated_at column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();