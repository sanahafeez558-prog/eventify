-- =========================================================
-- 0007_add_username_phone.sql
-- Add separate username, country_code, and phone columns to profiles
-- =========================================================

alter table public.profiles add column if not exists username text unique;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists country_code text default '+92';

-- Update handle_new_user trigger to populate username, phone, country_code from user metadata
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email, username, phone, country_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    nullif(new.raw_user_meta_data ->> 'username', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'country_code', ''), '+92')
  );
  return new;
end;
$$;
