-- Create security definer functions to break RLS recursion

-- Function to check if user participates in a meeting
CREATE OR REPLACE FUNCTION public.user_participates_in_meeting(_meeting_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.meeting_participants
    WHERE meeting_id = _meeting_id
      AND user_id = _user_id
  )
$$;

-- Function to check if user can manage a meeting (owner or gestor)
CREATE OR REPLACE FUNCTION public.can_manage_meeting(_meeting_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.meetings m
    WHERE m.id = _meeting_id
      AND m.company_id = (SELECT company_id FROM public.profiles WHERE id = _user_id)
      AND (is_owner(_user_id) OR has_role(_user_id, 'gestor'::app_role))
  )
$$;

-- Drop problematic recursive policies on meetings
DROP POLICY IF EXISTS "Vendedores can view meetings they participate in" ON public.meetings;
DROP POLICY IF EXISTS "Vendedores can update their meeting feedback" ON public.meetings;

-- Recreate meetings policies using security definer functions
CREATE POLICY "Vendedores can view meetings they participate in"
ON public.meetings FOR SELECT
USING (
  has_role(auth.uid(), 'vendedor'::app_role)
  AND user_participates_in_meeting(id, auth.uid())
);

CREATE POLICY "Vendedores can update their meeting feedback"
ON public.meetings FOR UPDATE
USING (
  has_role(auth.uid(), 'vendedor'::app_role)
  AND user_participates_in_meeting(id, auth.uid())
);

-- Drop problematic recursive policies on meeting_participants
DROP POLICY IF EXISTS "Users can view participants of meetings they can access" ON public.meeting_participants;
DROP POLICY IF EXISTS "Owners and gestores can manage participants" ON public.meeting_participants;

-- Recreate meeting_participants policies without recursion
CREATE POLICY "Users can view participants of meetings they can access"
ON public.meeting_participants FOR SELECT
USING (
  can_manage_meeting(meeting_id, auth.uid())
  OR user_id = auth.uid()
);

CREATE POLICY "Owners and gestores can manage participants"
ON public.meeting_participants FOR ALL
USING (
  can_manage_meeting(meeting_id, auth.uid())
)
WITH CHECK (
  can_manage_meeting(meeting_id, auth.uid())
);

-- Allow meeting creators to manage participants
CREATE POLICY "Meeting creator can manage participants"
ON public.meeting_participants FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.meetings
    WHERE id = meeting_participants.meeting_id
    AND created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.meetings
    WHERE id = meeting_participants.meeting_id
    AND created_by = auth.uid()
  )
);