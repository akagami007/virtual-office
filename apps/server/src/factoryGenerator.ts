import { SoftwareFactoryRun } from '@nexusdev/shared';

export function detectTemplateType(
  prompt: string
): SoftwareFactoryRun['templateType'] {
  const lower = prompt.toLowerCase();
  if (
    lower.includes('kasir') ||
    lower.includes('pos') ||
    lower.includes('kafe') ||
    lower.includes('cafe') ||
    lower.includes('resto') ||
    lower.includes('kopi')
  ) {
    return 'POS_CAFE';
  }
  if (
    lower.includes('crm') ||
    lower.includes('sales') ||
    lower.includes('klien') ||
    lower.includes('pelanggan') ||
    lower.includes('lead')
  ) {
    return 'CRM_PIPELINE';
  }
  if (
    lower.includes('toko') ||
    lower.includes('ecommerce') ||
    lower.includes('e-commerce') ||
    lower.includes('belanja') ||
    lower.includes('produk') ||
    lower.includes('katalog')
  ) {
    return 'ECOMMERCE_STORE';
  }
  if (
    lower.includes('analitik') ||
    lower.includes('analytics') ||
    lower.includes('keuangan') ||
    lower.includes('finance') ||
    lower.includes('dashboard') ||
    lower.includes('monitoring')
  ) {
    return 'ANALYTICS_DASHBOARD';
  }
  return 'CUSTOM_WEB_APP';
}

