
CREATE OR REPLACE FUNCTION public.handle_transaction_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    IF NEW.type = 'trade' THEN
      UPDATE public.profiles
      SET total_trades = COALESCE(total_trades, 0) + 1,
          total_profits = COALESCE(total_profits, 0) + NEW.amount
      WHERE user_id = NEW.user_id;
    ELSIF NEW.type = 'deposit' THEN
      UPDATE public.profiles
      SET balance = COALESCE(balance, 0) + NEW.amount,
          total_deposits = COALESCE(total_deposits, 0) + NEW.amount
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_transaction_insert
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_transaction_insert();
