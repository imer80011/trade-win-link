
DROP POLICY "System can insert referrals" ON public.referrals;
CREATE POLICY "Users can insert own referrals"
ON public.referrals FOR INSERT TO authenticated
WITH CHECK (referrer_id = auth.uid());
