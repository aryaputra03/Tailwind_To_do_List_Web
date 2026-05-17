# ✅ TodoList App

Aplikasi Todo List berbasis web untuk mencatat, mengelola, dan memantau tugas harian. Dibangun tanpa framework — murni HTML, Tailwind CSS v4 (NPM), dan Vanilla JavaScript.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## 📋 Deskripsi

TodoList App adalah aplikasi web sederhana yang memungkinkan pengguna menambahkan tugas baru, menandai tugas yang sudah selesai, mengedit, menghapus, serta memfilter daftar tugas berdasarkan statusnya. Seluruh data disimpan di browser menggunakan `localStorage`, sehingga aplikasi tetap bisa digunakan walaupun halaman di-refresh.

Project ini dibuat sebagai latihan dasar front-end development, mencakup manipulasi DOM, event handling, array method, dan pengelolaan state sederhana tanpa library eksternal.

---

## ✨ Fitur

### Fitur Utama
- ➕ **Tambah tugas** — ketik lalu tekan tombol Tambah atau Enter
- ✅ **Tandai selesai / belum selesai** — klik lingkaran checkbox di setiap item
- ✏️ **Edit tugas** — edit langsung di tempat (inline editing) tanpa modal
- 🗑️ **Hapus tugas** — dilengkapi konfirmasi modal sebelum menghapus
- 🔍 **Cari tugas** — filter real-time berdasarkan teks pencarian
- 🗂️ **Filter status** — tampilkan Semua / Aktif / Selesai
- 💾 **Penyimpanan lokal** — data tersimpan otomatis via `localStorage`

### Fitur Tambahan
- 🌙 **Dark mode** — toggle manual, preferensi disimpan, ikuti sistem OS
- 📊 **Statistik** — counter total, aktif, dan selesai secara real-time
- 📭 **Empty state dinamis** — pesan berbeda sesuai kondisi filter/pencarian
- 🎬 **Animasi ringan** — item masuk (slide), item hapus (slide out), checkbox ping
- ⚠️ **Validasi input** — mencegah penambahan tugas kosong
- ⌨️ **Keyboard friendly** — Enter untuk simpan, Escape untuk batal/tutup modal
- 📱 **Responsive** — tampilan optimal di mobile dan desktop

---

## 🛠️ Tech Stack

| Teknologi | Keterangan |
|---|---|
| HTML5 | Struktur halaman, semantic elements, ARIA attributes |
| Tailwind CSS v4 | Styling utility-first via NPM, konfigurasi via `@theme` di CSS |
| Vanilla JavaScript | Logika aplikasi, DOM manipulation, event handling |
| localStorage | Penyimpanan data di browser, tanpa backend |

---

## 📁 Struktur Project

```
todo-list-app/
│
├── src/
│   ├── index.html      # Halaman utama aplikasi
│   ├── input.css       # Entry point Tailwind (@import + @theme + @layer)
│   └── script.js       # Seluruh logika JavaScript
│
├── dist/
│   └── output.css      # Hasil compile Tailwind (auto-generated, jangan diedit)
│
├── package.json        # Konfigurasi NPM dan scripts
├── package-lock.json
└── README.md
```

> `node_modules/` tidak disertakan di repositori (sudah masuk `.gitignore`).

---

## 🚀 Cara Menjalankan

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18 atau lebih baru
- NPM (sudah termasuk bersama Node.js)

### Langkah Instalasi

**1. Clone repositori**
```bash
git clone https://github.com/username/todo-list-app.git
cd todo-list-app
```

**2. Install dependensi**
```bash
npm install
```

**3. Jalankan mode development**
```bash
npm run watch
```
Perintah ini akan memantau perubahan file secara otomatis dan meng-compile ulang `dist/output.css`.

**4. Buka di browser**

Buka file `src/index.html` langsung di browser, atau gunakan ekstensi [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) di VS Code untuk hot-reload.

---

## 📜 NPM Scripts

