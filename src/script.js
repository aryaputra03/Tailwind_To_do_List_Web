/* ================================================================
   script.js — Todo List App
   ──────────────────────────────────────────────────────────────
   Tahap 3 : Logika dasar (ambil input, validasi, simpan, render)
   Tahap 4 : Interaksi todo (toggle, edit inline, hapus + modal) ✅
   Tahap 5 : Filter + localStorage                               ✅
   Tahap 6 : Dark mode + animasi + empty state dinamis           ✅
   ================================================================ */
 
 
/* ================================================================
   1. REFERENSI ELEMEN DOM
   ================================================================ */
// Form & Input
const inputTodo     = document.getElementById("input-todo");
const btnAddTodo    = document.getElementById("btn-add-todo");
const msgValidation = document.getElementById("msg-validation");
 
// Search
const inputSearch   = document.getElementById("input-search");
 
// Filter
const allFilterBtns   = document.querySelectorAll(".btn-filter");
 
// List & Empty State
const todoList   = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
 
// Statistik
const statTotal     = document.getElementById("stat-total");
const statActive    = document.getElementById("stat-active");
const statCompleted = document.getElementById("stat-completed");
 
// Modal (dipakai Tahap 4)
const modalConfirmDelete = document.getElementById("modal-confirm-delete");
const modalBackdrop      = document.getElementById("modal-backdrop");
const btnCancelDelete    = document.getElementById("btn-cancel-delete");
const btnConfirmDelete   = document.getElementById("btn-confirm-delete");

const btnDarkMode        = document.getElementById("btn-dark-mode");
const iconMoon           = document.getElementById("icon-moon");
const iconSun            = document.getElementById("icon-sun");

/* ================================================================
   2. KONSTANTA
   ================================================================ */
/** Key yang dipakai untuk menyimpan data di localStorage */
const STORAGE_KEY = "todolist_app_v1";
const DARK_MODE_KEY    = "todolist_dark_mode";

/* ================================================================
   2. STATE APLIKASI
   ================================================================ */
 
/**
 * Array utama penyimpan semua todo.
 * Setiap todo adalah objek dengan bentuk:
 * { id: number, text: string, completed: boolean }
 */
let todos = [];
 
/**
 * Filter aktif saat ini: "all" | "active" | "completed"
 * Dipakai mulai Tahap 5, dideklarasikan di sini agar render
 * sudah siap menanganinya.
 */
let currentFilter = "all";
 
/**
 * Teks pencarian aktif.
 * Dipakai mulai Tahap 5, dideklarasikan di sini agar render
 * sudah siap menanganinya.
 */
let searchQuery = "";

/**
 * ID todo yang sedang menunggu konfirmasi hapus.
 * Diisi saat modal terbuka, dikosongkan saat modal ditutup.
 * @type {number|null}
 */
let pendingDeleteId = null;

/**
 * ID todo yang sedang dalam mode edit inline.
 * Hanya boleh satu item yang diedit dalam satu waktu.
 * @type {number|null}
 */
let editingId = null;

/* ================================================================
   4. DARK MODE (Tahap 6)
   ================================================================ */
 
/**
 * Terapkan dark mode: tambah/hapus class "dark" pada <html>,
 * lalu sinkronkan ikon tombol (moon ↔ sun).
 *
 * Class "dark-transitioning" dipasang sesaat untuk mengaktifkan
 * transisi warna global yang didefinisikan di input.css,
 * lalu dilepas setelah animasi selesai.
 *
 * @param {boolean} isDark
 */
function applyDarkMode(isDark) {
  const html = document.documentElement;
 
  // Aktifkan transisi warna global
  html.classList.add("dark-transitioning");
 
  // Toggle class dark
  html.classList.toggle("dark", isDark);
 
  // Sinkronkan ikon
  iconMoon.classList.toggle("hidden",  isDark);
  iconSun.classList.toggle("hidden",  !isDark);
 
  // Lepas class transisi setelah 350ms (lebih lama sedikit dari durasi CSS)
  setTimeout(() => html.classList.remove("dark-transitioning"), 350);
}
 
