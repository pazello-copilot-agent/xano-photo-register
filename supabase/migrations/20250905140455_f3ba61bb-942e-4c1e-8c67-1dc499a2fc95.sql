-- Create storage bucket for photos
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true);

-- Create policy for public access to photos bucket
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'photos' );

-- Create policy for public uploads to photos bucket
create policy "Public Upload"
on storage.objects for insert
with check ( bucket_id = 'photos' );