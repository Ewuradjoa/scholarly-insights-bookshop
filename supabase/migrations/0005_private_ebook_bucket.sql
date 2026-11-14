-- Keep purchased ebooks out of the public website and source repository.
-- There are deliberately no public read policies on this bucket; the server
-- creates short-lived signed links only after checking a paid order.
insert into storage.buckets (id, name, public)
values ('ebooks', 'ebooks', false)
on conflict (id) do update set public = false;
