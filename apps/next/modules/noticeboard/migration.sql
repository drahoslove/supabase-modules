create table
  public.noticeboard_items (
    id uuid not null default gen_random_uuid (),
    created_at timestamp
    with time zone not null default now (),
    title text null,
    message text not null,
    level text not null,
    visible boolean not null default true,
    closable boolean not null default true,
    constraint noticeboard_items_pkey primary key (id)
  ) tablespace pg_default;

create table
  public.noticeboard_interactions (
    item_id uuid not null default gen_random_uuid (),
    user_id uuid not null default gen_random_uuid (),
    closed_at timestamp without time zone null,
    viewed_at timestamp without time zone null,
    constraint noticeboard_interactions_pkey primary key (item_id, user_id),
    constraint public_noticeboard_interactions_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
    constraint public_noticeboard_interactions_item_id_fkey foreign key (item_id) references noticeboard_items (id) on delete cascade
  ) tablespace pg_default;