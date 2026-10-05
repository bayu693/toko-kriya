# LAPORAN PROYEK — WEBSITE E-COMMERCE TOKO KRIYA SIDOARJO

**Mata kuliah:** Pemrograman Web · **Tahun:** 2026

---

## 1. Wireframe & Moodboard

**Moodboard (Desain)**
- **Warna utama (Teal):** `#0d9488` (aksen `#0f766e`, latar lembut `#ccfbf1`)
- **Aksen kayu (kriya):** `#8b5a2b` / `#6b4423`
- **Neutral:** latar `#f8fafc`, kartu `#ffffff`, teks `#1f2937`
- **Font:** Poppins (heading) + Open Sans (body) — konsisten seluruh halaman
- **Gaya:** Minimalis modern, mobile-first, kartu membulat (radius 14–20px)

**Wireframe (terdapat di `wireframe.html`, versi mobile sesuai sketsa Figma)**
1. **Home** — navbar, banner slider, kategori, produk unggulan
2. **Katalog** — grid 2 kolom (mobile) → 5 kolom (desktop), filter kategori + search
3. **Detail Produk** — foto, nama, deskripsi, harga, jumlah, tombol tambah keranjang
4. **Cart** — daftar produk, qty +/−, subtotal, ongkir, total, tombol checkout
5. **Checkout** — form pemesan, ringkasan, total, konfirmasi
   (+ Login, Register, Panel Admin)

Wireframe interaktif bisa dibuka di browser dan tiap kartu tertaut ke halaman aslinya. Moodboard visual di `moodboard.html`.

---

## 2. User Flow

```
LOGIN / REGISTER
       ↓
     HOME  →  KATALOG PRODUK
                  ↓
            DETAIL PRODUK
                  ↓
          TAMBAH KE KERANJANG
                  ↓
                CART
                  ↓
              CHECKOUT
                  ↓
           PESANAN SELESAI

Admin: LOGIN ADMIN → Panel Admin
       → Kelola Produk (tambah/edit/hapus)
       → Kelola Pesanan (ubah status) + Data Pengguna
```

Data antara halaman terhubung lewat **localStorage**: produk, keranjang, pesanan, sesi login. Perubahan produk oleh admin langsung tersinkron ke katalog/home.

**Daftar halaman (10):** `index.html`, `katalog.html`, `detail.html`, `cart.html`, `checkout.html`, `login.html`, `register.html`, `admin.html`, `wireframe.html`, `moodboard.html`.

**Kredensial demo:** Admin `admin@kriya.com` / `admin123` (button "Login sebagai Admin" di halaman login).

---

## 3. Kendala yang Dihadapi

| Kendala | Solusi |
|---|---|
| Gambar produk asli tidak tersedia | Membuat **SVG placeholder** ilustrasi di `assets/gambar-produk/` |
| Murni frontend tanpa server/database | Menggunakan **localStorage** sebagai penyimpanan data |
| HTML/CSS harus murni sesuai tugas + mau CEPAT | **Tailwind CSS CDN** + `css/style.css` (kustomisasi warna kriya) |
| Menjaga 10 halaman tetap konsisten | Navbar, warna, font, dan card dipakai seragam dari `style.css` |
| Responsive (bobot 15%) tidak berantakan | Pendekatan **mobile-first**: grid 2 kolom → 4–5 kolom, hamburger menu, media query |
| Sintaks JS tidak bisa diuji (tanpa Node) | Sanity-check keseimbangan blok script + uji HTTP 200 semua halaman/aset |

**Testing yang dilakukan:** semua 10 halaman terbuka (status 200), CSS/JS/asset termuat, referensi & tautan antar halaman valid, keseimbangan tag HTML benar, grid responsive diubah sesuai breakpoint mobile/tablet/desktop.