/**
 * Muat preferensi dark mode dari localStorage.
 * Jika belum pernah disimpan, ikuti preferensi sistem operasi.
 */
function loadDarkMode() {
  const saved = localStorage.getItem(DARK_MODE_KEY);
 
  if (saved !== null) {
    // Pakai preferensi yang sudah disimpan user
    applyDarkMode(saved === "true");
  } else {
    // Ikuti preferensi sistem
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyDarkMode(prefersDark);
  }
}
 
/**
 * Toggle dark mode saat tombol diklik,
 * lalu simpan preferensi ke localStorage.
 */
function toggleDarkMode() {
  const isDark = document.documentElement.classList.contains("dark");
  applyDarkMode(!isDark);
  localStorage.setItem(DARK_MODE_KEY, (!isDark).toString());
}

/* ================================================================
   4. LOCALSTORAGE — Simpan & Muat Data
   ================================================================ */
 
/**
 * Simpan array todos ke localStorage dalam format JSON.
 * Dipanggil setiap kali array todos berubah:
 * tambah, hapus, edit teks, toggle completed.
 */
function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (err) {
    // localStorage bisa penuh (QuotaExceededError) atau diblokir
    console.warn("Gagal menyimpan ke localStorage:", err);
  }
}
 
/**
 * Muat todos dari localStorage saat halaman pertama dibuka.
 * Jika tidak ada data atau data rusak, mulai dengan array kosong.
 *
 * @returns {Array} Array todos yang sudah divalidasi
 */
function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
 
    const parsed = JSON.parse(raw);
 
    // Validasi: pastikan hasilnya array dan setiap item punya field wajib
    if (!Array.isArray(parsed)) return [];
 
    return parsed.filter(
      (item) =>
        typeof item.id        === "number"  &&
        typeof item.text      === "string"  &&
        typeof item.completed === "boolean"
    );
  } catch (err) {
    console.warn("Gagal memuat dari localStorage:", err);
    return [];
  }
}

/* ================================================================
   3. FUNGSI UTILITAS
   ================================================================ */
 
/**
 * Membuat ID unik untuk todo baru.
 * Menggunakan Date.now() + random agar tidak bentrok
 * meskipun ditambahkan berturut-turut sangat cepat.
 *
 * @returns {number}
 */
function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}
 
/**
 * Menampilkan atau menyembunyikan pesan validasi.
 *
 * @param {boolean} show - true = tampilkan, false = sembunyikan
 */
function toggleValidation(show) {
  if (show) {
    msgValidation.classList.remove("hidden");
    inputTodo.classList.add("!border-danger-500");
    inputTodo.focus();
  } else {
    msgValidation.classList.add("hidden");
    inputTodo.classList.remove("!border-danger-500");
  }
}
 
/**
 * Mencegah XSS: mengubah karakter HTML khusus menjadi entity.
 * Penting karena teks todo langsung dimasukkan ke innerHTML.
 *
 * @param   {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#039;");
}

/** Cari todo berdasarkan ID */
function findTodo(id) {
  return todos.find((t) => t.id === id);
}

/* ================================================================
   6. FUNGSI FILTER
   ================================================================ */
 
/**
 * Terapkan filter + search ke array todos dan kembalikan hasilnya.
 * Fungsi ini murni (tidak mengubah state), hanya mengembalikan
 * subset dari todos sesuai kriteria aktif.
 *
 * Filter  : currentFilter ("all" | "active" | "completed")
 * Search  : searchQuery   (substring, case-insensitive)
 *
 * @returns {Array} Todos yang lolos filter dan pencarian
 */
