
CREATE TABLE public.claimed_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reward_type text NOT NULL, -- 'task' or 'gift'
  reward_id text NOT NULL, -- task/gift identifier
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, reward_type, reward_id)
);

ALTER TABLE public.claimed_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own claims"
ON public.claimed_rewards FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own claims"
ON public.claimed_rewards FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());
