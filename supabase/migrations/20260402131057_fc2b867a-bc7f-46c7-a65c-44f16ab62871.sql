
CREATE OR REPLACE FUNCTION public.notify_transaction_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status IN ('completed', 'rejected') THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      CASE
        WHEN NEW.status = 'completed' AND NEW.type = 'deposit' THEN 'تمت الموافقة على الإيداع'
        WHEN NEW.status = 'completed' AND NEW.type = 'withdraw' THEN 'تمت الموافقة على السحب'
        WHEN NEW.status = 'rejected' AND NEW.type = 'deposit' THEN 'تم رفض طلب الإيداع'
        WHEN NEW.status = 'rejected' AND NEW.type = 'withdraw' THEN 'تم رفض طلب السحب'
        ELSE 'تحديث معاملة'
      END,
      CASE
        WHEN NEW.status = 'completed' THEN 'تمت الموافقة على طلبك بمبلغ $' || NEW.amount::text || ' ✅'
        ELSE 'تم رفض طلبك بمبلغ $' || NEW.amount::text || ' ❌'
      END,
      CASE WHEN NEW.status = 'completed' THEN 'approved' ELSE 'rejected' END
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_transaction_status_change ON public.transactions;
CREATE TRIGGER on_transaction_status_change
  AFTER UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_transaction_status();
