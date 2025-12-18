-- conversations テーブル
create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  title text not null default '新しいチャット',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- messages テーブル
create table if not exists messages (
  id text primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- インデックス
create index if not exists conversations_user_id_idx on conversations(user_id);
create index if not exists conversations_created_at_idx on conversations(created_at desc);
create index if not exists messages_conversation_id_idx on messages(conversation_id);
create index if not exists messages_created_at_idx on messages(created_at);

-- Row Level Security (RLS)
alter table conversations enable row level security;
alter table messages enable row level security;

-- RLS ポリシー: ユーザーは自分の会話のみアクセス可能
create policy "Users can view own conversations"
  on conversations for select
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users can insert own conversations"
  on conversations for insert
  with check (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users can update own conversations"
  on conversations for update
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users can delete own conversations"
  on conversations for delete
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- RLS ポリシー: ユーザーは自分の会話のメッセージのみアクセス可能
create policy "Users can view own messages"
  on messages for select
  using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

create policy "Users can insert own messages"
  on messages for insert
  with check (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

create policy "Users can delete own messages"
  on messages for delete
  using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- updated_at を自動更新するトリガー
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_conversations_updated_at
  before update on conversations
  for each row
  execute function update_updated_at_column();
