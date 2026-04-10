
ALTER TABLE public.profiles
ADD COLUMN wallet_address text DEFAULT NULL,
ADD COLUMN withdraw_password text DEFAULT NULL;
