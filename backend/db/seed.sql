-- ============================================================
-- TravelVerse Pass — Seed Data (Destinasi Wisata Indonesia)
-- ============================================================
-- Jalankan setelah `schema.sql` di Supabase SQL Editor.
-- ============================================================

insert into destinations (name, description, location_lat, location_lng, image_url) values
  (
    'Candi Borobudur',
    'Candi Buddha terbesar di dunia, warisan UNESCO. Magelang, Jawa Tengah.',
    -7.60790, 110.20380,
    'https://assets-a1.kompasiana.com/items/album/2023/11/07/borobudur-654a47837a39d51a9d385b93.jpg'
  ),
  (
    'Gunung Bromo',
    'Gunung berapi aktif dengan pemandangan sunrise legendaris. Probolinggo, Jawa Timur.',
    -7.94250, 112.95300,
    'https://i.pinimg.com/736x/78/91/60/7891603cf5fd03a69a3afa598ca83c5e.jpg'
  ),
  (
    'Pantai Kuta',
    'Pantai ikonik dengan ombak surfing terbaik. Badung, Bali.',
    -8.71830, 115.16860,
    'https://sewabusbali.com/wp-content/uploads/2020/01/kuta-beach.jpg'
  ),
  (
    'Danau Toba',
    'Danau vulkanik terbesar di Asia Tenggara. Sumatera Utara.',
    2.61500, 98.83400,
    'https://media.istockphoto.com/id/2217463770/photo/panoramic-view-of-lake-toba-at-sunset.jpg?s=612x612&w=0&k=20&c=ay2JBJFac7AF9MpXioMb82mRdk1sFje9E530LANfq7Q='
  ),
  (
    'Raja Ampat',
    'Surga diving dengan biodiversitas laut tertinggi di dunia. Papua Barat.',
    -0.50000, 130.50000,
    'https://images.squarespace-cdn.com/content/v1/58b0060af7e0ab1f6f73a4a4/1489295468571-XGHBS1E28W331IKVD1HP/raja-ampat-islands.jpg'
  ),
  (
    'Tana Toraja',
    'Budaya unik dengan rumah adat Tongkonan. Sulawesi Selatan.',
    -3.07000, 119.84000,
    'https://theworldtravelguy.com/wp-content/uploads/2020/10/DSCF6755-2.jpg'
  ),
  (
    'Komodo Island',
    'Habitat asli komodo & taman nasional UNESCO. NTT.',
    -8.55000, 119.48000,
    'https://static.saltinourhair.com/wp-content/uploads/2018/10/23125631/komodo-islands-flores-1862x1440.jpg'
  ),
  (
    'Candi Prambanan',
    'Kompleks candi Hindu terbesar di Indonesia. Yogyakarta.',
    -7.75200, 110.49150,
    'https://static.promediateknologi.id/crop/0x0:0x0/0x0/webp/photo/p2/202/2025/11/26/IMG_1176-3276691579.jpeg'
  );
