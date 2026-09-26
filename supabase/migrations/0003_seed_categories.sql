-- =========================================================
-- 0003_seed_categories.sql
-- =========================================================
insert into public.categories (name, description, icon)
values
  ('Technology', 'Tech talks, hackathons, and software engineering workshops', 'Laptop'),
  ('Business', 'Entrepreneurship, startups, and management seminars', 'Briefcase'),
  ('Education', 'Academic lectures, tutorials, and study groups', 'GraduationCap'),
  ('Networking', 'Social mixers, career meetups, and industry roundtables', 'Users'),
  ('Workshops', 'Hands-on skill building, creative studios, and masterclasses', 'Wrench'),
  ('Entertainment', 'Music performances, comedy shows, and film screenings', 'Film'),
  ('Sports', 'Campus tournaments, fitness runs, and friendly matches', 'Trophy'),
  ('Community', 'Volunteer drives, campus causes, and cultural festivals', 'Heart')
on conflict (name) do update
set
  description = excluded.description,
  icon = excluded.icon;
