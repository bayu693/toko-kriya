/* ================================================
   TOKO KRIYA SIDOARJO — script.js
   Data disimpan di localStorage (front-end demo)
   ================================================ */

/* ---------------- produk default ---------------- */
const DEFAULT_PRODUCTS = [
  { id: 1, nama: "Tas Anyaman Bambu", kategori: "Anyaman", harga: 85000, stok: 12, deskripsi: "Tas anyaman bambu khas Sidoarjo yang dibuat sepenuhnya dengan tangan oleh pengrajin lokal. Ringan, kuat, dan tahan lama. Cocok untuk gaya sehari-hari maupun hadiah khas daerah.", img: "tas-anyaman.svg" },
  { id: 2, nama: "Meja Kayu Jati", kategori: "Furniture", harga: 120000, stok: 8, deskripsi: "Meja kayu jati berkualitas dengan motif serat alami khas Jawa Timur. Dikerjakan oleh pengrajin kayu berpengalaman, kokoh dan cocok untuk ruang tamu maupun ruang kerja.", img: "meja-kayu.svg" },
  { id: 3, nama: "Batik Tulis Sidoarjo", kategori: "Batik", harga: 250000, stok: 20, deskripsi: "Kain batik tulis asli Sidoarjo dengan pewarnaan alami dan motif khas. Setiap helai berbeda karena pengerjaan manual oleh perajin batik.", img: "batik.svg" },
  { id: 5, nama: "Tas Rotan", kategori: "Anyaman", harga: 95000, stok: 10, deskripsi: "Tas rotan dengan anyaman rapat dan kokoh. Nyaman digunakan, model timeless yang cocok dengan berbagai gaya busana.", img: "tas-rotan.svg" },
  { id: 6, nama: "Boneka Kain Perca", kategori: "Aksesoris", harga: 45000, stok: 25, deskripsi: "Boneka lucu dari kain perca sisa produksi, ramah lingkungan. Dibuat kreatif oleh ibu-ibu pengrajin di Sidoarjo.", img: "boneka.svg" },
  { id: 7, nama: "Kipas Mini Kriya", kategori: "Aksesoris", harga: 35000, stok: 30, deskripsi: "Kipas mini dengan bingkai kayu dan anyaman, praktis dibawa ke mana saja. Kerajinan tangan bernuansa tradisional.", img: "kipas.svg" },
  { id: 8, nama: "Gantungan Kunci Kulit", kategori: "Aksesoris", harga: 25000, stok: 40, deskripsi: "Gantungan kunci dari kulit asli. Cocok sebagai suvenir dan oleh-oleh khas Sidoarjo.", img: "gantungan.svg" },
  { id: 9, nama: "Dompet Kulit", kategori: "Aksesoris", harga: 135000, stok: 14, deskripsi: "Dompet kulit jahit tangan dengan desain minimalis dan jahitan kuat. Awet dan semakin cantik seiring pemakaian.", img: "dompet.svg" },
];

const CATEGORIES = ["Semua", "Anyaman", "Furniture", "Batik", "Aksesoris"];

const ADMIN_CRED = { email: "admin@gmail.com", password: "admin123" };

/* ---------------- storage helpers ---------------- */
/* Triple-mode storage agar data keranjang & pesanan andal meski dibuka
   langsung lewat file:// (double click):
   1. localStorage  -> persist normal (http://, kebanyakan browser)
   2. cookie        -> persist lintas halaman saat localStorage terblokir (file://)
   3. in-memory     -> cadangan terakhir saat cookie pun diblokir */
const _memStore = {};

