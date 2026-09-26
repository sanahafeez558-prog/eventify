-- ---------- auto confirm email on signup for capstone demo ----------
-- Automatically populates email_confirmed_at so users can sign up and
-- immediately log in without requiring a third-party SMTP server or
-- hitting Supabase email rate limits.

create or replace function public.auto_confirm_user()
returns trigger language plpgsql security definer as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
    new.confirmed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_auto_confirm_user on auth.users;
create trigger trg_auto_confirm_user
  before insert on auth.users
  for each row execute function public.auto_confirm_user();
