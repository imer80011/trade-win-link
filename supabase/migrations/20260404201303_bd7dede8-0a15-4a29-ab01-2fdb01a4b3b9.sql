
-- Create referrals table to track who referred whom
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  reward_amount numeric DEFAULT 0,
  reward_paid boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Referrer can see their own referrals
CREATE POLICY "Users can view referrals they made"
ON public.referrals FOR SELECT TO authenticated
USING (referrer_id = auth.uid());

-- Admins can view all
CREATE POLICY "Admins can view all referrals"
ON public.referrals FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- System inserts via trigger (SECURITY DEFINER), but allow authenticated insert for safety
CREATE POLICY "System can insert referrals"
ON public.referrals FOR INSERT TO authenticated
WITH CHECK (true);

-- Replace handle_new_user to process referral codes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _referrer_id uuid;
  _ref_code text;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, display_name, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    substring(md5(NEW.id::text || now()::text) from 1 for 8)
  );

  -- Process referral code if provided
  _ref_code := NEW.raw_user_meta_data->>'referral_code';
  IF _ref_code IS NOT NULL AND _ref_code != '' THEN
    SELECT user_id INTO _referrer_id FROM public.profiles WHERE referral_code = _ref_code;
    IF _referrer_id IS NOT NULL AND _referrer_id != NEW.id THEN
      -- Link the referred user
      UPDATE public.profiles SET referred_by = _referrer_id WHERE user_id = NEW.id;
      -- Increment referrer's count
      UPDATE public.profiles SET total_referrals = COALESCE(total_referrals, 0) + 1 WHERE user_id = _referrer_id;
      -- Record the referral
      INSERT INTO public.referrals (referrer_id, referred_id) VALUES (_referrer_id, NEW.id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Function to reward referrer when referred user makes a deposit
CREATE OR REPLACE FUNCTION public.handle_referral_reward()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _referrer_id uuid;
  _reward numeric;
BEGIN
  -- Only on completed deposits
  IF NEW.type = 'deposit' AND NEW.status = 'completed' THEN
    -- Check if user was referred
    SELECT referred_by INTO _referrer_id FROM public.profiles WHERE user_id = NEW.user_id;
    IF _referrer_id IS NOT NULL THEN
      -- 10% referral commission
      _reward := NEW.amount * 0.10;
      -- Add reward transaction for referrer
      INSERT INTO public.transactions (user_id, type, amount, status, detail)
      VALUES (_referrer_id, 'reward', _reward, 'completed', 'عمولة إحالة من إيداع مستخدم');
      -- Update referral record
      UPDATE public.referrals 
      SET reward_amount = COALESCE(reward_amount, 0) + _reward, reward_paid = true
      WHERE referrer_id = _referrer_id AND referred_id = NEW.user_id;
      -- Send notification to referrer
      INSERT INTO public.notifications (user_id, title, message, type)
      VALUES (_referrer_id, 'مكافأة إحالة! 🎉', 'حصلت على $' || _reward::text || ' عمولة إحالة من إيداع أحد المدعوين', 'reward');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for referral rewards on transaction status change
CREATE TRIGGER on_transaction_referral_reward
AFTER UPDATE ON public.transactions
FOR EACH ROW
WHEN (OLD.status = 'pending' AND NEW.status = 'completed')
EXECUTE FUNCTION public.handle_referral_reward();

-- Also trigger on direct completed inserts (like trade profits)
CREATE TRIGGER on_transaction_insert_referral_reward
AFTER INSERT ON public.transactions
FOR EACH ROW
WHEN (NEW.status = 'completed' AND NEW.type = 'deposit')
EXECUTE FUNCTION public.handle_referral_reward();