function _cookieSet(k, v) {
  try { document.cookie = k + "=" + encodeURIComponent(v) + ";path=/;max-age=2592000"; } catch {}
}
function _cookieGet(k) {
  try {
    const m = document.cookie.match(new RegExp("(?:^|; )" + k + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : null;
  } catch { return null; }
}

const store = {
  get: (k, d) => {
    let local = null, localOk = false;
    try {
      const v = localStorage.getItem(k);
      if (v !== null) { local = JSON.parse(v); localOk = true; }
    } catch {}
    const c = _cookieGet(k);
    let cookie = null;
    if (c !== null) { try { cookie = JSON.parse(c); } catch {} }
    /* Prioritas: ambil data yang paling "berisi". Ini mengatasi kasus
       localStorage tertinggal berisi array kosong/lama, sedangkan cookie
       membawa data terbaru (atau sebaliknya). */
    const pick = (a, b) => {
      if (a == null) return b != null ? b : d;
      if (b == null) return a;
      const nonEmpty = v => Array.isArray(v) ? v.length > 0 : (typeof v === 'object' ? Object.keys(v).length > 0 : v !== '');
      return nonEmpty(a) ? a : b;
    };
    if (localOk) {
      const p = pick(local, cookie);
      return p != null ? p : (_memStore[k] !== undefined ? _memStore[k] : d);
    }
    if (cookie != null) return cookie;
    return _memStore[k] !== undefined ? _memStore[k] : d;
  },
  set: (k, v) => {
    const s = JSON.stringify(v);
    try { localStorage.setItem(k, s); } catch {}
    _cookieSet(k, s);
    _memStore[k] = v;
  },
};

/* ---------------- data layer ---------------- */
/* Migrasi: data lama yang tersimpan di storage tetap memakai nama/kategori
   lama (mis. "Ukiran Kayu Jati" kategori "Kayu"). Deteksi & perbarui agar
   produk default terbaru selalu sinkron tanpa harus menghapus storage. */
const DATA_MIGRATION = {
  2: DEFAULT_PRODUCTS.find(x => x.id === 2),
};
/* Kategori/produk yang sengaja dihapus (mis. Keramik) — dibuang dari data lama */
const DATA_REMOVED_IDS = [4];

function migrateStoredProducts(p) {
  if (!Array.isArray(p)) return null;
  let changed = false;
  p = p
    .filter(x => !DATA_REMOVED_IDS.includes(x.id))
    .map(x => {
      const fix = DATA_MIGRATION[x.id];
      if (fix && (x.nama !== fix.nama || x.kategori !== fix.kategori || x.img !== fix.img)) {
        changed = true;
        return { ...fix };
      }
      return x;
    });
  if (changed) {
    saveProducts(p);
    toast("Katalog produk diperbarui", "success");
  }
  return p;
}

function getProducts() {
  let p = store.get("tk_produk", null);
  if (!p || !Array.isArray(p) || !p.length) {
    saveProducts(DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  }
  return migrateStoredProducts(p);
}
function saveProducts(list) { store.set("tk_produk", list); }
function nextId(list) { return list.length ? Math.max(...list.map(x => x.id)) + 1 : 1; }

function getCart() {
  const c = store.get("tk_cart", []);
  if (!Array.isArray(c)) return [];
  /* buang item yang produknya sudah tidak ada (mis. Keramik dihapus) */
  const prods = getProducts();
  return c.filter(i => prods.some(p => p.id === i.id));
}
function setCart(c) { store.set("tk_cart", c); updateBadge(); }

function getOrders() { return store.get("tk_pesanan", []); }
function setOrders(o) { store.set("tk_pesanan", o); }

function getUsers() { return store.get("tk_users", []); }

function getSession() { return store.get("tk_session", null); }
function setSession(s) { store.set("tk_session", s); }

/* ---------------- auth ---------------- */
function registerUser(nama, email, password) {
  const users = getUsers();
  if (users.some(u => u.email === email)) { return { ok: false, msg: "Email sudah terdaftar." }; }
  users.push({ nama, email, password });
  store.set("tk_users", users);
  return { ok: true };
}
function loginUser(email, password) {
  const user = getUsers().find(u => u.email === email && u.password === password);
  if (email === ADMIN_CRED.email && password === ADMIN_CRED.password) {
    setSession({ role: "admin", nama: "Admin Toko", email });
    return { ok: true, role: "admin" };
  }
  if (user) { setSession({ role: "user", nama: user.nama, email }); return { ok: true, role: "user" }; }
  return { ok: false, msg: "Email atau password salah." };
}

/* ---------------- cart ---------------- */
function addToCart(id, qty = 1) {
  const cart = getCart();
  const item = cart.find(x => x.id === id);
  if (item) item.qty += qty;
  else cart.push({ id, qty });
  setCart(cart);
  toast("Produk ditambahkan ke keranjang", "success");
}
function updateQty(id, delta) {
  let cart = getCart();
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
  setCart(cart);
}
function removeItem(id) {
  setCart(getCart().filter(x => x.id !== id));
}
function cartCount() { return getCart().reduce((s, x) => s + x.qty, 0); }

function formatRupiah(n) { return "Rp" + Number(n).toLocaleString("id-ID"); }

/* ---------------- badge ---------------- */
function updateBadge() {
  document.querySelectorAll("[data-badge]").forEach(el => {
    el.textContent = cartCount();
    el.style.display = cartCount() > 0 ? "flex" : "none";
  });
}

/* ---------------- toast ---------------- */
function toast(msg, type = "") {
  const wrap = document.getElementById("toastWrap");
  if (!wrap) return;
  const t = document.createElement("div");
  t.className = "toast " + type;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => { t.style.opacity = "0"; t.style.transition = ".3s"; setTimeout(() => t.remove(), 300); }, 2200);
}

/* ---------------- product card html ---------------- */
function productCard(p) {
  return `
  <div class="prod-card">
    <a href="detail.html?id=${p.id}">
      <div class="prod-img"><img src="assets/gambar-produk/${p.img}" alt="${p.nama}" loading="lazy"></div>
    </a>
    <div class="p-3">
      <div class="text-xs text-gray-400 uppercase tracking-wide">${p.kategori}</div>
      <a href="detail.html?id=${p.id}" class="font-semibold text-sm block my-1 line-clamp-1">${p.nama}</a>
      <div class="flex items-center justify-between mt-2">
        <span class="price">${formatRupiah(p.harga)}</span>
        <button class="btn-cart" onclick="addToCart(${p.id})">+ Keranjang</button>
      </div>
    </div>
  </div>`;
}

/* ---------------- navbar render ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  updateBadge();
  renderNavbar();
  const hm = document.getElementById("hamburger");
  const mm = document.getElementById("mobileMenu");
  if (hm && mm) hm.addEventListener("click", () => mm.classList.toggle("open"));

  // highlight active link
  const path = location.pathname.split("/").pop();
  document.querySelectorAll("[data-nav]").forEach(a => {
    if (a.getAttribute("data-nav") === path) a.classList.add("active");
  });
});

function renderNavbar() {
  const sess = getSession();
  const navUser = document.getElementById("navUser");
  const navUserMobile = document.getElementById("navUserMobile");
  const mNavLinks = document.getElementById("navLinksMobile");
  if (!navUser) return;

  if (sess) {
    const isAdmin = sess.role === "admin";
    navUser.innerHTML = `
      <div class="relative">
        <button onclick="toggleDropdown()" class="flex items-center gap-2 font-semibold text-sm">
          <span class="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center font-bold">${sess.nama.charAt(0).toUpperCase()}</span>
          <span class="hidden md:inline">${sess.nama}</span>
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
        <div id="userDropdown" class="hidden absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg py-1" style="z-index:60;">
          ${isAdmin ? '<a href="admin.html" class="block px-4 py-2 text-sm hover:bg-gray-50">Panel Admin</a>' : ''}
          <a href="index.html" class="block px-4 py-2 text-sm hover:bg-gray-50">Beranda</a>
          <a href="#" onclick="logout()" class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50">Keluar</a>
        </div>
      </div>`;
    navUserMobile.innerHTML = `Halo, <b>${sess.nama}</b>`;
    if (isAdmin) {
      mNavLinks.innerHTML += '<a href="admin.html" class="nav-link">Panel Admin</a>';
    }
    mNavLinks.innerHTML += `<a href="#" onclick="logout()" class="nav-link text-red-600">Keluar</a>`;
  } else {
    navUser.innerHTML = `<a href="login.html" class="btn-outline text-sm !py-2 !px-4">Masuk</a>`;
    navUserMobile.innerHTML = `
      <div class="flex flex-col gap-2 pt-2 border-t">
        <a href="login.html" class="btn-solid text-center">Masuk</a>
        <a href="register.html" class="btn-outline text-center">Daftar</a>
      </div>`;
  }
}

function toggleDropdown() {
  const dd = document.getElementById("userDropdown");
  if (dd) dd.classList.toggle("hidden");
}
document.addEventListener("click", (e) => {
  const dd = document.getElementById("userDropdown");
  if (dd && !dd.classList.contains("hidden") && !e.target.closest("#navUser")) dd.classList.add("hidden");
});

function logout() {
  setSession(null);
  toast("Anda telah keluar", "success");
  location.href = "login.html";
}
