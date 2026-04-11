-- Add message read tracking
alter table messages add column message_read_at timestamptz null;

-- Track per-user conversation read status
create table conversation_reads (
  conversation_id uuid references conversations(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  last_read_at timestamptz default now(),
  primary key (conversation_id, user_id)
);

-- Indexes for fast queries
create index on messages(conversation_id, sender_id);
create index on conversation_reads(user_id, last_read_at);

-- Add email digest opt-in to profiles
alter table profiles add column email_digest_opt_in boolean default true;

-- Enable RLS on conversation_reads
alter table conversation_reads enable row level security;

create policy "conversation_reads own read" on conversation_reads for select
  using (user_id = auth.uid());

create policy "conversation_reads own write" on conversation_reads for insert
  with check (user_id = auth.uid());

create policy "conversation_reads own update" on conversation_reads for update
  using (user_id = auth.uid());
