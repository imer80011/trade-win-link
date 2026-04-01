
CREATE OR REPLACE FUNCTION public.handle_transaction_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only act when status changes to completed or rejected
  IF OLD.status = 'pending' AND NEW.status IN ('completed', 'rejected') THEN
    IF NEW.status = 'completed' THEN
      IF NEW.type = 'deposit' THEN
        UPDATE public.profiles
        SET balance = COALESCE(balance, 0) + NEW.amount,
            total_deposits = COALESCE(total_deposits, 0) + NEW.amount
        WHERE user_id = NEW.user_id;
      ELSIF NEW.type = 'withdraw' THEN
        UPDATE public.profiles
        SET balance = COALESCE(balance, 0) - NEW.amount
        WHERE user_id = NEW.user_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_transaction_status_change
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_transaction_approval();
