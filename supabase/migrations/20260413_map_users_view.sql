-- map_users view: exposes users with coordinates rounded to ~10km for privacy
create or replace view map_users as
  select
    id,
    full_name,
    role,
    status,
    avatar_url,
    round(lat::numeric, 2)::float8 as lat,
    round(lng::numeric, 2)::float8 as lng,
    is_verified
  from profiles
  where is_open_to_match = true
    and lat is not null
    and lng is not null;

-- Allow public read access (same as profiles table)
grant select on map_users to anon, authenticated;