function getFilteredTodos() {
  // ── 1. Terapkan filter tab ────────────────────────────────────
  let result = todos.filter((todo) => {
    if (currentFilter === "active")    return !todo.completed;
    if (currentFilter === "completed") return  todo.completed;
    return true; // "all"
  });
 
  // ── 2. Terapkan pencarian ─────────────────────────────────────
  const q = searchQuery.trim().toLowerCase();
  if (q !== "") {
    result = result.filter((todo) =>
      todo.text.toLowerCase().includes(q)
    );
  }
 
  return result;
}
 
/**
 * Perbarui tampilan tombol filter:
 * tombol yang aktif mendapat class btn-filter--active,
 * yang lain mendapat btn-filter--inactive.
 *
 * @param {string} activeFilter - "all" | "active" | "completed"
 */
function updateFilterUI(activeFilter) {
  allFilterBtns.forEach((btn) => {
    const isActive = btn.dataset.filter === activeFilter;
 
    btn.classList.toggle("btn-filter--active",   isActive);
    btn.classList.toggle("btn-filter--inactive", !isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}
 
/**
 * Tampilkan jumlah hasil pada label filter.
 * Misal: "Aktif (3)" saat ada 3 todo aktif.
 * Dikembalikan ke teks asal saat tidak ada pencarian aktif.
 */
function updateFilterCount() {
  const labels = { all: "Semua", active: "Aktif", completed: "Selesai" };
 
  allFilterBtns.forEach((btn) => {
    const filter = btn.dataset.filter;
 
    // Hitung item per kategori (tanpa pengaruh searchQuery)
    const count = todos.filter((todo) => {
      if (filter === "active")    return !todo.completed;
      if (filter === "completed") return  todo.completed;
      return true;
    }).length;
 
    btn.textContent = count > 0
      ? `${labels[filter]} (${count})`
      : labels[filter];
  });
}

/* ================================================================
   4. FUNGSI RENDER
   ================================================================ */
 
/**
 * Membangun satu elemen <li> untuk sebuah todo.
 * Struktur HTML sesuai pola yang sudah ada di index.html.
 *
 * @param   {Object} todo - Objek { id, text, completed }
 * @returns {HTMLElement}
 */
function createTodoElement(todo) {
  const li = document.createElement("li");
  const isEditing = editingId === todo.id;
 
  li.className = [
    "todo-item group",
    todo.completed ? "todo-item--completed" : "",
    isEditing      ? "ring-2 ring-brand-400 ring-offset-1" : "",
  ].join(" ").trim();
 
  li.dataset.id = todo.id;
  
 /* ── Mode Normal ─────────────────────────────────────────────── */
  if (!isEditing) {
    li.innerHTML = `
 
      <!-- Checkbox -->
      <button
        aria-label="${todo.completed ? "Tandai belum selesai" : "Tandai selesai"}"
        class="todo-checkbox ${todo.completed ? "todo-checkbox--checked" : ""}"
        data-action="toggle"
        data-id="${todo.id}"
      >
        ${todo.completed
          ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
               <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clip-rule="evenodd"/>
             </svg>`
          : ""}
      </button>
 
      <!-- Teks Tugas -->
      <span class="todo-text flex-1 text-sm font-medium leading-snug select-none
        ${todo.completed ? "text-slate-400 dark:text-slate-400 line-through" : "text-slate-700 dark:text-slate-200"}">
        ${escapeHtml(todo.text)}
      </span>
 
      <!-- Tombol Aksi -->
      <div class="todo-actions flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
 
        <button
          aria-label="Edit tugas"
          class="btn-action hover:text-brand-500 hover:bg-brand-50"
          data-action="edit"
          data-id="${todo.id}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z"/>
          </svg>
        </button>
 
        <button
          aria-label="Hapus tugas"
          class="btn-action hover:text-danger-500 hover:bg-danger-50"
          data-action="delete"
          data-id="${todo.id}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"/>
          </svg>
        </button>
 
      </div>
    `;

  /* ── Mode Edit Inline ─────────────────────────────────────────── */
    } else {
    li.innerHTML = `
 
      <!-- Ikon pensil sebagai penanda mode edit -->
      <span class="shrink-0 text-brand-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z"/>
        </svg>
      </span>
 
      <!-- Input Edit -->
      <input
        id="input-edit-${todo.id}"
        type="text"
        value="${escapeHtml(todo.text)}"
        maxlength="200"
        autocomplete="off"
        class="input-edit flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-0 px-0 py-0"
      />
 
      <!-- Tombol Simpan & Batal -->
      <div class="flex items-center gap-1 shrink-0">
 
        <!-- Simpan -->
        <button
          aria-label="Simpan perubahan"
          class="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition-colors"
          data-action="save-edit"
          data-id="${todo.id}"
        >
          Simpan
        </button>
 
        <!-- Batal -->
        <button
          aria-label="Batal edit"
          class="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
          data-action="cancel-edit"
          data-id="${todo.id}"
        >
          Batal
        </button>
 
      </div>
    `;

    /* Fokus dan letakkan cursor di akhir teks */
    requestAnimationFrame(() => {
      const inputEdit = document.getElementById(`input-edit-${todo.id}`);
      if (inputEdit) {
        inputEdit.focus();
        inputEdit.setSelectionRange(inputEdit.value.length, inputEdit.value.length);
      }
    });
  }
 
  return li;
}
 
/**
 * Render ulang seluruh daftar todo berdasarkan hasil getFilteredTodos().
 * Juga memperbarui counter pada label filter dan statistik.
 */
function renderTodos() {
  const filtered = getFilteredTodos();
 
  todoList.innerHTML = "";
 
  if (filtered.length === 0) {
    todoList.classList.add("hidden");
    emptyState.classList.remove("hidden");
 
    // Teks empty state berbeda tergantung kondisi
    const emptyTitle = emptyState.querySelector("p.font-bold");
    const emptyDesc  = emptyState.querySelector("p.text-slate-400");
 
    if (emptyTitle && emptyDesc) {
      if (searchQuery.trim() !== "") {
        emptyTitle.textContent = "Tugas tidak ditemukan";
        emptyDesc.textContent  = `Tidak ada hasil untuk "${searchQuery}"`;
      } else if (currentFilter === "active") {
        emptyTitle.textContent = "Semua tugas selesai! 🎉";
        emptyDesc.textContent  = "Tidak ada tugas yang aktif";
      } else if (currentFilter === "completed") {
        emptyTitle.textContent = "Belum ada tugas selesai";
        emptyDesc.textContent  = "Tandai tugas sebagai selesai di atas";
      } else {
        emptyTitle.textContent = "Belum ada tugas";
        emptyDesc.textContent  = "Tambahkan tugas di atas";
      }
    }
  } else {
    todoList.classList.remove("hidden");
    emptyState.classList.add("hidden");
    filtered.forEach((todo) => todoList.appendChild(createTodoElement(todo)));
  }
 
  updateFilterCount();
  updateStats();
}
 
/**
 * Memperbarui angka pada kartu statistik:
 * Total, Aktif (belum selesai), Selesai.
 */
function updateStats() {
  const total     = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const active    = total - completed;
 
  statTotal.textContent     = total;
  statActive.textContent    = active;
  statCompleted.textContent = completed;
}

/* ================================================================
   5. FUNGSI TAMBAH TODO
   ================================================================ */
 
/**
 * Menambahkan todo baru ke dalam array todos.
 *
 * @param {string} text - Teks tugas yang sudah di-trim
 */


function addTodo(text) {
  todos.push({ id: generateId(), text, completed: false });
  saveTodos();
  renderTodos();
}
 
/**
 * Membaca nilai input → validasi → panggil addTodo().
 * Dipanggil saat klik tombol Tambah atau tekan Enter.
 */
function handleAddTodo() {
  const text = inputTodo.value.trim();
 
  // ── Validasi: input kosong ────────────────────────────────────
  if (text === "") {
    toggleValidation(true);
    setTimeout(() => toggleValidation(false), 2500);
    return;
  }
 
  // ── Input valid ───────────────────────────────────────────────
  toggleValidation(false);
  addTodo(text);
 
  // Bersihkan input & fokus kembali
  inputTodo.value = "";
  inputTodo.focus();
}

/* ================================================================
   6. FUNGSI INTERAKSI TODO (Tahap 4)
   ================================================================ */
 
/* ── 6a. Toggle Selesai / Belum Selesai ─────────────────────────── */
 
/**
 * Balik nilai completed pada todo yang dituju.
 * Jika todo sedang diedit, batalkan dulu mode editnya.
 *
 * @param {number} id
 */
function toggleTodo(id) {
  // Batalkan edit jika ada
  if (editingId !== null) cancelEdit();
 
  const todo = findTodo(id);
  if (!todo) return;
 
  todo.completed = !todo.completed;
  saveTodos();

  const checkbox = todoList.querySelector(`[data-id="${id}"].todo-checkbox, [data-id="${id}"].todo-checkbox`);
  if (checkbox) {
    checkbox.classList.add("todo-checkbox--ping");
    setTimeout(() => { todo; renderTodos(); updateStats(); }, 150);
  } else {
    renderTodos();
    updateStats();
  }
}
 
 
/* ── 6b. Edit Inline ─────────────────────────────────────────────── */
 
/**
 * Masuk ke mode edit untuk todo tertentu.
 * Jika ada todo lain yang sedang diedit, batalkan dulu.
 *
 * @param {number} id
 */
function startEdit(id) {
  if (editingId !== null && editingId !== id) cancelEdit();
 
  editingId = id;
  renderTodos(); // Re-render akan mengganti teks dengan input field
}
 
/**
 * Simpan hasil edit.
 * Ambil nilai dari input edit, validasi tidak kosong,
 * lalu perbarui teks todo di array.
 *
 * @param {number} id
 */
function saveEdit(id) {
  const inputEdit = document.getElementById(`input-edit-${id}`);
  if (!inputEdit) return;
 
  const newText = inputEdit.value.trim();
 
  // Validasi: tidak boleh kosong
  if (newText === "") {
    inputEdit.classList.add("!border-danger-500");
    inputEdit.focus();
 
    // Tampilkan placeholder merah sementara
    inputEdit.placeholder = "Teks tidak boleh kosong!";
    setTimeout(() => {
      inputEdit.classList.remove("!border-danger-500");
      inputEdit.placeholder = "";
    }, 2000);
    return;
  }
 
  const todo = findTodo(id);
  if (todo) todo.text = newText;
 
  editingId = null;
  saveTodos();
  renderTodos();
}
 
/**
 * Batalkan mode edit tanpa menyimpan perubahan.
 */
function cancelEdit() {
  editingId = null;
  renderTodos();
}
 
 
/* ── 6c. Hapus Todo (dengan Modal Konfirmasi) ───────────────────── */
 
/**
 * Buka modal konfirmasi hapus untuk todo tertentu.
 *
 * @param {number} id
 */
function openDeleteModal(id) {
  // Batalkan edit yang sedang berjalan jika ada
  if (editingId !== null) cancelEdit();
 
  pendingDeleteId = id;

  // Animasi preview: item agak memudar
  const li = todoList.querySelector(`li[data-id="${id}"]`);
  if (li) li.style.opacity = "0.4";

  modalConfirmDelete.classList.remove("hidden");
  // Fokus ke tombol Batal agar keyboard-friendly
  btnCancelDelete.focus();
}
 
/**
 * Tutup modal konfirmasi hapus tanpa melakukan aksi.
 */
function closeDeleteModal() {
  // Kembalikan opacity item
  if (pendingDeleteId !== null) {
    const li = todoList.querySelector(`li[data-id="${pendingDeleteId}"]`);
    if (li) li.style.opacity = "";
  }
  pendingDeleteId = null;
  modalConfirmDelete.classList.add("hidden");
}
 
/**
 * Hapus todo setelah dikonfirmasi melalui modal.
 */
function confirmDelete() {
  if (pendingDeleteId === null) return;
  const id = pendingDeleteId;
 
  // Animasi slide-out item sebelum dihapus dari array
  const li = todoList.querySelector(`li[data-id="${id}"]`);
  if (li) {
    li.classList.add("todo-item--removing");
    setTimeout(() => {
      todos = todos.filter((t) => t.id !== id);
      saveTodos();
      closeDeleteModal();
      renderTodos();
    }, 220); // sama dengan durasi animasi fadeSlideOut
  } else {
    todos = todos.filter((t) => t.id !== id);
    saveTodos();
    closeDeleteModal();
    renderTodos();
  }
}

/* ================================================================
   7. EVENT LISTENERS
   ================================================================ */
/* ── Dark Mode ───────────────────────────────────────────────────── */
btnDarkMode.addEventListener("click", toggleDarkMode);

// ── Klik tombol Tambah ────────────────────────────────────────────
btnAddTodo.addEventListener("click", handleAddTodo);
 
// ── Tekan Enter di dalam input ────────────────────────────────────
inputTodo.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleAddTodo();
});
 
// ── Sembunyikan pesan validasi saat user mulai mengetik ───────────
inputTodo.addEventListener("input", () => {
  if (inputTodo.value.trim() !== "") toggleValidation(false);
});
 
// ── Search: render ulang saat query berubah ───────────────────────
inputSearch.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderTodos();
});
 
// Bersihkan search dengan tombol × (type="search" bawaan browser)
inputSearch.addEventListener("search", () => {
  searchQuery = inputSearch.value;
  renderTodos();
});

/* ── Filter Tabs ─────────────────────────────────────────────────── */
allFilterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    updateFilterUI(currentFilter);
    renderTodos();
  });
});
 
/* ── Delegasi Klik pada #todo-list ──────────────────────────────── */
/*
 * Satu listener menangani semua aksi dalam list:
 * toggle, edit, delete, save-edit, cancel-edit.
 * Ini lebih efisien daripada memasang listener per tombol.
 */
todoList.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
 
  const action = btn.dataset.action;
  const id     = Number(btn.dataset.id);
 
  switch (action) {
    case "toggle":      toggleTodo(id);      break;
    case "edit":        startEdit(id);       break;
    case "save-edit":   saveEdit(id);        break;
    case "cancel-edit": cancelEdit();        break;
    case "delete":      openDeleteModal(id); break;
  }
});

/*
 * Tombol Simpan pada mode edit juga bisa dipicu dengan Enter,
 * dan Batal dengan Escape — ditangani via keydown di dalam list.
 */
todoList.addEventListener("keydown", (e) => {
  if (editingId === null) return;
 
  if (e.key === "Enter") {
    e.preventDefault();
    saveEdit(editingId);
  }
  if (e.key === "Escape") {
    cancelEdit();
  }
});

/* ── Modal Konfirmasi Hapus ──────────────────────────────────────── */
btnCancelDelete.addEventListener("click", closeDeleteModal);
btnConfirmDelete.addEventListener("click", confirmDelete);
 
// Klik backdrop = tutup modal
modalBackdrop.addEventListener("click", closeDeleteModal);
 
// Tekan Escape = tutup modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && pendingDeleteId !== null) {
    closeDeleteModal();
  }
});

/* ── Ikuti perubahan preferensi sistem secara real-time ─────────── */
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  // Hanya ikuti sistem jika user belum pernah mengatur manual
  if (localStorage.getItem(DARK_MODE_KEY) === null) {
    applyDarkMode(e.matches);
  }
});
/* ================================================================
   7. INISIALISASI
   ================================================================ */
 
/**
 * Dijalankan saat halaman pertama kali dimuat.
 * Menghapus item statis contoh dari HTML, lalu render dari array.
 */
function init() {
  loadDarkMode();
  todos = loadTodos();         // ← Tahap 5: muat data saat buka halaman
  updateFilterUI(currentFilter);
  renderTodos();
  inputTodo.focus();
}
init();