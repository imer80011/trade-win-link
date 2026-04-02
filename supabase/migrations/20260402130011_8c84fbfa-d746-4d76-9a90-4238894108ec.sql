
ALTER TABLE public.transactions DROP CONSTRAINT transactions_type_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check CHECK (type = ANY (ARRAY['deposit'::text, 'withdraw'::text, 'trade'::text, 'reward'::text]));

ALTER TABLE public.transactions DROP CONSTRAINT transactions_status_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_status_check CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'rejected'::text]));