| Script | Perintah | Keterangan |
|---|---|---|
| `build` | `npm run build` | Compile Tailwind sekali |
| `watch` | `npm run watch` | Compile otomatis saat ada perubahan |
| `build:prod` | `npm run build:prod` | Compile + minify untuk production |

---

## 🏗️ Struktur Data

Setiap todo disimpan sebagai objek JavaScript dengan tiga field:

```js
{
  id:        1748500000000,  // number — ID unik dari Date.now()
  text:      "Belajar DOM",  // string — teks tugas
  completed: false           // boolean — status selesai
}
```

Array `todos` di-serialize ke JSON dan disimpan di `localStorage` dengan key `todolist_app_v1`. Data dimuat kembali saat halaman dibuka.

---

## 🧩 Arsitektur JavaScript

`script.js` diorganisasi dalam 12 section berurutan:

```
1.  Referensi DOM       — getElementById / querySelectorAll
2.  Konstanta           — STORAGE_KEY, DARK_MODE_KEY
3.  State Aplikasi      — todos[], currentFilter, searchQuery, dll.
4.  Dark Mode           — loadDarkMode, applyDarkMode, toggleDarkMode
5.  localStorage        — saveTodos, loadTodos
6.  Utilitas            — generateId, escapeHtml, toggleValidation
7.  Filter              — getFilteredTodos, updateFilterUI, updateFilterCount
8.  Render              — createTodoElement, renderTodos, updateStats
9.  Tambah Todo         — addTodo, handleAddTodo
10. Interaksi Todo      — toggleTodo, startEdit, saveEdit, cancelEdit
11. Hapus (Modal)       — openDeleteModal, closeDeleteModal, confirmDelete
12. Event Listeners     — semua addEventListener
    Inisialisasi        — init()
```

---

## 🎨 Konfigurasi Tailwind v4

Project ini menggunakan Tailwind CSS v4 yang dikonfigurasi sepenuhnya melalui CSS — tanpa `tailwind.config.js`.

**`src/input.css`** memiliki tiga blok utama:

```css
/* 1. Import Tailwind */
@import "tailwindcss";

/* 2. Dark mode manual via class "dark" pada <html> */
@variant dark (&:where(.dark, .dark *));

/* 3. Token desain kustom (warna, radius, shadow) */
@theme {
  --color-brand-500: #6366f1;
  --radius-card: 1rem;
  /* ... */
}

/* 4. Komponen reusable dengan dark mode support */
@layer components {
  .card { ... }
  .todo-item { ... }
  /* ... */
}
```

---

## 📚 Tujuan Pembelajaran

Project ini melatih konsep front-end berikut:

- **DOM Manipulation** — createElement, innerHTML, classList, dataset
- **Event Handling** — click, keydown, input, delegasi event (event delegation)
- **Array Methods** — `push`, `filter`, `find`, `forEach`, `map`
- **localStorage** — setItem, getItem, JSON.stringify/parse
- **State Management** — mengelola state UI tanpa framework
- **CSS Architecture** — Tailwind utility classes + @layer components
- **Aksesibilitas** — ARIA roles, aria-label, aria-selected, aria-live

---

## 🗺️ Tahap Pengembangan

Project ini dibangun secara bertahap:

| Tahap | Fokus | Status |
|---|---|---|
| 1 | Setup project, install Tailwind NPM, struktur HTML | ✅ Selesai |
| 2 | Styling dengan Tailwind CSS, layout, komponen | ✅ Selesai |
| 3 | Logika dasar: tambah, validasi, render | ✅ Selesai |
| 4 | Interaksi: toggle, edit inline, hapus + modal | ✅ Selesai |
| 5 | Filter tab, search, localStorage | ✅ Selesai |
| 6 | Dark mode, animasi, empty state, responsive | ✅ Selesai |

---

## 📄 Lisensi

Project ini dibuat untuk keperluan pembelajaran dan bebas digunakan atau dimodifikasi.