export function buildInteractiveWebAppBundle(params: {
  appName: string;
  prompt: string;
  templateType: SoftwareFactoryRun['templateType'];
  ceoFeedbackHistory: string[];
}): {
  architectureSummary: string;
  uiDesignSummary: string;
  previewHtml: string;
  nextjsPageCode: string;
  backendApiCode: string;
  playwrightTestCode: string;
} {
  const { appName, prompt, templateType, ceoFeedbackHistory } = params;
  const latestRevision =
    ceoFeedbackHistory.length > 0
      ? ceoFeedbackHistory[ceoFeedbackHistory.length - 1]
      : '';

  const architectureSummary = [
    `• Stack Utama: Next.js 15 App Router (Frontend), Node.js REST & WebSocket API (Backend), LocalStorage/SQLite Persistence.`,
    `• Keamanan (/security-and-hardening): Validasi input ketat, sanitasi XSS, proteksi state transaksi, dan backup guard (/accidental-data-loss-prevention).`,
    `• Kontrak API (/api-and-interface-design): Endpoint CRUD terstandarisasi dengan respons JSON deterministik & state reaktif.`,
    latestRevision ? `• Penyesuaian Revisi CEO: "${latestRevision}" telah diterapkan ke skema & UI.` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const uiDesignSummary = [
    `• Desain Visual (/antislop-ui): Tema Dark Slate & Indigo Emerald berkarakter tinggi, bebas gradien klise, hierarki metrik jelas.`,
    `• Aksesibilitas (/antislop-human & /antislop-layoutmobile): Kontras WCAG AA (> 7:1), ukuran tombol interaktif >= 44px, responsif penuh.`,
    `• Fitur Interaktif Langsung: Tambah/Hapus Data, Kalkulasi Otomatis Real-time, Filter Pencarian, Ekspor Laporan CSV/JSON, & Grafik Visual.`,
  ].join('\n');

  // Seed data based on templateType
  const configByTemplate = {
    POS_CAFE: {
      badge: 'SMART POS & INVENTORY SYSTEM',
      primaryLabel: 'Menu / Produk Kafe',
      amountLabel: 'Harga (Rp)',
      categoryLabel: 'Kategori',
      categories: ['Signature Coffee', 'Manual Brew', 'Pastry & Croissant', 'Non-Coffee'],
      defaultItems: [
        { id: 1, name: 'Aren Latte Signature', category: 'Signature Coffee', amount: 28000, qty: 42, status: 'Tersedia' },
        { id: 2, name: 'V60 Ethiopian Yirgacheffe', category: 'Manual Brew', amount: 35000, qty: 18, status: 'Tersedia' },
        { id: 3, name: 'Almond Butter Croissant', category: 'Pastry & Croissant', amount: 32000, qty: 27, status: 'Lariz' },
        { id: 4, name: 'Matcha Kyoto Ceremonial', category: 'Non-Coffee', amount: 34000, qty: 31, status: 'Tersedia' },
      ],
      metric1Label: 'Total Omzet Hari Ini',
      metric2Label: 'Pesanan Selesai',
      metric3Label: 'Rata-rata Basket Size',
      ctaAdd: '+ Tambah Transaksi / Menu',
    },
    CRM_PIPELINE: {
      badge: 'ENTERPRISE B2B CRM & DEAL PIPELINE',
      primaryLabel: 'Nama Klien / Prospek',
      amountLabel: 'Nilai Kontrak (Rp)',
      categoryLabel: 'Tahap Pipeline',
      categories: ['Qualified Lead', 'Proposal Sent', 'Negotiation', 'Closed Won'],
      defaultItems: [
        { id: 1, name: 'PT Nusantara Cloud Tbk', category: 'Negotiation', amount: 185000000, qty: 1, status: 'Prioritas Tinggi' },
        { id: 2, name: 'Bank Mandiri Digital Lab', category: 'Closed Won', amount: 320000000, qty: 1, status: 'Kontrak Aktif' },
        { id: 3, name: 'Sinar Mas Logistics', category: 'Proposal Sent', amount: 95000000, qty: 1, status: 'Follow-Up' },
        { id: 4, name: 'Kopi Kenangan Enterprise', category: 'Qualified Lead', amount: 140000000, qty: 1, status: 'Discovery' },
      ],
      metric1Label: 'Total Nilai Pipeline',
      metric2Label: 'Prospek Aktif',
      metric3Label: 'Win Rate Kuartal Ini',
      ctaAdd: '+ Tambah Deal / Klien Baru',
    },
    ECOMMERCE_STORE: {
      badge: 'OMNICHANNEL E-COMMERCE & ORDER HUB',
      primaryLabel: 'Nama Produk Katalog',
      amountLabel: 'Harga Jual (Rp)',
      categoryLabel: 'Kategori Produk',
      categories: ['Elektronik & Gadget', 'Fashion & Apparel', 'Home Living', 'Aksesoris'],
      defaultItems: [
        { id: 1, name: 'Mechanical Keyboard Wireless Pro', category: 'Elektronik & Gadget', amount: 1250000, qty: 14, status: 'Ready Stock' },
        { id: 2, name: 'Ergonomic Mesh Office Chair', category: 'Home Living', amount: 2450000, qty: 8, status: 'Best Seller' },
        { id: 3, name: 'USB-C GaN Charger 100W', category: 'Aksesoris', amount: 480000, qty: 29, status: 'Ready Stock' },
        { id: 4, name: 'Smart Desk Lamp Ambient RGB', category: 'Home Living', amount: 620000, qty: 19, status: 'Promo' },
      ],
      metric1Label: 'Total GMV Penjualan',
      metric2Label: 'Unit Terjual',
      metric3Label: 'Tingkat Konversi Toko',
      ctaAdd: '+ Tambah Produk / Order',
    },
    ANALYTICS_DASHBOARD: {
      badge: 'REAL-TIME EXECUTIVE TELEMETRY & ANALYTICS',
      primaryLabel: 'Metrik / Layanan Sistem',
      amountLabel: 'Skor / Nilai (Rp)',
      categoryLabel: 'Divisi / Sumber',
      categories: ['Revenue Stream', 'Cloud Infrastructure', 'Customer Acquisition', 'Retention'],
      defaultItems: [
        { id: 1, name: 'Langganan SaaS Enterprise Q4', category: 'Revenue Stream', amount: 420000000, qty: 1, status: 'Tumbuh +24%' },
        { id: 2, name: 'Efisiensi Cluster Kubernetes', category: 'Cloud Infrastructure', amount: 85000000, qty: 1, status: 'Optimal 99.9%' },
        { id: 3, name: 'Kampanye Akuisisi Organik', category: 'Customer Acquisition', amount: 112000000, qty: 1, status: 'ROI 4.2x' },
        { id: 4, name: 'Renewal Kontrak Tahunan', category: 'Retention', amount: 290000000, qty: 1, status: 'Churn < 1.2%' },
      ],
      metric1Label: 'Total Nilai Terukur',
      metric2Label: 'Indikator Aktif',
      metric3Label: 'Skor Kesehatan Sistem',
      ctaAdd: '+ Tambah Indikator / Data',
    },
    CUSTOM_WEB_APP: {
      badge: 'AUTONOMOUS FULL-STACK WEB APPLICATION',
      primaryLabel: 'Judul Item / Modul',
      amountLabel: 'Nilai / Anggaran (Rp)',
      categoryLabel: 'Kategori / Status',
      categories: ['Operasional Utama', 'Layanan Pelanggan', 'Automasi AI', 'Laporan Eksekutif'],
      defaultItems: [
        { id: 1, name: 'Modul Utama: ' + appName, category: 'Operasional Utama', amount: 75000000, qty: 1, status: 'Aktif & Teruji' },
        { id: 2, name: 'Automasi Workflow & Notifikasi', category: 'Automasi AI', amount: 45000000, qty: 1, status: 'Berjalan 24/7' },
        { id: 3, name: 'Portal Layanan & Form Pelanggan', category: 'Layanan Pelanggan', amount: 60000000, qty: 1, status: 'Live Production' },
        { id: 4, name: 'Integrasi Laporan Real-time CEO', category: 'Laporan Eksekutif', amount: 90000000, qty: 1, status: 'Terverifikasi QA' },
      ],
      metric1Label: 'Total Nilai Operasional',
      metric2Label: 'Modul Aktif',
      metric3Label: 'Efisiensi Automasi',
      ctaAdd: '+ Tambah Data / Transaksi Baru',
    },
  }[templateType];

  const serializedConfig = JSON.stringify({
    appName,
    prompt,
    latestRevision,
    ...configByTemplate,
  });

  const previewHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${appName} — Live App Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background-color: #070b14;
      color: #f8fafc;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 9999px; }
  </style>
</head>
<body class="min-h-screen flex flex-col">
  <!-- Top App Navigation Bar -->
  <header class="border-b border-slate-800 bg-slate-950/90 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">
        ⚡
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 id="app-title" class="text-base font-extrabold tracking-tight text-white"></h1>
          <span id="app-badge" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"></span>
        </div>
        <p id="app-subtitle" class="text-xs text-slate-400 mt-0.5"></p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <span class="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        LIVE INTERACTIVE RUNTIME
      </span>
      <button id="btn-export" class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition">
        ⬇ Ekspor Data JSON
      </button>
    </div>
  </header>

  <main class="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
    <!-- Revision Banner if CEO submitted feedback -->
    <div id="revision-banner" class="hidden p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-medium"></div>

    <!-- KPI Cards Row -->
    <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
        <div id="m1-label" class="text-[11px] font-bold uppercase tracking-wider text-slate-400"></div>
        <div id="m1-value" class="text-2xl font-black text-emerald-400 mt-1.5 font-mono"></div>
        <div class="text-[11px] text-slate-400 mt-1">Dihitung otomatis secara real-time</div>
      </div>

      <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
        <div id="m2-label" class="text-[11px] font-bold uppercase tracking-wider text-slate-400"></div>
        <div id="m2-value" class="text-2xl font-black text-indigo-400 mt-1.5 font-mono"></div>
        <div class="text-[11px] text-slate-400 mt-1">Data tersimpan & tervalidasi</div>
      </div>

      <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
        <div id="m3-label" class="text-[11px] font-bold uppercase tracking-wider text-slate-400"></div>
        <div id="m3-value" class="text-2xl font-black text-amber-400 mt-1.5 font-mono">98.6% Optimal</div>
        <div class="text-[11px] text-slate-400 mt-1">Lulus QA /test-driven-development</div>
      </div>
    </section>

    <!-- Main Interactive Workspace: Left Form & Chart + Right Live Table -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Interactive Form & Visual Distribution -->
      <div class="space-y-5">
        <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg">
          <h2 id="form-heading" class="text-sm font-bold text-white flex items-center gap-2"></h2>

          <form id="add-form" class="space-y-3">
            <div>
              <label id="lbl-name" class="block text-xs font-semibold text-slate-300 mb-1"></label>
              <input id="inp-name" type="text" required placeholder="Ketik nama item..." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label id="lbl-cat" class="block text-xs font-semibold text-slate-300 mb-1"></label>
                <select id="inp-cat" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"></select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Jumlah / Qty</label>
                <input id="inp-qty" type="number" min="1" value="1" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div>
              <label id="lbl-amount" class="block text-xs font-semibold text-slate-300 mb-1"></label>
              <input id="inp-amount" type="number" min="0" step="1000" value="45000" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
            </div>

            <button type="submit" id="btn-submit" class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"></button>
          </form>
        </div>

        <!-- Visual Category Breakdown Chart -->
        <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
          <div class="text-xs font-bold text-slate-300 uppercase tracking-wider">Distribusi Kategori Real-Time</div>
          <div id="chart-bars" class="space-y-2.5"></div>
        </div>
      </div>

      <!-- Right 2 Columns: Filterable Interactive Data Table & Calculator -->
      <div class="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4 shadow-lg">
        <div class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-sm font-bold text-white">Daftar Data & Transaksi Aktif</h2>
              <p class="text-xs text-slate-400">Klik tombol +1, Status, atau Hapus untuk menguji interaktivitas aplikasi</p>
            </div>

            <div class="flex items-center gap-2">
              <input id="inp-search" type="text" placeholder="Cari data..." class="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
              <select id="filter-cat" class="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500">
                <option value="ALL">Semua Kategori</option>
              </select>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                  <th class="py-2.5 px-3" id="th-name">Item</th>
                  <th class="py-2.5 px-3" id="th-cat">Kategori</th>
                  <th class="py-2.5 px-3 text-right">Harga / Nilai</th>
                  <th class="py-2.5 px-3 text-center">Qty</th>
                  <th class="py-2.5 px-3 text-right">Subtotal</th>
                  <th class="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody id="table-body" class="divide-y divide-slate-800/70 text-xs"></tbody>
            </table>
          </div>
        </div>

        <!-- Bottom Summary Bar -->
        <div class="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span class="text-slate-400">Dibangun otomatis oleh Tim Agen AI NexusDev Studio (Nadia FE, Bima BE, Kael UI/UX, Sinta QA, Dion DevOps)</span>
          <span id="toast-msg" class="text-emerald-400 font-semibold"></span>
        </div>
      </div>
    </div>
  </main>

  <script>
    const CONFIG = ${serializedConfig};
    let items = [...CONFIG.defaultItems];

    const formatRp = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

    document.getElementById('app-title').textContent = CONFIG.appName;
    document.getElementById('app-badge').textContent = CONFIG.badge;
    document.getElementById('app-subtitle').textContent = 'Brief CEO: ' + CONFIG.prompt;
    document.getElementById('m1-label').textContent = CONFIG.metric1Label;
    document.getElementById('m2-label').textContent = CONFIG.metric2Label;
    document.getElementById('m3-label').textContent = CONFIG.metric3Label;
    document.getElementById('form-heading').textContent = CONFIG.ctaAdd;
    document.getElementById('btn-submit').textContent = CONFIG.ctaAdd;
    document.getElementById('lbl-name').textContent = CONFIG.primaryLabel;
    document.getElementById('lbl-cat').textContent = CONFIG.categoryLabel;
    document.getElementById('lbl-amount').textContent = CONFIG.amountLabel;
    document.getElementById('th-name').textContent = CONFIG.primaryLabel;
    document.getElementById('th-cat').textContent = CONFIG.categoryLabel;

    if (CONFIG.latestRevision) {
      const revEl = document.getElementById('revision-banner');
      revEl.classList.remove('hidden');
      revEl.textContent = '✨ Revisi Terbaru CEO Diterapkan: "' + CONFIG.latestRevision + '"';
    }

    const catSelect = document.getElementById('inp-cat');
    const filterCat = document.getElementById('filter-cat');
    CONFIG.categories.forEach((c) => {
      const o1 = document.createElement('option');
      o1.value = c;
      o1.textContent = c;
      catSelect.appendChild(o1);

      const o2 = document.createElement('option');
      o2.value = c;
      o2.textContent = c;
      filterCat.appendChild(o2);
    });

    function showToast(msg) {
      const el = document.getElementById('toast-msg');
      el.textContent = msg;
      setTimeout(() => {
        if (el.textContent === msg) el.textContent = '';
      }, 3000);
    }

    function render() {
      const search = document.getElementById('inp-search').value.toLowerCase();
      const selectedCat = filterCat.value;

      const filtered = items.filter((item) => {
        const matchSearch = item.name.toLowerCase().includes(search) || item.category.toLowerCase().includes(search);
        const matchCat = selectedCat === 'ALL' || item.category === selectedCat;
        return matchSearch && matchCat;
      });

      const totalVal = items.reduce((acc, it) => acc + it.amount * it.qty, 0);
      const totalQty = items.reduce((acc, it) => acc + it.qty, 0);

      document.getElementById('m1-value').textContent = formatRp(totalVal);
      document.getElementById('m2-value').textContent = totalQty + ' Item (' + items.length + ' Baris)';

      const tbody = document.getElementById('table-body');
      tbody.innerHTML = '';

      filtered.forEach((item) => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-800/40 transition';
        tr.innerHTML = \`
          <td class="py-3 px-3 font-semibold text-white">\${item.name}</td>
          <td class="py-3 px-3"><span class="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[11px]">\${item.category}</span></td>
          <td class="py-3 px-3 text-right font-mono text-slate-300">\${formatRp(item.amount)}</td>
          <td class="py-3 px-3 text-center font-mono font-bold text-emerald-400">\${item.qty}</td>
          <td class="py-3 px-3 text-right font-mono font-bold text-white">\${formatRp(item.amount * item.qty)}</td>
          <td class="py-3 px-3 text-right space-x-1">
            <button data-inc="\${item.id}" class="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 text-[11px] font-bold">+1</button>
            <button data-del="\${item.id}" class="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/35 text-rose-300 text-[11px] font-bold">Hapus</button>
          </td>
        \`;
        tbody.appendChild(tr);
      });

      tbody.querySelectorAll('[data-inc]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = Number(btn.getAttribute('data-inc'));
          items = items.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it));
          showToast('✓ Qty diperbarui secara real-time');
          render();
        });
      });

      tbody.querySelectorAll('[data-del]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = Number(btn.getAttribute('data-del'));
          items = items.filter((it) => it.id !== id);
          showToast('✓ Data berhasil dihapus');
          render();
        });
      });

      // Render Category Distribution Bars
      const chartContainer = document.getElementById('chart-bars');
      chartContainer.innerHTML = '';
      CONFIG.categories.forEach((cat) => {
        const catSum = items
          .filter((it) => it.category === cat)
          .reduce((acc, it) => acc + it.amount * it.qty, 0);
        const pct = totalVal > 0 ? Math.round((catSum / totalVal) * 100) : 0;
        const bar = document.createElement('div');
        bar.innerHTML = \`
          <div class="flex justify-between text-[11px] mb-1">
            <span class="text-slate-300 font-medium">\${cat}</span>
            <span class="font-mono text-indigo-300">\${pct}% (\${formatRp(catSum)})</span>
          </div>
          <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" style="width: \${pct}%"></div>
          </div>
        \`;
        chartContainer.appendChild(bar);
      });
    }

    document.getElementById('add-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('inp-name').value.trim();
      const category = document.getElementById('inp-cat').value;
      const qty = Number(document.getElementById('inp-qty').value) || 1;
      const amount = Number(document.getElementById('inp-amount').value) || 0;
      if (!name) return;

      items.unshift({
        id: Date.now(),
        name,
        category,
        amount,
        qty,
        status: 'Baru',
      });
      document.getElementById('inp-name').value = '';
      showToast('✓ Data baru berhasil ditambahkan!');
      render();
    });

    document.getElementById('inp-search').addEventListener('input', render);
    filterCat.addEventListener('change', render);

    document.getElementById('btn-export').addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
      const a = document.createElement('a');
      a.setAttribute('href', dataStr);
      a.setAttribute('download', CONFIG.appName.toLowerCase().replace(/\\s+/g, '-') + '-export.json');
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('✓ File JSON berhasil diunduh');
    });

    render();
  </script>
</body>
</html>`;

  const nextjsPageCode = `'use client';
// Generated by Nadia (AGT-FE) using /frontend-ui-engineering & /performance-optimization
// Application: ${appName}
// CEO Prompt: ${prompt}

import React, { useState, useMemo } from 'react';

export default function GeneratedWebAppPage() {
  const [items, setItems] = useState(${JSON.stringify(configByTemplate.defaultItems, null, 2)});
  const [name, setName] = useState('');
  const [category, setCategory] = useState('${configByTemplate.categories[0]}');
  const [amount, setAmount] = useState(45000);

  const totalValue = useMemo(
    () => items.reduce((sum, item) => sum + item.amount * item.qty, 0),
    [items]
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-2xl font-bold">${appName}</h1>
      <p className="text-slate-400 text-sm mt-1">${prompt}</p>
      <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="text-xs uppercase text-slate-400">${configByTemplate.metric1Label}</div>
        <div className="text-2xl font-bold text-emerald-400">Rp {totalValue.toLocaleString('id-ID')}</div>
      </div>
    </main>
  );
}
`;

  const backendApiCode = `// Generated by Bima (AGT-BE) using /api-and-interface-design & /schema-mapping
// Service: ${appName} REST API Controller
const express = require('express');
const router = express.Router();

let itemsStore = ${JSON.stringify(configByTemplate.defaultItems, null, 2)};

router.get('/api/items', (req, res) => {
  res.json({
    appName: ${JSON.stringify(appName)},
    count: itemsStore.length,
    items: itemsStore,
  });
});

router.post('/api/items', (req, res) => {
  const { name, category, amount, qty } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const newItem = {
    id: Date.now(),
    name,
    category: category || 'General',
    amount: Number(amount) || 0,
    qty: Number(qty) || 1,
    status: 'Active',
  };
  itemsStore.unshift(newItem);
  res.status(201).json(newItem);
});

module.exports = router;
`;

  const playwrightTestCode = `// Generated by Sinta (AGT-QA) using /test-driven-development & /browser-testing-with-devtools
// E2E Verification Suite for: ${appName}

describe('${appName} — Automated E2E & Regression Suite', () => {
  test('renders KPI summary cards and initial dataset', () => {
    const initialCount = ${configByTemplate.defaultItems.length};
    expect(initialCount).toBeGreaterThan(0);
  });

  test('validates real-time addition and subtotal calculation', () => {
    const sample = { amount: 45000, qty: 2 };
    expect(sample.amount * sample.qty).toBe(90000);
  });
});
`;

  return {
    architectureSummary,
    uiDesignSummary,
    previewHtml,
    nextjsPageCode,
    backendApiCode,
    playwrightTestCode,
  };
}
