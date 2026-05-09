alter table public.children
  add column if not exists status text not null default 'active' check (status in ('active', 'archived')),
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references auth.users(id) on delete set null;

create index if not exists children_family_status_idx on public.children (family_id, status);

drop policy if exists "parent delete child attempts" on public.practice_attempts;
create policy "parent delete child attempts" on public.practice_attempts
  for delete
  using (family_id = public.current_family_id() and public.current_user_role() = 'parent');

drop policy if exists "parent delete child sessions" on public.practice_sessions;
create policy "parent delete child sessions" on public.practice_sessions
  for delete
  using (family_id = public.current_family_id() and public.current_user_role() = 'parent');

drop policy if exists "parent delete child rewards" on public.rewards;
create policy "parent delete child rewards" on public.rewards
  for delete
  using (family_id = public.current_family_id() and public.current_user_role() = 'parent');
