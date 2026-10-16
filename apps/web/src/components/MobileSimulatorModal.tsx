'use client';

import React, { useState } from 'react';
import {
  X,
  Smartphone,
  RotateCw,
  Wifi,
  Battery,
  Home,
  ShoppingBag,
  User,
  Layers,
  FileCode,
  Download,
  ExternalLink,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface MobileSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
}

export default function MobileSimulatorModal({
  isOpen,
  onClose,
  projectName = 'NexusDev Mobile App',
}: MobileSimulatorModalProps) {
  const [deviceType, setDeviceType] = useState<'ios' | 'android'>('ios');
  const [activeTab, setActiveTab] = useState<'preview' | 'artifacts'>('preview');
  const [currentScreen, setCurrentScreen] = useState<'home' | 'catalog' | 'profile'>('home');
  const [cartCount, setCartCount] = useState(2);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Simulator & Bundler Aplikasi Mobile (Android & iOS)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Expo SDK 52 • React Native 0.76 • Flutter Web
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pratinjau Instan Layar & Inspeksi Paket Build Native (APK / AAB / IPA)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher Tabs */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'preview'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Live Viewport</span>
              </button>

              <button
                onClick={() => setActiveTab('artifacts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'artifacts'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Build Pipelines (CI/CD)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden bg-slate-950/40 flex items-center justify-center p-4">
          {activeTab === 'preview' ? (
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-4xl h-full">
              {/* Smartphone Frame Container */}
              <div
                className={`relative w-[340px] h-[640px] rounded-[48px] p-3 shadow-2xl border-4 transition-all duration-300 flex flex-col ${
                  deviceType === 'ios'
                    ? 'bg-slate-950 border-slate-700/80 shadow-indigo-500/10'
                    : 'bg-zinc-950 border-zinc-700/80 shadow-emerald-500/10'
                }`}
              >
                {/* Dynamic Island / Camera Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
                  {deviceType === 'ios' ? (
                    <div className="w-24 h-5 bg-black rounded-full flex items-center justify-end px-2 border border-slate-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                    </div>
                  ) : (
                    <div className="w-3.5 h-3.5 bg-black rounded-full border border-zinc-800" />
                  )}
                </div>

                {/* Inner Device Screen */}
                <div className="relative flex-1 bg-slate-900 rounded-[38px] overflow-hidden flex flex-col border border-slate-800/80">
                  {/* Status Bar */}
                  <div className="h-10 px-6 pt-2 flex items-center justify-between text-[11px] font-bold text-slate-300 select-none bg-slate-900/60 z-20">
                    <span>09:41</span>
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3 h-3 text-slate-400" />
                      <Battery className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* App Screen Content Viewport */}
                  <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 text-white">
                    {currentScreen === 'home' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        {/* App Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                              NexusDev Studio
                            </span>
                            <h3 className="text-base font-bold">Discover Store</h3>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
                            CEO
                          </div>
                        </div>

                        {/* Hero Banner Card */}
                        <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 shadow-lg shadow-indigo-600/30 space-y-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/20 text-white">
                            New Release
                          </span>
                          <h4 className="text-sm font-bold leading-snug">
                            Multi-Platform Cloud Sync Active
                          </h4>
                          <p className="text-[11px] text-indigo-100/80 leading-relaxed">
                            Aplikasi React Native (Expo) terhubung langsung ke backend Node.js.
                          </p>
                        </div>

                        {/* Quick Action Grid */}
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/50 space-y-1">
                            <span className="text-[10px] text-slate-400">Total Pesanan</span>
                            <p className="text-sm font-bold text-emerald-400">14 Transaksi</p>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/50 space-y-1">
                            <span className="text-[10px] text-slate-400">Keranjang</span>
                            <p className="text-sm font-bold text-indigo-400">{cartCount} Barang</p>
                          </div>
                        </div>

                        {/* Featured Items */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-bold text-slate-300">Produk Rekomendasi</h5>
                          {[
                            { name: 'Enterprise Cloud Server', price: 'Rp 450.000', stock: 'Tersedia' },
                            { name: 'AI Multi-Agent Seat Pro', price: 'Rp 1.200.000', stock: 'Promo' },
                          ].map((item, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between"
                            >
                              <div>
                                <p className="text-xs font-bold text-slate-200">{item.name}</p>
                                <p className="text-[10px] text-indigo-400 font-semibold">{item.price}</p>
                              </div>
                              <button
                                onClick={() => setCartCount((c) => c + 1)}
                                className="px-2.5 py-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                              >
                                + Beli
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentScreen === 'catalog' && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        <h3 className="text-sm font-bold">Katalog Produk</h3>
                        <div className="space-y-2">
                          {['Database Cluster Micro', 'API Gateway Proxy', 'Docker Sandbox Pod'].map(
                            (cat, i) => (
                              <div
                                key={i}
                                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                              >
                                <span className="text-xs font-medium text-slate-200">{cat}</span>
                                <span className="text-[10px] text-emerald-400 font-mono">Aktif</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {currentScreen === 'profile' && (
                      <div className="space-y-4 animate-in fade-in duration-200 text-center pt-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-600/30 border-2 border-indigo-500 flex items-center justify-center text-xl font-bold text-indigo-300 mx-auto">
                          CEO
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">Product Owner</h4>
                          <p className="text-xs text-slate-400">admin@nexusdev.studio</p>
                        </div>
                        <div className="text-left bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 space-y-2 text-xs">
                          <p className="flex justify-between">
                            <span className="text-slate-400">Status Akun:</span>
                            <span className="text-emerald-400 font-bold">Enterprise VIP</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-400">Mobile Build:</span>
                            <span className="text-indigo-400 font-mono">v1.0.0-rc1</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Navigation Tab Bar */}
                  <div className="h-14 bg-slate-950 border-t border-slate-800/80 px-6 flex items-center justify-around z-20">
                    <button
                      onClick={() => setCurrentScreen('home')}
                      className={`flex flex-col items-center gap-1 ${
                        currentScreen === 'home' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Home className="w-4 h-4" />
                      <span className="text-[9px] font-bold">Beranda</span>
                    </button>

                    <button
                      onClick={() => setCurrentScreen('catalog')}
                      className={`flex flex-col items-center gap-1 ${
                        currentScreen === 'catalog' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span className="text-[9px] font-bold">Katalog</span>
                    </button>

                    <button
                      onClick={() => setCurrentScreen('profile')}
                      className={`flex flex-col items-center gap-1 ${
                        currentScreen === 'profile' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span className="text-[9px] font-bold">Profil</span>
                    </button>
                  </div>

                  {/* Home Indicator Bar */}
                  <div className="h-4 bg-slate-950 flex items-center justify-center">
                    <div className="w-28 h-1 bg-slate-700 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Control Panel Beside Phone */}
              <div className="flex flex-col space-y-4 max-w-sm">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Konfigurasi Perangkat Pratinjau</span>
                  </h4>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeviceType('ios')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        deviceType === 'ios'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      Apple iPhone 16 Pro
                    </button>

                    <button
                      onClick={() => setDeviceType('android')}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        deviceType === 'android'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      Google Pixel 9 Pro
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Viewport di atas dikompilasi langsung oleh agen Raka (`AGT-MOB`) menggunakan konfigurasi
                    Expo Web & StyleSheet, memungkinkan verifikasi interaktif 60fps tanpa beban emulator fisik.
                  </p>
                </div>

                {/* Pipeline Stats */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Status Build Native
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Android (.aab / .apk):</span>
                      <span className="text-emerald-400 font-mono font-bold">Lulus Analisis</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>iOS (.ipa Archive):</span>
                      <span className="text-cyan-400 font-mono font-bold">Signing Ready</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>EAS Cloud Pipeline:</span>
                      <span className="text-indigo-400 font-mono font-bold">Configured</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Build Artifacts & CI/CD Pipeline Tab */
            <div className="w-full max-w-4xl h-full flex flex-col space-y-4 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* EAS Build Configuration */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 font-mono">eas.json</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      Expo Application Services
                    </span>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed border border-slate-800">
                    <code>{`{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal" },
    "production": {
      "android": { "buildType": "app-bundle" },
      "ios": { "simulator": false }
    }
  }
}`}</code>
                  </pre>
                </div>

                {/* Fastlane CI Pipeline */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 font-mono">Fastfile (Fastlane)</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      Automation Lane
                    </span>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 text-[11px] font-mono text-amber-300 overflow-x-auto leading-relaxed border border-slate-800">
                    <code>{`default_platform(:android)

platform :android do
  desc "Build and upload AAB to Google Play Internal Track"
  lane :deploy_internal do
    gradle(task: "bundleRelease")
    upload_to_play_store(track: 'internal')
  end
end`}</code>
                  </pre>
                </div>

                {/* GitHub Actions Mobile CI */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      .github/workflows/mobile-release.yml
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      GitHub Actions Multi-OS Runner
                    </span>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed border border-slate-800">
                    <code>{`name: Mobile Multi-Platform Release
on:
  push:
    tags: ['v*']
jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npx eas-cli build --platform android --non-interactive

  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npx eas-cli build --platform ios --non-interactive`}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
