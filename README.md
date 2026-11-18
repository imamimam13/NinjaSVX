# 🥷 NinjaSVX — Tactical Web Controller for SvxLink

**NinjaSVX** adalah antarmuka web modern, responsif, dan bertema *Dark Tactical Ninja HUD* yang dirancang khusus untuk mengontrol dan memonitor node radio amatir berbasis **[SvxLink (sm0svx/svxlink)](https://github.com/sm0svx/svxlink)**.

Dapat dioperasikan sebagai server node repeater maupun simplex node, serta dapat di-deploy langsung pada **Raspberry Pi (Pi 3/4/5 / Pi Zero 2W)** maupun **Ubuntu / Debian Server**.

---

## ⚡ Fitur Utama (Full Features SvxLink)

### 1. 📡 Real-time Tactical Radio HUD
* **Squelch / RX Active Indicator:** Menyala hijau neon seketika saat ada transmisi masuk (Squelch Open).
* **Transmitter / TX PTT Indicator:** Menyala merah menyala (*pulsing crimson*) saat transmitter sedang transmit.
* **Dual VU Meter (Audio In/Out):** Visualisasi level audio RX & TX secara real-time dengan peak indicator.
* **Current Talker Banner:** Menampilkan Callsign stasiun yang sedang berbicara di radio/reflector.
* **Tactical Web PTT:** Tombol Push-To-Talk langsung dari browser untuk transmit atau test TX.

### 2. 🌐 SvxReflector & Talkgroup Manager
* **Quick Talkgroup Switcher:** Tombol cepat untuk pindah Talkgroup (`91 Worldwide`, `92 Europe`, `93 North America`, `510 Indonesia`, `5100 Nusantara`, `38 Asia Pacific`).
* **Custom TG Dial:** Input nomor Talkgroup bebas untuk langsung berpindah kanal.
* **Talkgroup Monitoring:** Tambah atau hapus monitor TG (`92<TG>#` / `93<TG>#`).
* **Last Heard Stations Table:** Daftar stasiun terakhir yang berbicara lengkap dengan Callsign, TG, durasi transmisi, dan timestamp.

### 3. 📞 EchoLink Matrix
* **EchoLink Status:** Indikator status koneksi EchoLink node Anda (`CALLSIGN-L` / `CALLSIGN-R`).
* **Active Connections List:** Daftar stasiun yang sedang terhubung ke EchoLink Anda, durasi QSO, dan IP client.
* **Direct Dial & Presets:** Input Node ID untuk menghubungkan stasiun lain (contoh: `9999` untuk Echo Test) dan tombol pemutus koneksi (*Disconnect All `#`*).

### 4. 🔢 Virtual DTMF Matrix & Macros
* **Full 4x4 DTMF Matrix:** Tombol sentuh `0-9`, `*`, `#`, `A-D` dengan audio sintetis *dual-tone* (Web Audio API).
* **Preset Macro Buttons:** Tombol perintah cepat untuk modul:
  * `*1#` Aktifkan ModuleParrot (Voice recorder / Echo test)
  * `*#` Status Node
  * `*0#` Menu Bantuan (Help)
  * `#` Deactivate Module / Putus link

### 5. 🧩 SvxLink Module Manager
* Kontrol modul aktif secara visual: **Parrot**, **EchoLink**, **MetarInfo** (laporan cuaca bandara), dan **Help**.
* Indikator status modul (Active / Standby) dan tombol Start/Exit modul.

### 6. 📊 Host Telemetry & Service Control (Khusus Pi & Ubuntu)
* **Raspberry Pi CPU Temperature:** Pemantauan suhu CPU (°C) dengan alert otomatis jika panas berlebih.
* **System Metrics:** Beban CPU (%), penggunaan RAM (MB), sisa disk (%), dan node uptime.
* **Service Control:** Kontrol service daemon `svxlink` (Start, Stop, Restart) langsung dari web.

### 7. 📜 Live Console Log Streamer
* Streaming log `/var/log/svxlink` secara real-time via WebSocket.
* Filter log berbasis teks dan download log ke file `.txt`.

### 8. ⚙️ Interactive Configuration Editor
* Konfigurasi parameter `svxlink.conf` dan `ModuleEchoLink.conf` via GUI (Callsign, CTCSS Tone, Frekuensi, GPIO PTT Pin, GPIO Squelch Pin, Reflector Host/Key).
* Fitur auto-backup config sebelum disimpan.

---

## 🛠️ Arsitektur & Cara Kerja

NinjaSVX berinteraksi langsung dengan core **SvxLink** melalui:
1. **`DTMF_PTY`:** Menginjeksi perintah DTMF dan navigasi Talkgroup ke `/tmp/svxlink_dtmf_pty`.
2. **`STATE_PTY`:** Membaca status state logic repeater secara asinkron dari `/tmp/svxlink_state_pty`.
3. **Log Stream:** Memantau stream status squelch, reflector talker, dan koneksi client dari log SvxLink.
4. **Built-in Tactical Simulator:** Saat dijalankan di komputer development tanpa radio fisik, mode simulator otomatis aktif untuk pengujian visual dan kontrol.

---

## 🚀 Panduan Instalasi Cepat (Raspberry Pi & Ubuntu / Debian)

### 1-Click Auto Installer
Jalankan perintah berikut di terminal Raspberry Pi atau server Ubuntu/Debian Anda:

```bash
git clone https://github.com/imamimam13/NinjaSVX.git
cd NinjaSVX/NinjaSVX
sudo bash scripts/install.sh
```

Skrip ini akan secara otomatis:
1. Menginstal dependensi compile (CMake, GCC, Libsigc++, Libopus, dll.).
2. Meng-clone dan meng-compile source resmi **[sm0svx/svxlink](https://github.com/sm0svx/svxlink)**.
3. Menginstal file suara resmi (Sound clips en_US).
4. Menyiapkan konfigurasi PTY di `/etc/svxlink/svxlink.conf`.
5. Membangun UI Frontend dan Backend Node.js.
6. Mendaftarkan `ninjasvx.service` di systemd dan menyalakan server otomatis saat boot.

Setelah instalasi selesai, buka browser di HP atau laptop:
```
http://<IP_RASPBERRY_PI>:5000
```

---

## 💻 Menjalankan di Mode Development / Simulator

Anda juga bisa menjalankan NinjaSVX di Windows, macOS, atau Linux tanpa radio fisik:

```bash
# Masuk ke direktori NinjaSVX
cd NinjaSVX

# Install semua dependensi
npm run install:all

# Jalankan Backend (Port 5000)
npm run dev:backend

# Di terminal terpisah, jalankan Frontend (Port 3000)
npm run dev:frontend
```

Buka `http://localhost:3000` untuk melihat antarmuka taktikal dengan simulator traffic aktif.

---

## 📁 Struktur Repositori

```
NinjaSVX/
├── backend/
│   ├── src/
│   │   ├── config.js              # Environment & paths configuration
│   │   ├── server.js              # Express + Socket.IO server
│   │   ├── routes/api.js          # REST API endpoints
│   │   ├── svxlink/
│   │   │   ├── ptyManager.js      # DTMF & State PTY handler
│   │   │   ├── logWatcher.js      # SvxLink log parser & state tracker
│   │   │   ├── configParser.js    # svxlink.conf editor & parser
│   │   │   ├── serviceManager.js  # systemctl daemon controller
│   │   │   └── simulator.js       # Auto-traffic simulator for offline dev
│   │   └── system/telemetry.js    # Pi/Ubuntu CPU temp, RAM, and disk metrics
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HeaderHUD.jsx      # Callsign, clocks, and connectivity bar
│   │   │   ├── RadioHUD.jsx       # Large RX/TX indicators & Dual VU Meter
│   │   │   ├── ReflectorPanel.jsx # TG selector, monitors, and Last Heard
│   │   │   ├── EchoLinkPanel.jsx  # Connected stations & dialer
│   │   │   ├── DtmfKeypad.jsx     # 4x4 DTMF matrix with Web Audio tones
│   │   │   ├── ModulesPanel.jsx   # Parrot, EchoLink, Metar, Help modules
│   │   │   ├── SystemHealth.jsx   # Pi CPU Temp, RAM, Uptime & service buttons
│   │   │   ├── LogViewer.jsx      # Real-time console with filter
│   │   │   └── ConfigModal.jsx    # System configuration GUI modal
│   │   ├── context/SvxContext.jsx # Socket.IO state management
│   │   ├── index.css              # Custom tactical HUD styles
│   │   └── App.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── scripts/
│   ├── install.sh                 # One-step auto-installer for Pi & Ubuntu
│   └── svxlink-ninja.conf         # Optimized configuration template
└── README.md
```

---

## 📜 Lisensi & Atribusi

* **NinjaSVX:** GPL-2.0
* **SvxLink Core:** Dikembangkan oleh Tobias Blomberg (SM0SVX) — [https://github.com/sm0svx/svxlink](https://github.com/sm0svx/svxlink)
* Ditujukan untuk komunitas radio amatir dan pengelola repeater di seluruh dunia.
