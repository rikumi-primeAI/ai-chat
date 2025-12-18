-- subscriptions テーブル
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id text unique not null,
  stripe_customer_id text unique,
  stripe_subscription_id text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'max')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due')),
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- インデックス
create index if not exists subscriptions_user_id_idx on subscriptions(user_id);
create index if not exists subscriptions_stripe_customer_id_idx on subscriptions(stripe_customer_id);

-- updated_at を自動更新するトリガー
create trigger update_subscriptions_updated_at
  before update on subscriptions
  for each row
  execute function update_updated_at_column();
