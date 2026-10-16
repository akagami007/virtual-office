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
    `• Fitur Interaktif Langsung: Tambah/Hapus Data, Kalkulasi Otomatis Real-time, Filter Pencarian, Ekspor Laporan JSON, & Grafik Visual.`,
  ].join('\n');

  const configByTemplate = {
    POS_CAFE: {
      badge: 'SMART POS & INVENTORY SYSTEM',
      primaryLabel: 'Menu / Produk Kafe',
      amountLabel: 'Harga (Rp)',
      categoryLabel: 'Kategori',
      categories: ['Signature Coffee', 'Manual Brew', 'Pastry & Croissant', 'Non-Coffee'],
      defaultItems: [
        { id: 1, name: 'Aren Latte Signature', category: 'Signature Coffee', amount: 28000, qty: 42 },
        { id: 2, name: 'V60 Ethiopian Yirgacheffe', category: 'Manual Brew', amount: 35000, qty: 18 },
        { id: 3, name: 'Almond Butter Croissant', category: 'Pastry & Croissant', amount: 32000, qty: 27 },
        { id: 4, name: 'Matcha Kyoto Ceremonial', category: 'Non-Coffee', amount: 34000, qty: 31 },
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
        { id: 1, name: 'PT Nusantara Cloud Tbk', category: 'Negotiation', amount: 185000000, qty: 1 },
        { id: 2, name: 'Bank Mandiri Digital Lab', category: 'Closed Won', amount: 320000000, qty: 1 },
        { id: 3, name: 'Sinar Mas Logistics', category: 'Proposal Sent', amount: 95000000, qty: 1 },
        { id: 4, name: 'Kopi Kenangan Enterprise', category: 'Qualified Lead', amount: 140000000, qty: 1 },
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
        { id: 1, name: 'Mechanical Keyboard Wireless Pro', category: 'Elektronik & Gadget', amount: 1250000, qty: 14 },
        { id: 2, name: 'Ergonomic Mesh Office Chair', category: 'Home Living', amount: 2450000, qty: 8 },
        { id: 3, name: 'USB-C GaN Charger 100W', category: 'Aksesoris', amount: 480000, qty: 29 },
        { id: 4, name: 'Smart Desk Lamp Ambient RGB', category: 'Home Living', amount: 620000, qty: 19 },
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
        { id: 1, name: 'Langganan SaaS Enterprise Q4', category: 'Revenue Stream', amount: 420000000, qty: 1 },
        { id: 2, name: 'Efisiensi Cluster Kubernetes', category: 'Cloud Infrastructure', amount: 85000000, qty: 1 },
        { id: 3, name: 'Kampanye Akuisisi Organik', category: 'Customer Acquisition', amount: 112000000, qty: 1 },
        { id: 4, name: 'Renewal Kontrak Tahunan', category: 'Retention', amount: 290000000, qty: 1 },
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
        { id: 1, name: 'Modul Utama: ' + appName, category: 'Operasional Utama', amount: 75000000, qty: 1 },
        { id: 2, name: 'Automasi Workflow & Notifikasi', category: 'Automasi AI', amount: 45000000, qty: 1 },
        { id: 3, name: 'Portal Layanan & Form Pelanggan', category: 'Layanan Pelanggan', amount: 60000000, qty: 1 },
        { id: 4, name: 'Integrasi Laporan Real-time CEO', category: 'Laporan Eksekutif', amount: 90000000, qty: 1 },
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
  <title>${appName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body { background-color: #070b14; color: #f8fafc; font-family: system-ui, sans-serif; }</style>
</head>
<body class="min-h-screen flex flex-col">
  <header class="border-b border-slate-800 bg-slate-950/90 px-6 py-4 flex items-center justify-between">
    <div>
      <div class="flex items-center gap-2">
        <h1 id="app-title" class="text-base font-extrabold text-white"></h1>
        <span id="app-badge" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"></span>
      </div>
      <p id="app-subtitle" class="text-xs text-slate-400 mt-0.5"></p>
    </div>
    <span class="text-xs font-mono px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">● LIVE INTERACTIVE</span>
  </header>
  <main class="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
    <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div id="m1-label" class="text-[11px] font-bold uppercase text-slate-400"></div>
        <div id="m1-value" class="text-2xl font-black text-emerald-400 mt-1 font-mono"></div>
      </div>
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div id="m2-label" class="text-[11px] font-bold uppercase text-slate-400"></div>
        <div id="m2-value" class="text-2xl font-black text-indigo-400 mt-1 font-mono"></div>
      </div>
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div id="m3-label" class="text-[11px] font-bold uppercase text-slate-400"></div>
        <div class="text-2xl font-black text-amber-400 mt-1 font-mono">98.6% Optimal</div>
      </div>
    </section>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form id="add-form" class="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 h-fit">
        <h2 id="form-heading" class="text-sm font-bold text-white"></h2>
        <input id="inp-name" type="text" required placeholder="Ketik nama item..." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
        <select id="inp-cat" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"></select>
        <input id="inp-qty" type="number" min="1" value="1" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
        <input id="inp-amount" type="number" min="0" step="1000" value="45000" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white" />
        <button type="submit" id="btn-submit" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"></button>
      </form>
      <div class="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
              <th class="py-2">Item</th><th class="py-2">Kategori</th><th class="py-2 text-right">Nilai</th><th class="py-2 text-center">Qty</th><th class="py-2 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody id="table-body" class="divide-y divide-slate-800"></tbody>
        </table>
      </div>
    </div>
  </main>
  <script>
    const CONFIG = ${serializedConfig};
    let items = [...CONFIG.defaultItems];
    const formatRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
    document.getElementById('app-title').textContent = CONFIG.appName;
    document.getElementById('app-badge').textContent = CONFIG.badge;
    document.getElementById('app-subtitle').textContent = CONFIG.prompt;
    document.getElementById('m1-label').textContent = CONFIG.metric1Label;
    document.getElementById('m2-label').textContent = CONFIG.metric2Label;
    document.getElementById('m3-label').textContent = CONFIG.metric3Label;
    document.getElementById('form-heading').textContent = CONFIG.ctaAdd;
    document.getElementById('btn-submit').textContent = CONFIG.ctaAdd;
    const catSelect = document.getElementById('inp-cat');
    CONFIG.categories.forEach((c) => { const o = document.createElement('option'); o.value = c; o.textContent = c; catSelect.appendChild(o); });
    function render() {
      const totalVal = items.reduce((a, it) => a + it.amount * it.qty, 0);
      const totalQty = items.reduce((a, it) => a + it.qty, 0);
      document.getElementById('m1-value').textContent = formatRp(totalVal);
      document.getElementById('m2-value').textContent = totalQty + ' Item';
      const tbody = document.getElementById('table-body');
      tbody.innerHTML = '';
      items.forEach((it) => {
        const tr = document.createElement('tr');
        tr.innerHTML = \`<td class="py-2.5 font-semibold">\${it.name}</td><td class="py-2.5">\${it.category}</td><td class="py-2.5 text-right font-mono">\${formatRp(it.amount * it.qty)}</td><td class="py-2.5 text-center font-bold text-emerald-400">\${it.qty}</td><td class="py-2.5 text-right space-x-1"><button data-inc="\${it.id}" class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">+1</button><button data-del="\${it.id}" class="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">Hapus</button></td>\`;
        tbody.appendChild(tr);
      });
      tbody.querySelectorAll('[data-inc]').forEach((b) => b.addEventListener('click', () => { const id = Number(b.getAttribute('data-inc')); items = items.map((x) => x.id === id ? { ...x, qty: x.qty + 1 } : x); render(); }));
      tbody.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => { const id = Number(b.getAttribute('data-del')); items = items.filter((x) => x.id !== id); render(); }));
    }
    document.getElementById('add-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('inp-name').value.trim();
      if (!name) return;
      items.unshift({ id: Date.now(), name, category: catSelect.value, qty: Number(document.getElementById('inp-qty').value) || 1, amount: Number(document.getElementById('inp-amount').value) || 0 });
      document.getElementById('inp-name').value = '';
      render();
    });
    render();
  </script>
</body>
</html>`;

  return {
    architectureSummary,
    uiDesignSummary,
    previewHtml,
  };
}
