-- ============================================================
-- TravelVerse Pass — Update Image URLs untuk existing rows
-- ============================================================
-- Jalankan di Supabase SQL Editor kalau seed.sql sudah pernah
-- di-run dengan URL placeholder/Wikipedia.
-- ============================================================

update destinations set image_url = 'https://assets-a1.kompasiana.com/items/album/2023/11/07/borobudur-654a47837a39d51a9d385b93.jpg'
  where name = 'Candi Borobudur';

update destinations set image_url = 'https://i.pinimg.com/736x/78/91/60/7891603cf5fd03a69a3afa598ca83c5e.jpg'
  where name = 'Gunung Bromo';

update destinations set image_url = 'https://sewabusbali.com/wp-content/uploads/2020/01/kuta-beach.jpg'
  where name = 'Pantai Kuta';

update destinations set image_url = 'https://media.istockphoto.com/id/2217463770/photo/panoramic-view-of-lake-toba-at-sunset.jpg?s=612x612&w=0&k=20&c=ay2JBJFac7AF9MpXioMb82mRdk1sFje9E530LANfq7Q='
  where name = 'Danau Toba';

update destinations set image_url = 'https://images.squarespace-cdn.com/content/v1/58b0060af7e0ab1f6f73a4a4/1489295468571-XGHBS1E28W331IKVD1HP/raja-ampat-islands.jpg'
  where name = 'Raja Ampat';

update destinations set image_url = 'https://theworldtravelguy.com/wp-content/uploads/2020/10/DSCF6755-2.jpg'
  where name = 'Tana Toraja';

update destinations set image_url = 'https://static.saltinourhair.com/wp-content/uploads/2018/10/23125631/komodo-islands-flores-1862x1440.jpg'
  where name = 'Komodo Island';

update destinations set image_url = 'https://static.promediateknologi.id/crop/0x0:0x0/0x0/webp/photo/p2/202/2025/11/26/IMG_1176-3276691579.jpeg'
  where name = 'Candi Prambanan';

-- Verify
select id, name, image_url from destinations order by id;
