/**
 * ============================================================================
 * KONFIGURASI KONEKSI BACKEND GOOGLE APPS SCRIPT (WAJIB DIISI 1x)
 * ============================================================================
 * Tempelkan URL Web App (/exec) dari Google Apps Script Anda di bawah ini.
 * Contoh: 'https://script.google.com/macros/s/AKfycbywQhOPxw9XJwimK3OPOO12o9_uVhcg2NC2VLP9gw4Mp5CpueMx4a5jM3Xk3Dc78uA/exec'
 */
var GAS_WEB_APP_URL = 'PASTE_URL_WEB_APP_EXEC_ANDA_DI_SINI';

/**
 * ============================================================================
 * WEDDING INVITATION CONTROLLER & CLIENT INTERACTIVITY (GITHUB PAGES EDITION)
 * ============================================================================
 * Tema: Royal Burgundy Envelope (Crafted by Aurum Project)
 * PIN Admin divalidasi murni di sisi server (code.gs -> DEVELOPER_ADMIN_PIN).
 */

// Status & Variabel Global
var currentAdminPin = '';
var currentGuestAttendance = 'Hadir';
var currentGuestPax = 1;
var isAudioPlaying = false;
var audioFadeInterval = null;
var guestQueueList = [];
var currentQueueIndex = 0;
var parsedBulkGuests = [];
var rawRSVPData = [];
var currentRSVPFilter = 'all';
var publicRSVPFilter = 'all';
var currentGuestFilter = 'all';
var currentGuestCategoryFilter = 'all';
var filterDuplicateWaOnly = false;
var pendingDuplicateGuestPayload = null;
var pendingConfirmAction = null;
var pendingResetScope = 'all';
var countdownIntervalId = null;

// Variabel Audio & Log Sesi QR Scanner Resepsionis
var scanAudioCtx = null;
var scannerSessionLogs = [];
var lastScannedRawText = '';
var lastScannedTimestamp = 0;

// Konfigurasi Dinamis Klien Aktif (100% Sinkron dengan Config_Settings)
var DEFAULT_WA_TEMPLATE =
  'Assalamu\'alaikum Warahmatullahi Wabarakatuh\n\n' +
  'Kepada Yth. Bapak/Ibu/Saudara/i\n' +
  '*{nama_tamu}*\n\n' +
  'Dengan memohon rahmat dan ridho Allah SWT, tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk berkenan hadir serta memberikan doa restu pada acara pernikahan kami:\n\n' +
  '*{nama_mempelai_lengkap}*\n\n' +
  'Informasi lengkap mengenai rangkaian acara, lokasi, serta konfirmasi kehadiran dapat diakses melalui tautan undangan resmi berikut:\n' +
  '{link_undangan}\n\n' +
  'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir pada hari bahagia kami.\n\n' +
  'Atas perhatian dan doa restunya, kami ucapkan terima kasih.\n\n' +
  'Wassalamu\'alaikum Warahmatullahi Wabarakatuh\n\n' +
  'Hormat kami,\n' +
  '*{nama_panggilan}*';

var currentClientConfig = {
  cover_eyebrow: "Walimatul 'Ursy",
  salam_pembuka_judul: 'Maha Suci Allah',
  salam_pembuka_teks: "Dengan memohon rahmat dan ridho Allah Subhanahu Wa Ta'ala, kami mengikrarkan janji suci pernikahan:",
  judul_sesi_1: 'Akad Nikah',
  judul_sesi_2: 'Resepsi Pernikahan',
  audio_title: '',
  nama_lengkap_pria: 'Wahyu Nur Cahyo',
  panggilan_pria: 'Cahyo',
  nama_lengkap_wanita: 'Siti Hanifa',
  panggilan_wanita: 'Hani',
  panggilan_title: 'Cahyo & Hani',
  inisial_mempelai: 'C&H',
  tanggal_cover: 'Sabtu, 19 Desember 2026',
  tanggal_hero: 'SABTU, 19 DESEMBER 2026',
  countdown_target: '2026-12-19T14:00:00',
  akad_cal_end: '2026-12-19T18:00:00',
  resepsi_cal_start: '2026-12-20T09:00:00',
  resepsi_cal_end: '2026-12-20T17:00:00',
  tanggal_akad: 'Sabtu, 19 Desember 2026',
  waktu_akad: '14.00 WIB - Selesai',
  tanggal_resepsi: 'Minggu, 20 Desember 2026',
  waktu_resepsi: '09.00 WIB - Selesai',
  lokasi_acara: 'Desa Aurringit, Kecamatan Tanjung Kemuning, Kabupaten Kaur',
  lokasi_acara_resepsi: 'Desa Aurringit, Kecamatan Tanjung Kemuning, Kabupaten Kaur',
  lokasi_ringkas: 'Tanjung Kemuning, Kabupaten Kaur',
  story_judul_1: 'Babak 1: Takdir Bertemu',
  story_waktu_1: 'Awal Kisah',
  story_judul_2: 'Babak 2: Komitmen',
  story_waktu_2: 'Momen Spesial',
  story_judul_3: 'Babak 3: Ikrar Janji Suci',
  story_waktu_3: 'Menuju Pelaminan',
  teks_pengantar_kado: 'Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda bermaksud memberikan tanda kasih, Anda dapat menyalurkannya melalui rekening atau pengiriman kado:',
  teks_penutup_footer: 'Terima kasih atas segala doa restu dan kehadiran Anda.',
  qris_enabled: 'true',
  story_photo_enabled: 'true',
  twibbon_subtext: 'SABTU, 19 DESEMBER 2026 • DESA AURRINGIT, KAUR',
  wa_message_template: DEFAULT_WA_TEMPLATE
};

// URL Bawaan Streaming Direct MP3 Stabil
var DEFAULT_AUDIO_URL = 'https://docs.google.com/uc?export=download&id=1l3LIArMJt-w9nzO2HbJ6F1YGEbsfbNnf';

// Variabel Live Editor Visual & Penyesuai Foto
var currentPhotoTargetId = 'dynPhotoPria';
var photoTransforms = {
  dynPhotoPria: { zoom: 100, x: 50, y: 50 },
  dynPhotoWanita: { zoom: 100, x: 50, y: 50 },
  dynHeroPhoto: { zoom: 100, x: 50, y: 50 },
  dynStoryFoto1: { zoom: 100, x: 50, y: 50 },
  dynStoryFoto2: { zoom: 100, x: 50, y: 50 },
  dynStoryFoto3: { zoom: 100, x: 50, y: 50 },
  dynGaleri1: { zoom: 100, x: 50, y: 50 },
  dynGaleri2: { zoom: 100, x: 50, y: 50 },
  dynGaleri3: { zoom: 100, x: 50, y: 50 },
  dynGaleri4: { zoom: 100, x: 50, y: 50 },
  dynGaleri5: { zoom: 100, x: 50, y: 50 },
  dynGaleri6: { zoom: 100, x: 50, y: 50 }
};
var liveEditedFields = {};
var isDraggingCanvasPhoto = false;
var canvasDragStartX = 0;
var canvasDragStartY = 0;

// Variabel Fitur: Kalender, Twibbon 9:16 Multi-Template & Kamera Scanner
var currentCalendarEvent = null;
var twibbonUserImg = null;
var twibbonRotation = 0;
var twibbonZoom = 100;
var twibbonOffsetX = 0;
var twibbonOffsetY = 0;
var isDraggingTwibbon = false;
var twibbonDragStartX = 0;
var twibbonDragStartY = 0;
var twibbonLiveStream = null;

// Semua template Twibbon bersifat dinamis & dapat dihapus oleh Admin
var customTwibbonTemplates = [
  { id: 'tpl-royal', name: 'Royal Arch', style: 'royal-arch', url: '', builtIn: false },
  { id: 'tpl-floral', name: 'Floral Gold', style: 'floral-gold', url: '', builtIn: false },
  { id: 'tpl-ivory', name: 'Luxury Ivory', style: 'ivory-classic', url: '', builtIn: false }
];
var selectedTwibbonId = 'tpl-royal';
var twibbonCustomOverlayCache = {};

var scannerStream = null;
var currentCameraFacing = 'environment';
var scannerScanInterval = null;
var scannerOffscreenCanvas = null;

// Elemen DOM Utama
var coverOverlay = null;
var weddingAudio = null;
var floatingPlayer = null;
var vinylDisc = null;
var audioStatusText = null;
var btnOpen = null;
var btnWaxSeal = null;

// ==========================================================================
// 0. JEMBATAN KOMUNIKASI JSON API (GITHUB PAGES <-> GOOGLE APPS SCRIPT)
// ==========================================================================
function isGasApiConfigured() {
  return (
    typeof GAS_WEB_APP_URL === 'string' &&
    GAS_WEB_APP_URL.trim() !== '' &&
    GAS_WEB_APP_URL.indexOf('PASTE_URL_WEB_APP_EXEC') === -1 &&
    GAS_WEB_APP_URL.indexOf('https://') === 0
  );
}

function callGasApiGet(actionName, extraParams) {
  if (!isGasApiConfigured()) {
    return Promise.reject(new Error('URL GAS_WEB_APP_URL belum diisi di file app.js'));
  }
  var url = GAS_WEB_APP_URL.trim() + '?action=' + encodeURIComponent(actionName);
  if (extraParams) {
    for (var k in extraParams) {
      if (extraParams.hasOwnProperty(k)) {
        url += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(extraParams[k]);
      }
    }
  }
  return fetch(url, {
    method: 'GET',
    redirect: 'follow'
  }).then(function(response) {
    if (!response.ok) {
      throw new Error('HTTP Error ' + response.status);
    }
    return response.json();
  });
}

function callGasApiPost(actionName, payloadObj) {
  if (!isGasApiConfigured()) {
    return Promise.reject(new Error('URL GAS_WEB_APP_URL belum diisi di file app.js'));
  }
  var bodyData = Object.assign({ action: actionName }, payloadObj || {});
  return fetch(GAS_WEB_APP_URL.trim(), {
    method: 'POST',
    redirect: 'follow',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(bodyData)
  }).then(function(response) {
    if (!response.ok) {
      throw new Error('HTTP Error ' + response.status);
    }
    return response.json();
  });
}

// ==========================================================================
// 1. ANIMASI PARTIKEL KELOPAK MAWAR & SILUET HATI MELAYANG
// ==========================================================================
function initPetalAnimation() {
  var canvas = document.getElementById('petalCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var particles = [];
  var particleCount = 22;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  var colors = [
    'rgba(197, 160, 89, 0.35)',
    'rgba(122, 26, 39, 0.28)',
    'rgba(229, 195, 120, 0.32)',
    'rgba(245, 210, 215, 0.35)'
  ];

  for (var i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 5 + Math.random() * 8,
      speedY: 0.35 + Math.random() * 0.75,
      speedX: (Math.random() - 0.5) * 0.6,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      color: colors[Math.floor(Math.random() * colors.length)],
      isHeart: (i % 4 === 0)
    });
  }

  function drawPetalOrHeart(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.beginPath();

    if (p.isHeart) {
      var s = p.size * 0.55;
      ctx.moveTo(0, s * 0.4);
      ctx.bezierCurveTo(-s, -s * 0.5, -s * 1.4, s * 0.6, 0, s * 1.4);
      ctx.bezierCurveTo(s * 1.4, s * 0.6, s, -s * 0.5, 0, s * 0.4);
    } else {
      ctx.ellipse(0, 0, p.size * 0.45, p.size, 0, 0, Math.PI * 2);
    }

    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.y * 0.01) * 0.25;
      p.rotation += p.rotSpeed;

      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
      if (p.x > canvas.width + 20) p.x = -20;
      if (p.x < -20) p.x = canvas.width + 20;

      drawPetalOrHeart(p);
    }
    requestAnimationFrame(animate);
  }

  animate();
}

// ==========================================================================
// 2. PERSONALISASI TAMU DARI URL & ANIMASI PEMBUKAAN AMPLOP 3D
// ==========================================================================
function initGuestFromUrl() {
  try {
    var params = new URLSearchParams(window.location.search);
    var toName = params.get('to');
    var catName = params.get('cat');

    var coverGuestEl = document.getElementById('coverGuestName');
    var coverCatEl = document.getElementById('dynGuestCategory');
    var rsvpNamaInput = document.getElementById('rsvpNama');

    if (toName && toName.trim()) {
      var cleanName = toName.trim();
      if (coverGuestEl) coverGuestEl.textContent = cleanName;
      if (rsvpNamaInput && !rsvpNamaInput.value) rsvpNamaInput.value = cleanName;
    }

    if (catName && catName.trim() && coverCatEl) {
      coverCatEl.textContent = catName.trim();
    }
  } catch (e) {
    console.warn('URL param parse warning:', e);
  }
}

function openEnvelope() {
  if (coverOverlay) {
    coverOverlay.classList.add('opened');
  }
  if (!isAudioPlaying) {
    toggleAudio(true);
  }
}

if (btnOpen) {
  btnOpen.addEventListener('click', openEnvelope);
}
if (btnWaxSeal) {
  btnWaxSeal.addEventListener('click', openEnvelope);
}

// ==========================================================================
// 3. PEMUTAR MUSIK LATAR (GOOGLE DRIVE, DIRECT MP3 & APPLE MUSIC WIDGET)
// ==========================================================================
function convertDriveUrl(rawUrl) {
  if (!rawUrl) return '';
  var url = String(rawUrl).trim();

  var matchFile = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFile && matchFile[1]) {
    return 'https://lh3.googleusercontent.com/d/' + matchFile[1];
  }

  var matchOpen = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (matchOpen && matchOpen[1]) {
    return 'https://lh3.googleusercontent.com/d/' + matchOpen[1];
  }

  var matchUc = url.match(/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (matchUc && matchUc[1]) {
    return 'https://lh3.googleusercontent.com/d/' + matchUc[1];
  }

  if (url.indexOf('dropbox.com') !== -1) {
    return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
  }

  return url;
}

function convertAudioStreamUrl(rawUrl) {
  if (!rawUrl) return DEFAULT_AUDIO_URL;
  var url = String(rawUrl).trim();

  var matchFile = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFile && matchFile[1]) {
    return 'https://docs.google.com/uc?export=download&id=' + matchFile[1];
  }
  var matchOpen = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (matchOpen && matchOpen[1]) {
    return 'https://docs.google.com/uc?export=download&id=' + matchOpen[1];
  }
  if (url.indexOf('dropbox.com') !== -1) {
    return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
  }
  return url;
}

function setupAudioPlayer(rawUrl) {
  var cleanUrl = String(rawUrl || '').trim();
  if (!cleanUrl) cleanUrl = DEFAULT_AUDIO_URL;

  if (cleanUrl.indexOf('music.apple.com') !== -1) {
    var embedUrl = cleanUrl.replace('music.apple.com', 'embed.music.apple.com');
    var amIframe = document.getElementById('appleMusicIframe');
    if (amIframe) amIframe.src = embedUrl;
    return;
  }

  var streamUrl = convertAudioStreamUrl(cleanUrl);
  var srcEl = document.getElementById('audioSource');
  if (weddingAudio && srcEl) {
    if (srcEl.getAttribute('src') !== streamUrl) {
      srcEl.setAttribute('src', streamUrl);
      weddingAudio.load();
    }
  }
}

function toggleAudio(forcePlay) {
  var rawCfgUrl = (document.getElementById('cfgAudioUrl') && document.getElementById('cfgAudioUrl').value.trim())
    ? document.getElementById('cfgAudioUrl').value.trim()
    : (currentClientConfig.audio_url || DEFAULT_AUDIO_URL);

  if (rawCfgUrl.indexOf('music.apple.com') !== -1) {
    toggleAppleMusicWidget(true);
    return;
  }

  if (!weddingAudio) return;
  var eqWrap = document.querySelector('.audio-equalizer');

  if (forcePlay === true || !isAudioPlaying) {
    weddingAudio.volume = 0.1;
    var playPromise = weddingAudio.play();
    if (playPromise !== undefined) {
      playPromise.then(function() {
        isAudioPlaying = true;
        if (vinylDisc) vinylDisc.classList.add('playing');
        if (eqWrap) eqWrap.classList.add('playing');
        if (audioStatusText) audioStatusText.textContent = 'Sedang Diputar';

        clearInterval(audioFadeInterval);
        audioFadeInterval = setInterval(function() {
          if (weddingAudio.volume < 0.85) {
            weddingAudio.volume = Math.min(0.85, weddingAudio.volume + 0.1);
          } else {
            clearInterval(audioFadeInterval);
          }
        }, 150);
      }).catch(function(err) {
        console.warn('Autoplay dibatasi browser:', err);
        if (audioStatusText) audioStatusText.textContent = 'Sentuh untuk Putar';
      });
    }
  } else {
    weddingAudio.pause();
    isAudioPlaying = false;
    if (vinylDisc) vinylDisc.classList.remove('playing');
    if (eqWrap) eqWrap.classList.remove('playing');
    if (audioStatusText) audioStatusText.textContent = 'Dijeda';
  }
}

if (floatingPlayer) {
  floatingPlayer.addEventListener('click', function() {
    toggleAudio();
  });
}

function toggleAppleMusicWidget(show) {
  var wrap = document.getElementById('appleMusicWrap');
  if (!wrap) return;
  wrap.style.display = show ? 'block' : 'none';
}

function testPlayAudioDirect() {
  var inp = document.getElementById('cfgAudioUrl');
  var notice = document.getElementById('audioTestNotice');
  var url = inp ? inp.value.trim() : '';

  if (!url) {
    showToast('Masukkan tautan audio MP3 / Google Drive terlebih dahulu.');
    return;
  }

  setupAudioPlayer(url);
  toggleAudio(true);

  if (notice) {
    notice.style.display = 'block';
    notice.textContent = 'Memutar pratinjau audio... (Pastikan volume ponsel aktif)';
  }
}

function applyAudioTitleToUI(rawTitle) {
  var cleanTitle = String(rawTitle || '').trim();
  var displayTitle = cleanTitle ? cleanTitle : 'Lagu Pengiring';
  var titleEl = document.getElementById('dynAudioTitle');
  if (titleEl) {
    titleEl.textContent = displayTitle;
  }
}

function previewAudioTitleLive(val) {
  applyAudioTitleToUI(val);
}

// ==========================================================================
// 4. HITUNG MUNDUR WAKTU ACARA (COUNTDOWN TIMER)
// ==========================================================================
function initCountdown(customTargetStr) {
  var targetStr = customTargetStr || currentClientConfig.countdown_target || '2026-12-19T14:00:00';
  var targetDate = new Date(targetStr).getTime();

  if (isNaN(targetDate)) {
    targetDate = new Date('2026-12-19T14:00:00').getTime();
  }

  if (countdownIntervalId) {
    clearInterval(countdownIntervalId);
  }

  function updateTimer() {
    var now = new Date().getTime();
    var diff = targetDate - now;

    var elDays = document.getElementById('cdDays');
    var elHours = document.getElementById('cdHours');
    var elMins = document.getElementById('cdMinutes');
    var elSecs = document.getElementById('cdSeconds');

    if (diff <= 0) {
      if (elDays) elDays.textContent = '00';
      if (elHours) elHours.textContent = '00';
      if (elMins) elMins.textContent = '00';
      if (elSecs) elSecs.textContent = '00';
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (elDays) elDays.textContent = (days < 10 ? '0' : '') + days;
    if (elHours) elHours.textContent = (hours < 10 ? '0' : '') + hours;
    if (elMins) elMins.textContent = (mins < 10 ? '0' : '') + mins;
    if (elSecs) elSecs.textContent = (secs < 10 ? '0' : '') + secs;
  }

  updateTimer();
  countdownIntervalId = setInterval(updateTimer, 1000);
}

// ==========================================================================
// 5. KONFIRMASI KEHADIRAN TAMU (RSVP) & PAPAN UCAPAN PUBLIK
// ==========================================================================
function selectAttendance(status) {
  currentGuestAttendance = status;
  var btnYes = document.getElementById('btnAttYes');
  var btnNo = document.getElementById('btnAttNo');
  var groupPax = document.getElementById('groupPax');

  if (status === 'Hadir') {
    if (btnYes) btnYes.classList.add('active');
    if (btnNo) btnNo.classList.remove('active');
    if (groupPax) groupPax.style.display = 'block';
  } else {
    if (btnYes) btnYes.classList.remove('active');
    if (btnNo) btnNo.classList.add('active');
    if (groupPax) groupPax.style.display = 'none';
  }
}

function selectPax(count, el) {
  currentGuestPax = parseInt(count, 10) || 1;
  var pills = document.querySelectorAll('.guest-pill');
  pills.forEach(function(p) { p.classList.remove('active'); });
  if (el) el.classList.add('active');
}

function submitRSVPForm() {
  var namaInp = document.getElementById('rsvpNama');
  var kontakInp = document.getElementById('rsvpKontak');
  var pesanInp = document.getElementById('rsvpPesan');
  var btnSubmit = document.getElementById('btnSubmitRSVP');

  var nama = namaInp ? namaInp.value.trim() : '';
  var kontak = kontakInp ? kontakInp.value.trim() : '';
  var pesan = pesanInp ? pesanInp.value.trim() : '';

  if (!nama || !pesan) {
    showToast('Mohon lengkapi nama dan pesan doa restu Anda.');
    return;
  }

  var payload = {
    nama: nama,
    kontak: kontak,
    kehadiran: currentGuestAttendance,
    pax: currentGuestAttendance === 'Hadir' ? currentGuestPax : 0,
    pesan: pesan
  };

  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Mengirim Konfirmasi...';
  }

  if (isGasApiConfigured()) {
    callGasApiPost('submitRSVP', { data: payload })
      .then(function(res) {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Kirim Konfirmasi & Doa';
        }
        if (res && res.status === 'success') {
          showToast('Terima kasih! Konfirmasi kehadiran & doa restu Anda telah tercatat.');
          if (pesanInp) pesanInp.value = '';
          loadRSVPFeedAndAnalytics();
        } else {
          showToast((res && res.message) ? res.message : 'Gagal mengirim konfirmasi.');
        }
      })
      .catch(function(err) {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Kirim Konfirmasi & Doa';
        }
        showToast('Terjadi kesalahan jaringan: ' + err.message);
      });
  } else {
    setTimeout(function() {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Kirim Konfirmasi & Doa';
      }
      rawRSVPData.unshift({
        timestamp: 'Baru saja',
        nama: nama,
        kontak: kontak || '-',
        kehadiran: payload.kehadiran,
        pax: payload.pax,
        pesan: pesan
      });
      filterPublicRSVPFeed();
      showToast('Terima kasih atas doa restu Anda! (Mode Lokal)');
    }, 400);
  }
}

function setPublicRSVPFilter(status, btnEl) {
  publicRSVPFilter = status;
  var pills = document.querySelectorAll('.rsvp-public-filter-row .btn-pub-filter');
  pills.forEach(function(p) { p.classList.remove('active'); });
  if (btnEl) btnEl.classList.add('active');
  filterPublicRSVPFeed();
}

function filterPublicRSVPFeed() {
  var searchInp = document.getElementById('publicSearchRSVP');
  var query = searchInp ? searchInp.value.toLowerCase().trim() : '';

  var filtered = (rawRSVPData || []).filter(function(item) {
    var matchStatus = (publicRSVPFilter === 'all') || (item.kehadiran === publicRSVPFilter);
    var matchText = !query ||
      (item.nama && item.nama.toLowerCase().indexOf(query) !== -1) ||
      (item.pesan && item.pesan.toLowerCase().indexOf(query) !== -1);
    return matchStatus && matchText;
  });

  renderPublicRSVPFeed(filtered);
}

function renderPublicRSVPFeed(list) {
  var feedList = document.getElementById('feedList');
  if (!feedList) return;
  feedList.innerHTML = '';

  if (!list || list.length === 0) {
    feedList.innerHTML = '<div style="text-align:center; font-size:12px; color:#8C787A; padding:14px;">Belum ada ucapan yang sesuai pencarian.</div>';
    return;
  }

  list.forEach(function(item) {
    var isHadir = (item.kehadiran === 'Hadir');
    var badgeText = isHadir ? ('Hadir (' + (item.pax || 1) + ' Tamu)') : 'Berhalangan Hadir';
    var card = document.createElement('div');
    card.className = 'feed-card';
    card.innerHTML =
      '<div class="feed-header">' +
        '<span class="feed-name">' + escapeHtml(item.nama || 'Tamu Undangan') + '</span>' +
        '<span class="feed-time">' + escapeHtml(item.timestamp || '') + '</span>' +
      '</div>' +
      '<span class="feed-badge">' + badgeText + '</span>' +
      '<p class="feed-msg">' + escapeHtml(item.pesan || '') + '</p>';
    feedList.appendChild(card);
  });
}

// ==========================================================================
// 6. UTILITAS CLIPBOARD, TOAST, SLUG & SCROLL REVEAL ANIMATION
// ==========================================================================
function copyToClipboard(textToCopy, label) {
  var cleanText = String(textToCopy || '').trim();
  if (!cleanText) return;

  try {
    var tempInput = document.createElement('textarea');
    tempInput.value = cleanText;
    tempInput.style.position = 'fixed';
    tempInput.style.left = '-9999px';
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast((label || 'Teks') + ' berhasil disalin!');
  } catch (err) {
    showToast('Gagal menyalin otomatis. Silakan salin manual.');
  }
}

function showToast(message) {
  var toast = document.getElementById('toastMsg');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(function() {
    toast.classList.remove('show');
  }, 3000);
}

function getSafeSlug(text) {
  return String(text || 'Undangan')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function initScrollReveal() {
  var elements = document.querySelectorAll('.reveal-on-scroll');
  if (!('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.remove('scroll-hidden');
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(function(el) {
    el.classList.add('scroll-hidden');
    observer.observe(el);
  });
}

// ==========================================================================
// 7. KARTU AKSES KEHORMATAN & QR CODE TAMU (DIGITAL GUEST PASS)
// ==========================================================================
function openGuestPassModal() {
  var modal = document.getElementById('guestPassModal');
  var passNameEl = document.getElementById('passGuestName');
  var passCatEl = document.getElementById('passGuestCat');
  var passQrEl = document.getElementById('passQrImg');
  var passTitleEl = document.getElementById('passWeddingTitle');
  var passEyeEl = document.getElementById('passEyebrowTitle');

  var coverName = document.getElementById('coverGuestName');
  var coverCat = document.getElementById('dynGuestCategory');

  var guestName = coverName ? coverName.textContent.trim() : 'Tamu Undangan Terhormat';
  var guestCat = coverCat ? coverCat.textContent.trim() : 'Tamu Kehormatan';

  if (passNameEl) passNameEl.textContent = guestName;
  if (passCatEl) passCatEl.textContent = guestCat;
  if (passTitleEl) passTitleEl.textContent = currentClientConfig.panggilan_title || 'Mempelai';
  if (passEyeEl) passEyeEl.textContent = currentClientConfig.cover_eyebrow || "Walimatul 'Ursy";

  var qrPayload = JSON.stringify({
    nama: guestName,
    kategori: guestCat,
    acara: currentClientConfig.panggilan_title || 'Wedding'
  });

  if (passQrEl) {
    passQrEl.src = 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=6&color=4A0E17&bgcolor=FFFFFF&data=' + encodeURIComponent(qrPayload);
  }

  if (modal) modal.classList.add('show');
}

function closeGuestPassModal() {
  var modal = document.getElementById('guestPassModal');
  if (modal) modal.classList.remove('show');
}

// ==========================================================================
// 8. SIMPAN KALENDER GANDA (GOOGLE CALENDAR & APPLE / ICAL .ICS)
// ==========================================================================
function openDynamicCalendarModal(sessionType) {
  var coupleTitle = currentClientConfig.panggilan_title || 'Mempelai';
  var isAkad = (sessionType === 'akad');

  var sessionLabel = isAkad
    ? (currentClientConfig.judul_sesi_1 || 'Akad Nikah')
    : (currentClientConfig.judul_sesi_2 || 'Resepsi Pernikahan');

  var startRaw = isAkad
    ? (currentClientConfig.countdown_target || '2026-12-19T14:00:00')
    : (currentClientConfig.resepsi_cal_start || '2026-12-20T09:00:00');

  var endRaw = isAkad
    ? (currentClientConfig.akad_cal_end || '2026-12-19T18:00:00')
    : (currentClientConfig.resepsi_cal_end || '2026-12-20T17:00:00');

  var lokasi = isAkad
    ? (currentClientConfig.lokasi_acara || '')
    : (currentClientConfig.lokasi_acara_resepsi || currentClientConfig.lokasi_acara || '');

  currentCalendarEvent = {
    title: sessionLabel + ' — ' + coupleTitle,
    start: startRaw,
    end: endRaw,
    location: lokasi,
    description: 'Undangan Resmi ' + sessionLabel + ' Pernikahan ' + coupleTitle + '. Lokasi: ' + lokasi
  };

  var modal = document.getElementById('calendarChoiceModal');
  if (modal) modal.classList.add('show');
}

function closeCalendarChoiceModal() {
  var modal = document.getElementById('calendarChoiceModal');
  if (modal) modal.classList.remove('show');
}

function formatIsoToCalDate(isoStr) {
  var d = new Date(isoStr);
  if (isNaN(d.getTime())) d = new Date('2026-12-19T14:00:00');
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function confirmGoogleCalendar() {
  if (!currentCalendarEvent) return;
  var startStr = formatIsoToCalDate(currentCalendarEvent.start);
  var endStr = formatIsoToCalDate(currentCalendarEvent.end);

  var gcalUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(currentCalendarEvent.title) +
    '&dates=' + startStr + '/' + endStr +
    '&details=' + encodeURIComponent(currentCalendarEvent.description) +
    '&location=' + encodeURIComponent(currentCalendarEvent.location);

  window.open(gcalUrl, '_blank');
  closeCalendarChoiceModal();
}

function confirmAppleCalendar() {
  if (!currentCalendarEvent) return;
  var startStr = formatIsoToCalDate(currentCalendarEvent.start);
  var endStr = formatIsoToCalDate(currentCalendarEvent.end);

  var icsContent =
    'BEGIN:VCALENDAR\r\n' +
    'VERSION:2.0\r\n' +
    'PRODID:-//Aurum Project//Wedding Invitation//ID\r\n' +
    'BEGIN:VEVENT\r\n' +
    'UID:' + new Date().getTime() + '@aurumproject\r\n' +
    'DTSTAMP:' + formatIsoToCalDate(new Date().toISOString()) + '\r\n' +
    'DTSTART:' + startStr + '\r\n' +
    'DTEND:' + endStr + '\r\n' +
    'SUMMARY:' + currentCalendarEvent.title + '\r\n' +
    'DESCRIPTION:' + currentCalendarEvent.description + '\r\n' +
    'LOCATION:' + currentCalendarEvent.location + '\r\n' +
    'END:VEVENT\r\n' +
    'END:VCALENDAR';

  var blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = getSafeSlug(currentCalendarEvent.title) + '.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  closeCalendarChoiceModal();
  showToast('File kalender (.ics) berhasil diunduh!');
}

// ==========================================================================
// 9. STUDIO TWIBBON 9:16 MULTI-TEMPLATE & KAMERA SELFIE LANGSUNG (NATIVE HTTPS)
// ==========================================================================
function renderAdminTwibbonList() {
  var listEl = document.getElementById('adminTwibbonList');
  if (!listEl) return;
  listEl.innerHTML = '';

  if (!customTwibbonTemplates || customTwibbonTemplates.length === 0) {
    listEl.innerHTML = '<div style="font-size:11px; color:#8C787A; padding:8px; text-align:center;">Belum ada template Twibbon aktif.</div>';
    return;
  }

  customTwibbonTemplates.forEach(function(tpl) {
    var item = document.createElement('div');
    item.className = 'admin-twibbon-item';
    item.innerHTML =
      '<div><strong>' + escapeHtml(tpl.name) + '</strong> <span style="color:#6B5558;">(' + escapeHtml(tpl.style) + ')</span></div>' +
      '<button type="button" class="btn-del-twibbon" onclick="deleteCustomTwibbonTemplate(\'' + escapeJsAttr(tpl.id) + '\')">Hapus</button>';
    listEl.appendChild(item);
  });
}

function addCustomTwibbonTemplate() {
  var nameInp = document.getElementById('newTwibbonName');
  var styleSel = document.getElementById('newTwibbonStyle');
  var urlInp = document.getElementById('newTwibbonUrl');

  var name = nameInp ? nameInp.value.trim() : '';
  var style = styleSel ? styleSel.value : 'royal-arch';
  var url = urlInp ? urlInp.value.trim() : '';

  if (!name) {
    showToast('Masukkan nama desain Twibbon terlebih dahulu.');
    return;
  }

  var newTpl = {
    id: 'tpl-' + new Date().getTime(),
    name: name,
    style: style,
    url: url,
    builtIn: false
  };

  customTwibbonTemplates.push(newTpl);
  selectedTwibbonId = newTpl.id;

  if (nameInp) nameInp.value = '';
  if (urlInp) urlInp.value = '';

  renderAdminTwibbonList();
  renderGuestTwibbonSelector();
  showToast('Desain Twibbon ditambahkan! Jangan lupa klik Simpan.');
}

function deleteCustomTwibbonTemplate(tplId) {
  customTwibbonTemplates = (customTwibbonTemplates || []).filter(function(t) {
    return t.id !== tplId;
  });
  if (customTwibbonTemplates.length > 0) {
    selectedTwibbonId = customTwibbonTemplates[0].id;
  } else {
    selectedTwibbonId = '';
  }
  renderAdminTwibbonList();
  renderGuestTwibbonSelector();
  showToast('Template Twibbon dihapus.');
}

function renderGuestTwibbonSelector() {
  var strip = document.getElementById('twibbonTemplateStrip');
  var guestWrap = document.getElementById('twibbonGuestActionWrap');

  if (guestWrap) {
    guestWrap.style.display = (customTwibbonTemplates && customTwibbonTemplates.length > 0) ? 'block' : 'none';
  }

  if (!strip) return;
  strip.innerHTML = '';

  if (!customTwibbonTemplates || customTwibbonTemplates.length === 0) return;

  if (!selectedTwibbonId || !customTwibbonTemplates.some(function(t) { return t.id === selectedTwibbonId; })) {
    selectedTwibbonId = customTwibbonTemplates[0].id;
  }

  var initials = currentClientConfig.inisial_mempelai || 'C&H';

  customTwibbonTemplates.forEach(function(tpl) {
    var bgStyle = 'background:#4A0E17; color:#E5C378;';
    if (tpl.style === 'floral-gold') bgStyle = 'background:#7A1A27; color:#FFF;';
    else if (tpl.style === 'ivory-classic') bgStyle = 'background:#FAF5ED; color:#4A0E17;';

    var card = document.createElement('div');
    card.className = 'twibbon-tpl-card' + (tpl.id === selectedTwibbonId ? ' active' : '');
    card.onclick = function() { selectTwibbonTemplate(tpl.id); };
    card.innerHTML =
      '<div class="twibbon-tpl-swatch" style="' + bgStyle + '">' + escapeHtml(initials) + '</div>' +
      '<span class="twibbon-tpl-label">' + escapeHtml(tpl.name) + '</span>';
    strip.appendChild(card);
  });
}

function selectTwibbonTemplate(tplId) {
  selectedTwibbonId = tplId;
  renderGuestTwibbonSelector();
  drawTwibbonCanvas();
}

function openTwibbonModal() {
  renderGuestTwibbonSelector();
  var modal = document.getElementById('twibbonModal');
  if (modal) modal.classList.add('show');
  initTwibbonDragEvents();
  drawTwibbonCanvas();
}

function closeTwibbonModal() {
  stopTwibbonCamera();
  var modal = document.getElementById('twibbonModal');
  if (modal) modal.classList.remove('show');
}

function stopTwibbonCamera() {
  if (twibbonLiveStream) {
    twibbonLiveStream.getTracks().forEach(function(track) { track.stop(); });
    twibbonLiveStream = null;
  }
  var video = document.getElementById('twibbonLiveVideo');
  var btnSnap = document.getElementById('btnTwibbonSnap');
  if (video) video.style.display = 'none';
  if (btnSnap) btnSnap.style.display = 'none';
}

function openTwibbonCamera() {
  var video = document.getElementById('twibbonLiveVideo');
  var btnSnap = document.getElementById('btnTwibbonSnap');

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && video) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then(function(stream) {
        twibbonLiveStream = stream;
        video.srcObject = stream;
        video.style.display = 'block';
        if (btnSnap) btnSnap.style.display = 'inline-block';
      })
      .catch(function() {
        var camInp = document.getElementById('twibbonCameraInput');
        if (camInp) camInp.click();
      });
  } else {
    var camInp = document.getElementById('twibbonCameraInput');
    if (camInp) camInp.click();
  }
}

function captureTwibbonLiveFrame() {
  var video = document.getElementById('twibbonLiveVideo');
  if (!video || !video.videoWidth) return;

  var tempCanvas = document.createElement('canvas');
  tempCanvas.width = video.videoWidth;
  tempCanvas.height = video.videoHeight;
  var tCtx = tempCanvas.getContext('2d');
  tCtx.translate(tempCanvas.width, 0);
  tCtx.scale(-1, 1);
  tCtx.drawImage(video, 0, 0);

  var img = new Image();
  img.onload = function() {
    twibbonUserImg = img;
    twibbonZoom = 100;
    twibbonOffsetX = 0;
    twibbonOffsetY = 0;
    twibbonRotation = 0;
    var sl = document.getElementById('twibbonZoomSlider');
    var lb = document.getElementById('lblTwibbonZoom');
    if (sl) sl.value = 100;
    if (lb) lb.textContent = '100%';
    stopTwibbonCamera();
    drawTwibbonCanvas();
  };
  img.src = tempCanvas.toDataURL('image/png');
}

function handleTwibbonImageUpload(input) {
  var file = input.files && input.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      twibbonUserImg = img;
      twibbonZoom = 100;
      twibbonOffsetX = 0;
      twibbonOffsetY = 0;
      twibbonRotation = 0;
      var sl = document.getElementById('twibbonZoomSlider');
      var lb = document.getElementById('lblTwibbonZoom');
      if (sl) sl.value = 100;
      if (lb) lb.textContent = '100%';
      stopTwibbonCamera();
      drawTwibbonCanvas();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function onTwibbonZoomChanged(val) {
  twibbonZoom = parseInt(val, 10) || 100;
  var lb = document.getElementById('lblTwibbonZoom');
  if (lb) lb.textContent = twibbonZoom + '%';
  drawTwibbonCanvas();
}

function rotateTwibbonPhoto() {
  twibbonRotation = (twibbonRotation + 90) % 360;
  drawTwibbonCanvas();
}

function initTwibbonDragEvents() {
  var container = document.getElementById('twibbonContainer');
  if (!container || container._dragBound) return;
  container._dragBound = true;

  container.addEventListener('mousedown', function(e) {
    if (!twibbonUserImg) return;
    isDraggingTwibbon = true;
    twibbonDragStartX = e.clientX;
    twibbonDragStartY = e.clientY;
  });

  window.addEventListener('mousemove', function(e) {
    if (!isDraggingTwibbon) return;
    var dx = (e.clientX - twibbonDragStartX) * 4;
    var dy = (e.clientY - twibbonDragStartY) * 4;
    twibbonDragStartX = e.clientX;
    twibbonDragStartY = e.clientY;
    twibbonOffsetX += dx;
    twibbonOffsetY += dy;
    drawTwibbonCanvas();
  });

  window.addEventListener('mouseup', function() {
    isDraggingTwibbon = false;
  });

  container.addEventListener('touchstart', function(e) {
    if (!twibbonUserImg || !e.touches[0]) return;
    isDraggingTwibbon = true;
    twibbonDragStartX = e.touches[0].clientX;
    twibbonDragStartY = e.touches[0].clientY;
  }, { passive: true });

  container.addEventListener('touchmove', function(e) {
    if (!isDraggingTwibbon || !e.touches[0]) return;
    var dx = (e.touches[0].clientX - twibbonDragStartX) * 4;
    var dy = (e.touches[0].clientY - twibbonDragStartY) * 4;
    twibbonDragStartX = e.touches[0].clientX;
    twibbonDragStartY = e.touches[0].clientY;
    twibbonOffsetX += dx;
    twibbonOffsetY += dy;
    drawTwibbonCanvas();
  }, { passive: true });

  container.addEventListener('touchend', function() {
    isDraggingTwibbon = false;
  });
}

function drawTwibbonCanvas() {
  var canvas = document.getElementById('twibbonCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = canvas.width;
  var H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  var activeTpl = (customTwibbonTemplates || []).find(function(t) { return t.id === selectedTwibbonId; }) || {
    style: 'royal-arch',
    url: ''
  };

  ctx.fillStyle = activeTpl.style === 'ivory-classic' ? '#FAF5ED' : '#2A060B';
  ctx.fillRect(0, 0, W, H);

  if (twibbonUserImg) {
    ctx.save();
    ctx.translate(W / 2 + twibbonOffsetX, H / 2 + twibbonOffsetY);
    ctx.rotate((twibbonRotation * Math.PI) / 180);
    var baseScale = Math.max(W / twibbonUserImg.width, H / twibbonUserImg.height);
    var finalScale = baseScale * (twibbonZoom / 100);
    var drawW = twibbonUserImg.width * finalScale;
    var drawH = twibbonUserImg.height * finalScale;
    ctx.drawImage(twibbonUserImg, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  } else {
    ctx.fillStyle = activeTpl.style === 'ivory-classic' ? '#6B5558' : '#E5C378';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Ketuk Kamera Selfie atau Galeri', W / 2, H / 2 - 20);
    ctx.font = '26px sans-serif';
    ctx.fillText('untuk memasang foto Anda di bingkai ini', W / 2, H / 2 + 30);
  }

  if (activeTpl.url && activeTpl.url.trim()) {
    var cleanOverlayUrl = convertDriveUrl(activeTpl.url.trim());
    if (twibbonCustomOverlayCache[cleanOverlayUrl]) {
      ctx.drawImage(twibbonCustomOverlayCache[cleanOverlayUrl], 0, 0, W, H);
      return;
    } else {
      var ovImg = new Image();
      ovImg.crossOrigin = 'anonymous';
      ovImg.onload = function() {
        twibbonCustomOverlayCache[cleanOverlayUrl] = ovImg;
        drawTwibbonCanvas();
      };
      ovImg.src = cleanOverlayUrl;
    }
  }

  var isIvory = (activeTpl.style === 'ivory-classic');
  var borderGold = isIvory ? '#9A7730' : '#E5C378';
  var bandBg = isIvory ? 'rgba(250, 245, 237, 0.92)' : 'rgba(42, 6, 11, 0.88)';
  var textPrimary = isIvory ? '#4A0E17' : '#FFFFFF';
  var textAccent = isIvory ? '#9A7730' : '#E5C378';

  ctx.strokeStyle = borderGold;
  ctx.lineWidth = 14;
  ctx.strokeRect(36, 36, W - 72, H - 72);

  ctx.lineWidth = 4;
  ctx.strokeRect(58, 58, W - 116, H - 116);

  ctx.fillStyle = bandBg;
  ctx.fillRect(58, 58, W - 116, 175);
  ctx.fillStyle = textAccent;
  ctx.font = 'bold 28px serif';
  ctx.textAlign = 'center';
  ctx.fillText((currentClientConfig.cover_eyebrow || "WALIMATUL 'URSY").toUpperCase(), W / 2, 130);
  ctx.fillStyle = textPrimary;
  ctx.font = 'italic bold 56px serif';
  ctx.fillText(currentClientConfig.panggilan_title || 'Mempelai', W / 2, 198);

  ctx.fillStyle = bandBg;
  ctx.fillRect(58, H - 255, W - 116, 197);
  ctx.fillStyle = textAccent;
  ctx.font = 'bold 30px serif';
  ctx.fillText(currentClientConfig.inisial_mempelai || 'C&H', W / 2, H - 190);
  ctx.fillStyle = textPrimary;
  ctx.font = '24px sans-serif';
  var subText = (document.getElementById('cfgTwibbonSubtext') && document.getElementById('cfgTwibbonSubtext').value.trim())
    ? document.getElementById('cfgTwibbonSubtext').value.trim()
    : (currentClientConfig.twibbon_subtext || '');
  ctx.fillText(subText, W / 2, H - 135);
  ctx.fillStyle = textAccent;
  ctx.font = 'italic 22px serif';
  ctx.fillText('Turut Berbahagia & Mengucapkan Selamat', W / 2, H - 88);
}

function downloadTwibbonResult() {
  var canvas = document.getElementById('twibbonCanvas');
  if (!canvas) return;
  try {
    var dataUrl = canvas.toDataURL('image/png');
    var link = document.createElement('a');
    link.download = 'Twibbon_' + getSafeSlug(currentClientConfig.panggilan_title || 'Wedding') + '.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Twibbon 9:16 berhasil diunduh!');
  } catch (err) {
    showToast('Gagal mengunduh Twibbon: ' + err.message);
  }
}

// ==========================================================================
// 10. PEMINDAI QR RESEPSIONIS (KAMERA LIVE HTTPS + BUNYI + LIVE LOG)
// ==========================================================================
function unlockScanAudioContext() {
  try {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!scanAudioCtx) {
      scanAudioCtx = new AudioCtx();
    }
    if (scanAudioCtx.state === 'suspended') {
      scanAudioCtx.resume();
    }
  } catch (e) {
    console.warn('Web Audio API tidak tersedia:', e);
  }
}

function playScanBeepSound(type) {
  try {
    unlockScanAudioContext();
    if (!scanAudioCtx) return;

    var now = scanAudioCtx.currentTime;
    var osc = scanAudioCtx.createOscillator();
    var gain = scanAudioCtx.createGain();
    osc.connect(gain);
    gain.connect(scanAudioCtx.destination);

    if (type === 'duplicate') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(370, now + 0.14);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.start(now);
      osc.stop(now + 0.33);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1318.5, now + 0.11);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      osc.start(now);
      osc.stop(now + 0.37);
    }
  } catch (e) {
    console.warn('Gagal memutar bunyi scan:', e);
  }
}

function openScannerModal() {
  unlockScanAudioContext();
  var modal = document.getElementById('scannerModal');
  if (modal) modal.classList.add('show');
  startLiveQrScanner();
}

function closeScannerModal() {
  stopScannerCamera();
  var modal = document.getElementById('scannerModal');
  if (modal) modal.classList.remove('show');
}

function stopScannerCamera() {
  if (scannerScanInterval) {
    clearInterval(scannerScanInterval);
    scannerScanInterval = null;
  }
  if (scannerStream) {
    scannerStream.getTracks().forEach(function(track) { track.stop(); });
    scannerStream = null;
  }
}

function switchCameraFacing() {
  currentCameraFacing = (currentCameraFacing === 'environment') ? 'user' : 'environment';
  stopScannerCamera();
  startLiveQrScanner();
}

function startLiveQrScanner() {
  var video = document.getElementById('scannerVideo');
  if (!video || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast('Browser tidak mendukung kamera langsung. Gunakan tombol Foto QR via Kamera HP.');
    return;
  }

  navigator.mediaDevices.getUserMedia({
    video: { facingMode: currentCameraFacing },
    audio: false
  }).then(function(stream) {
    scannerStream = stream;
    video.srcObject = stream;
    video.play();

    if (!scannerOffscreenCanvas) {
      scannerOffscreenCanvas = document.createElement('canvas');
    }

    clearInterval(scannerScanInterval);
    scannerScanInterval = setInterval(function() {
      if (!video.videoWidth || !video.videoHeight || typeof jsQR === 'undefined') return;
      scannerOffscreenCanvas.width = video.videoWidth;
      scannerOffscreenCanvas.height = video.videoHeight;
      var ctx = scannerOffscreenCanvas.getContext('2d');
      ctx.drawImage(video, 0, 0, scannerOffscreenCanvas.width, scannerOffscreenCanvas.height);
      var imgData = ctx.getImageData(0, 0, scannerOffscreenCanvas.width, scannerOffscreenCanvas.height);
      var code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'dontInvert' });

      if (code && code.data) {
        var nowMs = new Date().getTime();
        if (code.data !== lastScannedRawText || (nowMs - lastScannedTimestamp) > 3500) {
          lastScannedRawText = code.data;
          lastScannedTimestamp = nowMs;
          onQRCodeScanned(code.data);
        }
      }
    }, 300);
  }).catch(function(err) {
    console.warn('Kamera live scanner gagal diakses:', err);
    showToast('Izin kamera ditolak atau sedang dipakai aplikasi lain. Gunakan tombol Foto QR.');
  });
}

function handleQrPhotoCapture(input) {
  unlockScanAudioContext();
  var file = input.files && input.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      if (typeof jsQR === 'undefined') {
        showToast('Pustaka pembaca QR sedang dimuat...');
        return;
      }
      var c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      var ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      var imgData = ctx.getImageData(0, 0, c.width, c.height);
      var code = jsQR(imgData.data, imgData.width, imgData.height);
      if (code && code.data) {
        onQRCodeScanned(code.data);
      } else {
        showToast('QR Code tidak terdeteksi pada foto. Pastikan fokus jelas.');
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function onQRCodeScanned(rawText) {
  var guestName = String(rawText || '').trim();
  var guestCategory = 'Tamu';

  try {
    var parsed = JSON.parse(rawText);
    if (parsed && parsed.nama) {
      guestName = String(parsed.nama).trim();
      guestCategory = String(parsed.kategori || 'Tamu').trim();
    }
  } catch (e) {
    // Gunakan teks mentah jika bukan JSON
  }

  if (!guestName) return;

  var alertBox = document.getElementById('scanSuccessAlert');
  var nameSpan = document.getElementById('scanGuestName');
  if (nameSpan) nameSpan.textContent = guestName;
  if (alertBox) alertBox.style.display = 'block';

  if (isGasApiConfigured()) {
    callGasApiPost('checkInGuest', {
      identifier: guestName,
      pin: currentAdminPin,
      categoryHint: guestCategory
    })
      .then(function(res) {
        if (res && res.status === 'success') {
          playScanBeepSound('success');
          appendScannerLiveLog(res.guestName || guestName, res.checkinTime || 'Baru saja', false);
          showToast('✅ Check-In Berhasil: ' + (res.guestName || guestName));
          loadGuestList();
        } else if (res && res.status === 'already_checked_in') {
          playScanBeepSound('duplicate');
          appendScannerLiveLog(res.guestName || guestName, res.checkinTime || '-', true);
          showToast('⚠️ Tamu sudah hadir sebelumnya (' + formatCleanTimeOnly(res.checkinTime || '-') + ' WIB)');
        } else {
          showToast((res && res.message) ? res.message : 'Gagal mencatat kehadiran.');
        }
      })
      .catch(function(err) {
        showToast('Error scanner: ' + err.message);
      });
  }
}

function appendScannerLiveLog(guestName, timeStr, isDuplicate) {
  var listEl = document.getElementById('scannerLiveLogList');
  var countEl = document.getElementById('scannerSessionCount');
  if (!listEl) return;

  scannerSessionLogs.unshift({
    nama: guestName,
    waktu: formatCleanTimeOnly(timeStr),
    duplicate: isDuplicate
  });

  var validCount = scannerSessionLogs.filter(function(x) { return !x.duplicate; }).length;
  if (countEl) countEl.textContent = validCount + ' Hadir';

  listEl.innerHTML = '';
  scannerSessionLogs.slice(0, 8).forEach(function(item) {
    var row = document.createElement('div');
    row.className = 'scanner-log-item' + (item.duplicate ? ' is-duplicate' : '');
    row.innerHTML =
      '<strong>' + escapeHtml(item.nama) + '</strong>' +
      '<span>' + (item.duplicate ? '⚠️ Sudah Hadir (' + escapeHtml(item.waktu) + ')' : '✅ ' + escapeHtml(item.waktu) + ' WIB') + '</span>';
    listEl.appendChild(row);
  });
}

function switchSubTab(containerId, targetPanelId, btnEl) {
  var container = document.getElementById(containerId);
  if (container) {
    container.querySelectorAll('.btn-subtab').forEach(function(btn) {
      btn.classList.remove('active');
    });
    var parentScreen = container.closest('.screen-container');
    if (parentScreen) {
      parentScreen.querySelectorAll('.subtab-panel').forEach(function(panel) {
        panel.classList.remove('active');
      });
    }
  }

  if (btnEl) btnEl.classList.add('active');
  var targetPanel = document.getElementById(targetPanelId);
  if (targetPanel) targetPanel.classList.add('active');
}

// ==========================================================================
// 11. LAPORAN RAPI RSVP & DAFTAR HADIR HARI-H (EXCEL .XLS & UNDUH PDF LANGSUNG)
// ==========================================================================
function formatCleanTimeOnly(rawTime) {
  var str = String(rawTime || '').trim();
  if (!str || str === '-') return '-';
  var match = str.match(/(?:^|\s|T)(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?/);
  if (match) {
    var hh = parseInt(match[1], 10);
    var mm = match[2];
    if (!isNaN(hh) && hh >= 0 && hh <= 23) {
      var hhPad = (hh < 10 ? '0' : '') + hh;
      return hhPad + ':' + mm;
    }
  }
  return str;
}

function getFilteredRSVPData() {
  var searchInp = document.getElementById('searchRSVPInput');
  var searchVal = searchInp ? searchInp.value.toLowerCase().trim() : '';

  return (rawRSVPData || []).filter(function(item) {
    var matchStatus = (currentRSVPFilter === 'all') || (item.kehadiran === currentRSVPFilter);
    var matchSearch = !searchVal ||
      (item.nama && item.nama.toLowerCase().indexOf(searchVal) !== -1) ||
      (item.pesan && item.pesan.toLowerCase().indexOf(searchVal) !== -1) ||
      (item.kontak && item.kontak.toLowerCase().indexOf(searchVal) !== -1);
    return matchStatus && matchSearch;
  });
}

function buildAurumReportFooterHtml(colSpanCount) {
  return (
    '<tr><td colspan="' + colSpanCount + '" style="height:10px; border:none;"></td></tr>' +
    '<tr>' +
      '<td colspan="' + colSpanCount + '" style="background-color:#FAF5ED; border:1px solid #D5C8BD; padding:9px 12px; text-align:center; font-size:10.5px; color:#6B5558;">' +
        'Crafted with &hearts; by <strong style="color:#4A0E17;">Aurum Project</strong> &mdash; Digital Wedding Invitation &amp; Event Management<br>' +
        '<a href="https://www.instagram.com/_aurumproject__/" style="color:#4A0E17; text-decoration:none; font-weight:bold;">Instagram: @_aurumproject__</a>' +
        ' &nbsp;|&nbsp; ' +
        '<a href="https://lynk.id/aurum__" style="color:#4A0E17; text-decoration:none; font-weight:bold;">Katalog &amp; Order: lynk.id/aurum__</a>' +
        ' &nbsp;|&nbsp; ' +
        '<a href="https://wa.me/6282237998997" style="color:#144D2E; text-decoration:none; font-weight:bold;">WhatsApp: 0822-3799-8997</a>' +
      '</td>' +
    '</tr>'
  );
}

function buildRSVPReportHtml() {
  var list = getFilteredRSVPData();
  var total = list.length;
  var hadirCount = 0;
  var tidakHadirCount = 0;
  var totalPax = 0;

  list.forEach(function(item) {
    if (item.kehadiran === 'Hadir') {
      hadirCount++;
      totalPax += (parseInt(item.pax, 10) || 1);
    } else {
      tidakHadirCount++;
    }
  });

  var filterDesc = (currentRSVPFilter === 'all') ? 'Semua Status' : currentRSVPFilter;
  var coupleTitle = escapeHtml(currentClientConfig.panggilan_title || 'Mempelai');
  var fullNames = escapeHtml((currentClientConfig.nama_lengkap_pria || '') + ' & ' + (currentClientConfig.nama_lengkap_wanita || ''));
  var tglResepsi = escapeHtml(currentClientConfig.tanggal_resepsi || currentClientConfig.tanggal_akad || '');
  var lokasi = escapeHtml(currentClientConfig.lokasi_acara || '');
  var waktuCetak = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

  var rowsHtml = '';
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var isHadir = (item.kehadiran === 'Hadir');
    var rowBg = isHadir ? '#ECFDF5' : '#FFFBEB';
    var statusColor = isHadir ? '#065F46' : '#92400E';
    var statusLabel = isHadir ? 'HADIR' : 'Berhalangan';
    var paxVal = isHadir ? ((parseInt(item.pax, 10) || 1) + ' Pax') : '0';

    rowsHtml +=
      '<tr style="background-color:' + rowBg + '; vertical-align:middle;">' +
        '<td style="border:1px solid #C8B6A6; padding:6px; text-align:center;">' + (i + 1) + '</td>' +
        '<td style="border:1px solid #C8B6A6; padding:6px 8px; font-weight:bold; color:#2B1619;">' + escapeHtml(item.nama || '-') + '</td>' +
        '<td style="border:1px solid #C8B6A6; padding:6px 8px; text-align:center;">' + escapeHtml(item.kontak || '-') + '</td>' +
        '<td style="border:1px solid #C8B6A6; padding:6px 8px; text-align:center; font-weight:bold; color:' + statusColor + ';">' + statusLabel + '</td>' +
        '<td style="border:1px solid #C8B6A6; padding:6px 8px; text-align:center; font-weight:bold;">' + paxVal + '</td>' +
        '<td style="border:1px solid #C8B6A6; padding:6px 10px;">' + escapeHtml(item.pesan || '-') + '</td>' +
        '<td style="border:1px solid #C8B6A6; padding:6px 8px; text-align:center;">' + escapeHtml(item.timestamp || '-') + '</td>' +
      '</tr>';
  }

  if (list.length === 0) {
    rowsHtml =
      '<tr><td colspan="7" style="border:1px solid #C8B6A6; padding:12px; text-align:center; color:#777;">Tidak ada data konfirmasi RSVP yang sesuai filter.</td></tr>';
  } else {
    rowsHtml +=
      '<tr style="background-color:#FAF5ED; font-weight:bold;">' +
        '<td colspan="4" style="border:1px solid #C8B6A6; padding:7px 10px; text-align:right; color:#4A0E17;">TOTAL ESTIMASI PORSI KATERING (PAX):</td>' +
        '<td style="border:1px solid #C8B6A6; padding:7px; text-align:center; color:#4A0E17;">' + totalPax + ' Pax</td>' +
        '<td colspan="2" style="border:1px solid #C8B6A6; padding:7px 10px; color:#6B5558;">Dari ' + hadirCount + ' konfirmasi hadir</td>' +
      '</tr>';
  }

  return (
    '<div style="font-family: Arial, Helvetica, sans-serif; color: #2B1619;">' +
      '<table style="width:100%; border-collapse:collapse; margin-bottom:10px;">' +
        '<tr>' +
          '<td colspan="7" style="background-color:#4A0E17; color:#E5C378; padding:12px 14px; text-align:center; border:1px solid #4A0E17;">' +
            '<div style="font-size:15px; font-weight:bold; letter-spacing:0.8px;">LAPORAN KONFIRMASI KEHADIRAN (RSVP) &amp; KATERING</div>' +
            '<div style="font-size:12px; color:#FFFFFF; margin-top:3px;">Pernikahan ' + fullNames + ' (' + coupleTitle + ')</div>' +
          '</td>' +
        '</tr>' +
        '<tr>' +
          '<td colspan="7" style="background-color:#FAF5ED; padding:7px 10px; font-size:10.5px; border:1px solid #C8B6A6;">' +
            '<strong>Acara:</strong> ' + tglResepsi + ' &nbsp;|&nbsp; ' +
            '<strong>Lokasi:</strong> ' + lokasi + ' &nbsp;|&nbsp; ' +
            '<strong>Filter:</strong> ' + escapeHtml(filterDesc) + ' &nbsp;|&nbsp; ' +
            '<strong>Diunduh:</strong> ' + escapeHtml(waktuCetak) + ' WIB' +
          '</td>' +
        '</tr>' +
        '<tr>' +
          '<td colspan="2" style="border:1px solid #C8B6A6; padding:7px; text-align:center; background:#FFF;"><strong>Total Konfirmasi:</strong> ' + total + ' Tamu</td>' +
          '<td colspan="2" style="border:1px solid #C8B6A6; padding:7px; text-align:center; background:#ECFDF5; color:#065F46;"><strong>Hadir:</strong> ' + hadirCount + ' Tamu</td>' +
          '<td colspan="1" style="border:1px solid #C8B6A6; padding:7px; text-align:center; background:#FFFBEB; color:#92400E;"><strong>Berhalangan:</strong> ' + tidakHadirCount + '</td>' +
          '<td colspan="2" style="border:1px solid #C8B6A6; padding:7px; text-align:center; background:#FFFBEB; color:#4A0E17;"><strong>Estimasi Katering:</strong> ' + totalPax + ' Pax</td>' +
        '</tr>' +
      '</table>' +
      '<table style="width:100%; border-collapse:collapse; font-size:11px;">' +
        '<thead>' +
          '<tr style="background-color:#4A0E17; color:#FFFFFF;">' +
            '<th style="border:1px solid #4A0E17; padding:8px 6px; width:34px;">No</th>' +
            '<th style="border:1px solid #4A0E17; padding:8px 8px; text-align:left; width:170px;">Nama Lengkap Tamu</th>' +
            '<th style="border:1px solid #4A0E17; padding:8px 8px; width:110px;">Kontak WA</th>' +
            '<th style="border:1px solid #4A0E17; padding:8px 8px; width:95px;">Status RSVP</th>' +
            '<th style="border:1px solid #4A0E17; padding:8px 8px; width:75px;">Jumlah Pax</th>' +
            '<th style="border:1px solid #4A0E17; padding:8px 10px; text-align:left; width:320px;">Pesan Doa &amp; Ucapan</th>' +
            '<th style="border:1px solid #4A0E17; padding:8px 8px; width:105px;">Waktu</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' + rowsHtml + buildAurumReportFooterHtml(7) + '</tbody>' +
      '</table>' +
    '</div>'
  );
}

function exportRSVPExcel() {
  var list = getFilteredRSVPData();
  if (!list || list.length === 0) {
    showToast('Data RSVP kosong pada filter ini, belum dapat diunduh.');
    return;
  }

  var tableBodyHtml = buildRSVPReportHtml();
  var excelDoc =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
    'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
    'xmlns="http://www.w3.org/TR/REC-html40">' +
    '<head><meta charset="UTF-8">' +
    '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
    '<x:Name>Laporan RSVP dan Katering</x:Name>' +
    '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>' +
    '</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' +
    '</head><body>' + tableBodyHtml + '</body></html>';

  var slug = getSafeSlug(currentClientConfig.panggilan_title || 'Pernikahan');
  var blob = new Blob(['\uFEFF' + excelDoc], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  var link = document.createElement('a');
  var url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'Laporan_RSVP_Katering_' + slug + '.xls');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Laporan Excel RSVP (.XLS) berhasil diunduh!');
}

function addPdfAurumFooter(doc) {
  var pageCount = doc.internal.getNumberOfPages();
  var pageWidth = doc.internal.pageSize.getWidth();
  var pageHeight = doc.internal.pageSize.getHeight();

  for (var p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setDrawColor(213, 200, 189);
    doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

    doc.setFontSize(8);
    doc.setTextColor(107, 85, 88);
    doc.text(
      'Crafted by Aurum Project  |  IG: @_aurumproject__  |  lynk.id/aurum__  |  WA: 0822-3799-8997',
      14,
      pageHeight - 9.5
    );
    doc.text('Hal. ' + p + ' / ' + pageCount, pageWidth - 14, pageHeight - 9.5, { align: 'right' });
  }
}

function downloadRSVPPdf() {
  var list = getFilteredRSVPData();
  if (!list || list.length === 0) {
    showToast('Data RSVP kosong pada filter ini, belum dapat diunduh.');
    return;
  }

  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast('Generator PDF sedang dimuat, silakan coba beberapa detik lagi.');
    return;
  }

  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  var pageWidth = doc.internal.pageSize.getWidth();

  var hadirCount = 0;
  var tidakHadirCount = 0;
  var totalPax = 0;
  list.forEach(function(item) {
    if (item.kehadiran === 'Hadir') {
      hadirCount++;
      totalPax += (parseInt(item.pax, 10) || 1);
    } else {
      tidakHadirCount++;
    }
  });

  var coupleTitle = currentClientConfig.panggilan_title || 'Mempelai';
  var fullNames = (currentClientConfig.nama_lengkap_pria || '') + ' & ' + (currentClientConfig.nama_lengkap_wanita || '');
  var tglResepsi = currentClientConfig.tanggal_resepsi || currentClientConfig.tanggal_akad || '';
  var lokasi = currentClientConfig.lokasi_acara || '';
  var filterDesc = (currentRSVPFilter === 'all') ? 'Semua Status' : currentRSVPFilter;
  var waktuCetak = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

  doc.setFillColor(74, 14, 23);
  doc.rect(14, 12, pageWidth - 28, 18, 'F');
  doc.setTextColor(229, 195, 120);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('LAPORAN KONFIRMASI KEHADIRAN (RSVP) & KATERING', pageWidth / 2, 19.5, { align: 'center' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9.5);
  doc.setFont(undefined, 'normal');
  doc.text('Pernikahan ' + fullNames + ' (' + coupleTitle + ')', pageWidth / 2, 25.5, { align: 'center' });

  doc.setFillColor(250, 245, 237);
  doc.rect(14, 30, pageWidth - 28, 13, 'F');
  doc.setDrawColor(200, 182, 166);
  doc.rect(14, 30, pageWidth - 28, 13, 'S');

  doc.setTextColor(43, 22, 25);
  doc.setFontSize(8.5);
  doc.text('Acara: ' + tglResepsi + '   |   Lokasi: ' + lokasi, 17, 35.2);
  doc.setFont(undefined, 'bold');
  doc.text(
    'Total Konfirmasi: ' + list.length + ' Tamu   |   Hadir: ' + hadirCount + ' Tamu   |   Berhalangan: ' + tidakHadirCount + '   |   Estimasi Katering: ' + totalPax + ' Pax   |   Filter: ' + filterDesc + ' (' + waktuCetak + ')',
    17,
    40.5
  );

  var tableRows = list.map(function(item, idx) {
    var isHadir = (item.kehadiran === 'Hadir');
    return [
      idx + 1,
      item.nama || '-',
      item.kontak || '-',
      isHadir ? 'Hadir' : 'Berhalangan',
      isHadir ? ((parseInt(item.pax, 10) || 1) + ' Pax') : '0',
      item.pesan || '-',
      item.timestamp || '-'
    ];
  });

  doc.autoTable({
    startY: 46,
    margin: { left: 14, right: 14, bottom: 20 },
    head: [['No', 'Nama Lengkap Tamu', 'Kontak WA', 'Status RSVP', 'Pax', 'Pesan Doa & Ucapan', 'Waktu']],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2.6,
      textColor: [43, 22, 25],
      lineColor: [200, 182, 166],
      lineWidth: 0.2,
      valign: 'middle'
    },
    headStyles: {
      fillColor: [74, 14, 23],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 46, fontStyle: 'bold' },
      2: { cellWidth: 28, halign: 'center' },
      3: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 'auto' },
      6: { cellWidth: 26, halign: 'center' }
    },
    didParseCell: function(data) {
      if (data.section === 'body') {
        var statusVal = data.row.raw[3];
        if (statusVal === 'Hadir') {
          data.cell.styles.fillColor = [236, 253, 245];
          if (data.column.index === 3) data.cell.styles.textColor = [6, 95, 70];
        } else {
          data.cell.styles.fillColor = [255, 251, 235];
          if (data.column.index === 3) data.cell.styles.textColor = [146, 64, 14];
        }
      }
    }
  });

  addPdfAurumFooter(doc);

  var slug = getSafeSlug(coupleTitle);
  doc.save('Laporan_RSVP_Katering_' + slug + '.pdf');
  showToast('File PDF Laporan RSVP berhasil diunduh!');
}

function getFilteredGuestData() {
  var searchInp = document.getElementById('searchGuestInput');
  var q = searchInp ? searchInp.value.toLowerCase().trim() : '';
  var dupMap = buildDuplicateWaMap(guestQueueList);

  return (guestQueueList || []).filter(function(g) {
    var isSudahHadir = (String(g.kehadiranHariH || '').trim() === 'Sudah Hadir');
    var statusHariH = isSudahHadir ? 'Sudah Hadir' : 'Belum Hadir';
    var matchStatus = (currentGuestFilter === 'all') || (statusHariH === currentGuestFilter);

    var guestCat = String(g.kategori || 'Teman').trim().toLowerCase();
    var filterCat = String(currentGuestCategoryFilter || 'all').trim().toLowerCase();
    var matchCategory = (filterCat === 'all') || (guestCat === filterCat) || (guestCat.indexOf(filterCat) !== -1);

    var normWa = normalizeWaNumber(g.wa);
    var matchDuplicate = !filterDuplicateWaOnly || (normWa && dupMap[normWa] > 1);

    var matchText = !q ||
      (g.nama && g.nama.toLowerCase().indexOf(q) !== -1) ||
      (g.kategori && g.kategori.toLowerCase().indexOf(q) !== -1) ||
      (g.wa && g.wa.toLowerCase().indexOf(q) !== -1);

    return matchStatus && matchCategory && matchDuplicate && matchText;
  });
}

function buildAttendanceReportHtml() {
  var list = getFilteredGuestData();
  var allList = guestQueueList || [];
  var totalAll = allList.length;
  var hadirAll = 0;
  allList.forEach(function(g) {
    if (String(g.kehadiranHariH || '').trim() === 'Sudah Hadir') hadirAll++;
  });
  var belumAll = Math.max(0, totalAll - hadirAll);
  var persen = totalAll > 0 ? Math.round((hadirAll / totalAll) * 100) : 0;

  var filterLabels = [];
  if (currentGuestFilter !== 'all') filterLabels.push(currentGuestFilter);
  if (currentGuestCategoryFilter !== 'all') filterLabels.push('Kategori: ' + currentGuestCategoryFilter);
  if (filterDuplicateWaOnly) filterLabels.push('Nomor WA Ganda');
  var activeFilterDesc = filterLabels.length > 0 ? filterLabels.join(' • ') : 'Semua Tamu';

  var coupleTitle = escapeHtml(currentClientConfig.panggilan_title || 'Mempelai');
  var fullNames = escapeHtml((currentClientConfig.nama_lengkap_pria || '') + ' & ' + (currentClientConfig.nama_lengkap_wanita || ''));
  var tglResepsi = escapeHtml(currentClientConfig.tanggal_resepsi || currentClientConfig.tanggal_akad || '');
  var lokasi = escapeHtml(currentClientConfig.lokasi_acara || '');
  var waktuCetak = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

  var rowsHtml = '';
  for (var i = 0; i < list.length; i++) {
    var g = list[i];
    var isHadir = (String(g.kehadiranHariH || '').trim() === 'Sudah Hadir');
    var rowBg = isHadir ? '#ECFDF5' : '#FFFFFF';
    var statusColor = isHadir ? '#065F46' : '#6B7280';
    var statusLabel = isHadir ? 'SUDAH HADIR' : 'Belum Hadir';
    var jamMasuk = isHadir ? escapeHtml(formatCleanTimeOnly(g.waktuCheckin)) : '-';

    rowsHtml +=
      '<tr style="background-color:' + rowBg + '; vertical-align:middle;">' +
        '<td style="border:1px solid #C8B6A6; padding:6px; text-align:center;">' + (i + 1) + '</td>' +
        '<td style="border:1px solid #C8B6A6; padding:6px 8px; text-align:center; font-family:monospace;">' + escapeHtml(g.id || '-') + '</td>' +
        '<td style="border:1px solid #C8B6A6; padding:6px 10px; font-weight:bold; color:#2B1619;">' + escapeHtml(g.nama || '-') + '</td>' +
        '<td style="border:1px solid #C8B6A6; padding:6px 8px; text-align:center;">' + escapeHtml(g.kategori || 'Tamu') + '</td>' +
        '<td style="border:1px solid #C8B6A6; padding:6px 8px; text-align:center;">' + escapeHtml(g.wa || '-') + '</td>' +
        '<td style="border:1px solid #C8B6A6; padding:6px 8px; text-align:center;">' + escapeHtml(g.status || 'Belum Dikirim') + '</td>' +
        '<td style="border:1px solid #C8B6A6; padding:6px 8px; text-align:center; font-weight:bold; color:' + statusColor + ';">' + statusLabel + '</td>' +
        '<td style="border:1px solid #C8B6A6; padding:6px 8px; text-align:center; font-weight:bold;">' + jamMasuk + '</td>' +
      '</tr>';
  }

  if (list.length === 0) {
    rowsHtml =
      '<tr><td colspan="8" style="border:1px solid #C8B6A6; padding:12px; text-align:center; color:#777;">Tidak ada data daftar hadir yang sesuai filter.</td></tr>';
  }

  return (
    '<div style="font-family: Arial, Helvetica, sans-serif; color: #2B1619;">' +
      '<table style="width:100%; border-collapse:collapse; margin-bottom:10px;">' +
        '<tr>' +
          '<td colspan="8" style="background-color:#4A0E17; color:#E5C378; padding:12px 14px; text-align:center; border:1px solid #4A0E17;">' +
            '<div style="font-size:15px; font-weight:bold; letter-spacing:0.8px;">LAPORAN KEHADIRAN TAMU UNDANGAN (HARI-H)</div>' +
            '<div style="font-size:12px; color:#FFFFFF; margin-top:3px;">Pernikahan ' + fullNames + ' (' + coupleTitle + ')</div>' +
          '</td>' +
        '</tr>' +
        '<tr>' +
          '<td colspan="8" style="background-color:#FAF5ED; padding:7px 10px; font-size:10.5px; border:1px solid #C8B6A6;">' +
            '<strong>Acara:</strong> ' + tglResepsi + ' &nbsp;|&nbsp; ' +
            '<strong>Lokasi:</strong> ' + lokasi + ' &nbsp;|&nbsp; ' +
            '<strong>Filter:</strong> ' + escapeHtml(activeFilterDesc) + ' (' + list.length + ' data) &nbsp;|&nbsp; ' +
            '<strong>Diunduh:</strong> ' + escapeHtml(waktuCetak) + ' WIB' +
          '</td>' +
        '</tr>' +
        '<tr>' +
          '<td colspan="2" style="border:1px solid #C8B6A6; padding:7px; text-align:center; background:#FFF;"><strong>Total Undangan:</strong> ' + totalAll + ' Tamu</td>' +
          '<td colspan="2" style="border:1px solid #C8B6A6; padding:7px; text-align:center; background:#ECFDF5; color:#065F46;"><strong>Sudah Hadir:</strong> ' + hadirAll + ' Tamu</td>' +
          '<td colspan="2" style="border:1px solid #C8B6A6; padding:7px; text-align:center; background:#FFF;"><strong>Belum Hadir:</strong> ' + belumAll + ' Tamu</td>' +
          '<td colspan="2" style="border:1px solid #C8B6A6; padding:7px; text-align:center; background:#FFFBEB; color:#92400E;"><strong>Persentase Hadir:</strong> ' + persen + '%</td>' +
        '</tr>' +
      '</table>' +
      '<table style="width:100%; border-collapse:collapse; font-size:11px;">' +
        '<thead>' +
          '<tr style="background-color:#4A0E17; color:#FFFFFF;">' +
            '<th style="border:1px solid #4A0E17; padding:8px 6px; width:34px;">No</th>' +
            '<th style="border:1px solid #4A0E17; padding:8px 8px; width:90px;">ID Tamu</th>' +
            '<th style="border:1px solid #4A0E17; padding:8px 10px; text-align:left; width:220px;">Nama Lengkap Tamu</th>' +
            '<th style="border:1px solid #4A0E17; padding:8px 8px; width:95px;">Kategori</th>' +
            '<th style="border:1px solid #4A0E17; padding:8px 8px; width:110px;">Nomor WhatsApp</th>' +
            '<th style="border:1px solid #4A0E17; padding:8px 8px; width:95px;">Status WA</th>' +
            '<th style="border:1px solid #4A0E17; padding:8px 8px; width:110px;">Kehadiran Hari-H</th>' +
            '<th style="border:1px solid #4A0E17; padding:8px 8px; width:90px;">Jam Masuk</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' + rowsHtml + buildAurumReportFooterHtml(8) + '</tbody>' +
      '</table>' +
    '</div>'
  );
}

function exportAttendanceExcel() {
  var list = getFilteredGuestData();
  if (!list || list.length === 0) {
    showToast('Daftar tamu kosong pada filter ini, belum dapat diunduh.');
    return;
  }

  var tableBodyHtml = buildAttendanceReportHtml();
  var excelDoc =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
    'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
    'xmlns="http://www.w3.org/TR/REC-html40">' +
    '<head><meta charset="UTF-8">' +
    '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
    '<x:Name>Laporan Kehadiran Tamu</x:Name>' +
    '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>' +
    '</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' +
    '</head><body>' + tableBodyHtml + '</body></html>';

  var slug = getSafeSlug(currentClientConfig.panggilan_title || 'Pernikahan');
  var blob = new Blob(['\uFEFF' + excelDoc], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  var link = document.createElement('a');
  var url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'Laporan_Daftar_Hadir_' + slug + '.xls');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Laporan Excel Daftar Hadir (.XLS) berhasil diunduh!');
}

function downloadAttendancePdf() {
  var list = getFilteredGuestData();
  if (!list || list.length === 0) {
    showToast('Daftar tamu kosong pada filter ini, belum dapat diunduh.');
    return;
  }

  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast('Generator PDF sedang dimuat, silakan coba beberapa detik lagi.');
    return;
  }

  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  var pageWidth = doc.internal.pageSize.getWidth();

  var allList = guestQueueList || [];
  var totalAll = allList.length;
  var hadirAll = 0;
  allList.forEach(function(g) {
    if (String(g.kehadiranHariH || '').trim() === 'Sudah Hadir') hadirAll++;
  });
  var belumAll = Math.max(0, totalAll - hadirAll);
  var persen = totalAll > 0 ? Math.round((hadirAll / totalAll) * 100) : 0;

  var filterLabels = [];
  if (currentGuestFilter !== 'all') filterLabels.push(currentGuestFilter);
  if (currentGuestCategoryFilter !== 'all') filterLabels.push('Kategori: ' + currentGuestCategoryFilter);
  if (filterDuplicateWaOnly) filterLabels.push('Nomor WA Ganda');
  var activeFilterDesc = filterLabels.length > 0 ? filterLabels.join(' • ') : 'Semua Tamu';

  var coupleTitle = currentClientConfig.panggilan_title || 'Mempelai';
  var fullNames = (currentClientConfig.nama_lengkap_pria || '') + ' & ' + (currentClientConfig.nama_lengkap_wanita || '');
  var tglResepsi = currentClientConfig.tanggal_resepsi || currentClientConfig.tanggal_akad || '';
  var lokasi = currentClientConfig.lokasi_acara || '';
  var waktuCetak = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

  doc.setFillColor(74, 14, 23);
  doc.rect(14, 12, pageWidth - 28, 18, 'F');
  doc.setTextColor(229, 195, 120);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('LAPORAN KEHADIRAN TAMU UNDANGAN (HARI-H)', pageWidth / 2, 19.5, { align: 'center' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9.5);
  doc.setFont(undefined, 'normal');
  doc.text('Pernikahan ' + fullNames + ' (' + coupleTitle + ')', pageWidth / 2, 25.5, { align: 'center' });

  doc.setFillColor(250, 245, 237);
  doc.rect(14, 30, pageWidth - 28, 13, 'F');
  doc.setDrawColor(200, 182, 166);
  doc.rect(14, 30, pageWidth - 28, 13, 'S');

  doc.setTextColor(43, 22, 25);
  doc.setFontSize(8.5);
  doc.text('Acara: ' + tglResepsi + '   |   Lokasi: ' + lokasi, 17, 35.2);
  doc.setFont(undefined, 'bold');
  doc.text(
    'Total Undangan: ' + totalAll + '   |   Sudah Hadir: ' + hadirAll + '   |   Belum Hadir: ' + belumAll + ' (' + persen + '%)   |   Filter: ' + activeFilterDesc + ' (' + waktuCetak + ')',
    17,
    40.5
  );

  var tableRows = list.map(function(g, idx) {
    var isHadir = (String(g.kehadiranHariH || '').trim() === 'Sudah Hadir');
    return [
      idx + 1,
      g.id || '-',
      g.nama || '-',
      g.kategori || 'Tamu',
      g.wa || '-',
      g.status || 'Belum Dikirim',
      isHadir ? 'Sudah Hadir' : 'Belum Hadir',
      isHadir ? formatCleanTimeOnly(g.waktuCheckin) : '-'
    ];
  });

  doc.autoTable({
    startY: 46,
    margin: { left: 14, right: 14, bottom: 20 },
    head: [['No', 'ID Tamu', 'Nama Lengkap Tamu', 'Kategori', 'No. WhatsApp', 'Status WA', 'Kehadiran', 'Jam Masuk']],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2.6,
      textColor: [43, 22, 25],
      lineColor: [200, 182, 166],
      lineWidth: 0.2,
      valign: 'middle'
    },
    headStyles: {
      fillColor: [74, 14, 23],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 26, halign: 'center' },
      2: { cellWidth: 'auto', fontStyle: 'bold' },
      3: { cellWidth: 26, halign: 'center' },
      4: { cellWidth: 32, halign: 'center' },
      5: { cellWidth: 28, halign: 'center' },
      6: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 24, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      if (data.section === 'body') {
        var statusVal = data.row.raw[6];
        if (statusVal === 'Sudah Hadir') {
          data.cell.styles.fillColor = [236, 253, 245];
          if (data.column.index === 6) data.cell.styles.textColor = [6, 95, 70];
        } else {
          data.cell.styles.fillColor = [255, 255, 255];
          if (data.column.index === 6) data.cell.styles.textColor = [107, 114, 128];
        }
      }
    }
  });

  addPdfAurumFooter(doc);

  var slug = getSafeSlug(coupleTitle);
  doc.save('Laporan_Daftar_Hadir_' + slug + '.pdf');
  showToast('File PDF Daftar Hadir berhasil diunduh!');
}

// ==========================================================================
// 12. WEDDING STUDIO APPLICATION SUITE & OTENTIKASI SERVER-SIDE MURNI
// ==========================================================================
function openStudioPasscodeBar() {
  var bar = document.getElementById('studioPasscodeBar');
  if (!bar) return;
  bar.style.display = 'block';
  var pinField = document.getElementById('inputAdminPin');
  if (pinField) {
    pinField.value = '';
    setTimeout(function() {
      pinField.focus();
    }, 150);
  }
}

function closeStudioPasscodeBar() {
  var bar = document.getElementById('studioPasscodeBar');
  if (bar) bar.style.display = 'none';
}

function verifyAdminPIN() {
  var pinField = document.getElementById('inputAdminPin');
  var btnLogin = document.getElementById('btnSubmitAdminPin');
  var pinInput = pinField ? pinField.value.trim() : '';

  if (!pinInput) {
    showToast('Masukkan PIN Studio Admin.');
    return;
  }

  if (pinField) pinField.blur();

  function onLoginSuccess(validPin) {
    currentAdminPin = validPin;
    closeStudioPasscodeBar();

    var overlay = document.getElementById('coverOverlay');
    if (overlay) overlay.classList.add('opened');

    var studioBar = document.getElementById('weddingStudioBar');
    if (studioBar) studioBar.style.display = 'flex';
    var bottomNav = document.getElementById('appBottomNav');
    if (bottomNav) bottomNav.style.display = 'flex';

    document.body.classList.add('admin-mode-active');
    document.body.classList.add('admin-edit-mode');

    enableLiveInlineEditing();
    switchAppScreen('screenRSVP', document.getElementById('navItemRSVP'));

    var studioName = currentClientConfig.panggilan_title || 'Admin';
    showToast('Login berhasil! Selamat Datang di Studio ' + studioName + '.');
    loadAdminData();
  }

  if (!isGasApiConfigured()) {
    showToast('Harap isi GAS_WEB_APP_URL di file app.js terlebih dahulu.');
    return;
  }

  if (btnLogin) {
    btnLogin.disabled = true;
    btnLogin.textContent = '...';
  }

  callGasApiPost('verifyPin', { pin: pinInput })
    .then(function(res) {
      if (btnLogin) {
        btnLogin.disabled = false;
        btnLogin.textContent = 'Masuk';
      }
      if (res && res.status === 'success') {
        onLoginSuccess(pinInput);
      } else {
        showToast((res && res.message) ? res.message : 'PIN Admin salah. Silakan coba lagi.');
      }
    })
    .catch(function(err) {
      if (btnLogin) {
        btnLogin.disabled = false;
        btnLogin.textContent = 'Masuk';
      }
      showToast('Gagal memverifikasi PIN: ' + err.message);
    });
}

function switchAppScreen(screenId, btnEl) {
  var screens = document.querySelectorAll('.app-screen');
  screens.forEach(function(s) { s.classList.remove('active'); });

  var navItems = document.querySelectorAll('.bottom-nav-item');
  navItems.forEach(function(item) { item.classList.remove('active'); });

  var targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (btnEl) {
    btnEl.classList.add('active');
  } else {
    var matchNav = document.querySelector('[onclick*="' + screenId + '"]');
    if (matchNav) matchNav.classList.add('active');
  }

  var modeLabel = document.getElementById('studioModeLabel');
  if (screenId !== 'screenInvitation') {
    if (modeLabel) modeLabel.textContent = 'Dashboard Studio';
  } else {
    if (modeLabel) {
      modeLabel.textContent = document.body.classList.contains('admin-edit-mode') ? 'Editor Aktif' : 'Pratinjau Tamu';
    }
  }
}

function toggleCanvasPreviewMode() {
  switchAppScreen('screenInvitation', document.getElementById('navItemInvitation'));

  var isEditMode = document.body.classList.contains('admin-edit-mode');
  var iconEl = document.getElementById('previewModeIcon');
  var textEl = document.getElementById('previewModeText');
  var modeLabel = document.getElementById('studioModeLabel');

  var svgPencil = '<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';
  var svgEye = '<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';

  if (isEditMode) {
    document.body.classList.remove('admin-edit-mode');
    if (iconEl) iconEl.innerHTML = svgPencil;
    if (textEl) textEl.textContent = 'Mode Edit';
    if (modeLabel) modeLabel.textContent = 'Pratinjau Tamu';
    showToast('Mode Pratinjau Tamu aktif.');
  } else {
    document.body.classList.add('admin-edit-mode');
    if (iconEl) iconEl.innerHTML = svgEye;
    if (textEl) textEl.textContent = 'Pratinjau';
    if (modeLabel) modeLabel.textContent = 'Editor Aktif';
    showToast('Mode Editor aktif. Klik teks atau tombol Sesuaikan untuk mengubah.');
  }
}

function exitStudioMode() {
  var studioBar = document.getElementById('weddingStudioBar');
  if (studioBar) studioBar.style.display = 'none';
  var bottomNav = document.getElementById('appBottomNav');
  if (bottomNav) bottomNav.style.display = 'none';

  document.body.classList.remove('admin-mode-active');
  document.body.classList.remove('admin-edit-mode');

  switchAppScreen('screenInvitation', document.getElementById('navItemInvitation'));
  showToast('Telah keluar dari Studio Admin.');
}

function onPhotoCanvasClicked(targetId, el) {
  if (document.body.classList.contains('admin-edit-mode')) {
    openPhotoAdjustModal(targetId);
  } else {
    openLightbox(el || document.getElementById(targetId));
  }
}

function onGalleryItemClicked(targetId, el) {
  if (document.body.classList.contains('admin-edit-mode')) {
    openPhotoAdjustModal(targetId);
  } else {
    openLightbox(el || document.getElementById(targetId));
  }
}

function openLightbox(el) {
  if (!el) return;
  var img = (el.tagName === 'IMG') ? el : el.querySelector('img');
  var modal = document.getElementById('lightboxModal');
  var lightboxImg = document.getElementById('lightboxImg');
  if (img && modal && lightboxImg) {
    lightboxImg.src = img.src;
    modal.classList.add('show');
  }
}

function initSavedPhotoTransformsFromDOM() {
  var allPhotoKeys = [
    'dynPhotoPria', 'dynPhotoWanita', 'dynHeroPhoto',
    'dynStoryFoto1', 'dynStoryFoto2', 'dynStoryFoto3',
    'dynGaleri1', 'dynGaleri2', 'dynGaleri3', 'dynGaleri4', 'dynGaleri5', 'dynGaleri6'
  ];

  allPhotoKeys.forEach(function(targetId) {
    var imgEl = document.getElementById(targetId);
    if (!imgEl) return;
    var styleAttr = imgEl.getAttribute('style') || '';
    var posMatch = styleAttr.match(/object-position:\s*([0-9.]+)%\s+([0-9.]+)%/i);
    var scaleMatch = styleAttr.match(/scale\(([0-9.]+)\)/i);

    var x = posMatch ? parseFloat(posMatch[1]) : 50;
    var y = posMatch ? parseFloat(posMatch[2]) : 50;
    var z = scaleMatch ? Math.round(parseFloat(scaleMatch[1]) * 100) : 100;

    photoTransforms[targetId] = { zoom: z, x: x, y: y };
  });
}

function autoSyncCoupleTitle() {
  var pPria = document.getElementById('cfgPanggilanPria');
  var pWanita = document.getElementById('cfgPanggilanWanita');
  var pTitle = document.getElementById('cfgPanggilanTitle');
  var pInisial = document.getElementById('cfgInisialMempelai');

  var pria = pPria ? pPria.value.trim() : '';
  var wanita = pWanita ? pWanita.value.trim() : '';

  if (pria && wanita) {
    if (pTitle) pTitle.value = pria + ' & ' + wanita;
    if (pInisial) pInisial.value = pria.charAt(0).toUpperCase() + '&' + wanita.charAt(0).toUpperCase();
  }
}

function applyFeatureTogglesToUI() {
  var selQris = document.getElementById('cfgQrisEnabled');
  var qrisActive = selQris ? (selQris.value !== 'false') : (String(currentClientConfig.qris_enabled).toLowerCase() !== 'false');

  var btnQris = document.getElementById('btnQrisTrigger');
  var extraWrap = document.getElementById('registryExtraButtons');
  var inpQrisUrl = document.getElementById('cfgQrisUrl');

  if (btnQris) {
    btnQris.style.display = qrisActive ? 'flex' : 'none';
  }
  if (extraWrap) {
    if (qrisActive) {
      extraWrap.classList.remove('single-btn-mode');
    } else {
      extraWrap.classList.add('single-btn-mode');
    }
  }
  if (inpQrisUrl) {
    inpQrisUrl.disabled = !qrisActive;
    inpQrisUrl.style.opacity = qrisActive ? '1' : '0.55';
  }

  var selStory = document.getElementById('cfgStoryPhotoEnabled');
  var storyPhotoActive = selStory ? (selStory.value !== 'false') : (String(currentClientConfig.story_photo_enabled).toLowerCase() !== 'false');

  var galleryWrap = document.getElementById('polaroidGalleryWrap');
  if (galleryWrap) {
    if (storyPhotoActive) {
      galleryWrap.classList.remove('no-story-photo');
    } else {
      galleryWrap.classList.add('no-story-photo');
    }
  }
}

function resetWaTemplateDefault() {
  var elWa = document.getElementById('cfgWaTemplate');
  if (elWa) {
    elWa.value = DEFAULT_WA_TEMPLATE;
    showToast('Template pesan WhatsApp profesional dikembalikan ke standar.');
  }
}

function loadInitialAppData() {
  if (!isGasApiConfigured()) return;
  callGasApiGet('init')
    .then(function(res) {
      if (res && res.status === 'success') {
        if (res.config) {
          populateConfigForms(res.config);
        }
        if (res.rsvp) {
          rawRSVPData = res.rsvp;
          updateCateringAnalytics(res.rsvp);
          renderDetailedRSVPTable(res.rsvp);
          filterPublicRSVPFeed();
        }
      }
    })
    .catch(function(err) {
      console.warn('Gagal memuat data awal dari Google Sheets:', err);
    });
}

function loadPublicConfig() {
  if (!isGasApiConfigured()) return;
  callGasApiGet('getConfig')
    .then(function(res) {
      if (res && res.status === 'success' && res.data) {
        populateConfigForms(res.data);
      }
    })
    .catch(function(err) {
      console.warn('Error getConfig:', err);
    });
}

function loadAdminData() {
  if (!isGasApiConfigured()) return;
  loadPublicConfig();
  loadGuestList();
  loadRSVPFeedAndAnalytics();
}

function populateConfigForms(cfg) {
  for (var key in cfg) {
    if (cfg.hasOwnProperty(key) && cfg[key] !== '') {
      currentClientConfig[key] = cfg[key];
    }
  }

  var elPubUrl = document.getElementById('cfgPublicAppUrl');
  if (elPubUrl) {
    elPubUrl.value = cfg.public_web_app_url || window.location.href.split('?')[0].split('#')[0];
  }

  if (cfg.twibbon_templates_json !== undefined && cfg.twibbon_templates_json !== '') {
    try {
      var parsedTpls = JSON.parse(cfg.twibbon_templates_json);
      if (Array.isArray(parsedTpls)) {
        customTwibbonTemplates = parsedTpls.map(function(t) {
          t.builtIn = false;
          return t;
        });
      }
    } catch (e) {
      console.warn('Gagal parsing twibbon_templates_json:', e);
    }
  }
  renderAdminTwibbonList();
  renderGuestTwibbonSelector();

  if (cfg.twibbon_subtext) {
    var inTwSub = document.getElementById('cfgTwibbonSubtext');
    if (inTwSub) inTwSub.value = cfg.twibbon_subtext;
  }

  var activeEyebrow = cfg.cover_eyebrow || currentClientConfig.cover_eyebrow;
  if (document.getElementById('dynCoverEyebrow')) document.getElementById('dynCoverEyebrow').textContent = activeEyebrow;
  if (document.getElementById('dynHeroEyebrow')) document.getElementById('dynHeroEyebrow').textContent = activeEyebrow;
  if (document.getElementById('cfgCoverEyebrow')) document.getElementById('cfgCoverEyebrow').value = activeEyebrow;

  var activeSalamJudul = cfg.salam_pembuka_judul || currentClientConfig.salam_pembuka_judul;
  if (document.getElementById('dynSalamJudul')) document.getElementById('dynSalamJudul').textContent = activeSalamJudul;
  if (document.getElementById('cfgSalamJudul')) document.getElementById('cfgSalamJudul').value = activeSalamJudul;

  var activeSalamTeks = cfg.salam_pembuka_teks || currentClientConfig.salam_pembuka_teks;
  if (document.getElementById('dynSalamTeks')) document.getElementById('dynSalamTeks').textContent = activeSalamTeks;
  if (document.getElementById('cfgSalamTeks')) document.getElementById('cfgSalamTeks').value = activeSalamTeks;

  var activeSesi1 = cfg.judul_sesi_1 || currentClientConfig.judul_sesi_1;
  if (document.getElementById('dynJudulSesi1')) document.getElementById('dynJudulSesi1').textContent = activeSesi1;
  if (document.getElementById('cfgJudulSesi1')) document.getElementById('cfgJudulSesi1').value = activeSesi1;

  var activeSesi2 = cfg.judul_sesi_2 || currentClientConfig.judul_sesi_2;
  if (document.getElementById('dynJudulSesi2')) document.getElementById('dynJudulSesi2').textContent = activeSesi2;
  if (document.getElementById('cfgJudulSesi2')) document.getElementById('cfgJudulSesi2').value = activeSesi2;

  var activePengantarKado = cfg.teks_pengantar_kado || currentClientConfig.teks_pengantar_kado;
  if (document.getElementById('dynPengantarKado')) document.getElementById('dynPengantarKado').textContent = activePengantarKado;
  if (document.getElementById('cfgPengantarKado')) document.getElementById('cfgPengantarKado').value = activePengantarKado;

  var activePenutupFooter = cfg.teks_penutup_footer || currentClientConfig.teks_penutup_footer;
  if (document.getElementById('dynPenutupFooter')) document.getElementById('dynPenutupFooter').textContent = activePenutupFooter;
  if (document.getElementById('cfgPenutupFooter')) document.getElementById('cfgPenutupFooter').value = activePenutupFooter;

  var activeTitle = cfg.panggilan_title || currentClientConfig.panggilan_title;
  var activeInitials = cfg.inisial_mempelai || currentClientConfig.inisial_mempelai;
  var activeShortLoc = cfg.lokasi_ringkas || currentClientConfig.lokasi_ringkas;

  document.title = 'The Wedding of ' + activeTitle;

  var elCovT = document.getElementById('dynCoverTitle');
  var elHerT = document.getElementById('dynHeroNames');
  var elFootT = document.getElementById('secretFooterTap');
  var elPassT = document.getElementById('passWeddingTitle');
  var elTwibT = document.getElementById('twibbonModalCoupleTitle');
  var inTitle = document.getElementById('cfgPanggilanTitle');

  if (elCovT) elCovT.textContent = activeTitle;
  if (elHerT) elHerT.textContent = activeTitle;
  if (elFootT) elFootT.textContent = activeTitle;
  if (elPassT) elPassT.textContent = activeTitle;
  if (elTwibT) elTwibT.textContent = activeTitle;
  if (inTitle) inTitle.value = activeTitle;

  var elHerInit = document.getElementById('dynHeroInitials');
  var elTopStudio = document.getElementById('topBrandStudioName');
  var inInit = document.getElementById('cfgInisialMempelai');
  if (elHerInit) elHerInit.textContent = activeInitials;
  if (elTopStudio) elTopStudio.textContent = activeInitials + ' Studio';
  if (inInit) inInit.value = activeInitials;

  var elHerLoc = document.getElementById('dynHeroLocation');
  var elFootLoc = document.getElementById('dynFooterLocation');
  var inLocRingkas = document.getElementById('cfgLokasiRingkas');
  if (elHerLoc) elHerLoc.textContent = activeShortLoc;
  if (elFootLoc) elFootLoc.textContent = activeShortLoc;
  if (inLocRingkas) inLocRingkas.value = activeShortLoc;

  if (cfg.nama_lengkap_pria) {
    if (document.getElementById('dynNamaPria')) document.getElementById('dynNamaPria').textContent = cfg.nama_lengkap_pria;
    if (document.getElementById('cfgNamaPria')) document.getElementById('cfgNamaPria').value = cfg.nama_lengkap_pria;
  }
  if (cfg.panggilan_pria && document.getElementById('cfgPanggilanPria')) {
    document.getElementById('cfgPanggilanPria').value = cfg.panggilan_pria;
  }
  if (cfg.ortu_pria) {
    if (document.getElementById('dynOrtuPria')) document.getElementById('dynOrtuPria').textContent = cfg.ortu_pria;
    if (document.getElementById('cfgOrtuPria')) document.getElementById('cfgOrtuPria').value = cfg.ortu_pria;
  }
  if (cfg.ig_pria) {
    if (document.getElementById('dynIgTextPria')) document.getElementById('dynIgTextPria').textContent = cfg.ig_pria;
    if (document.getElementById('dynIgPria')) document.getElementById('dynIgPria').href = 'https://instagram.com/' + cfg.ig_pria.replace('@', '');
    if (document.getElementById('cfgIgPria')) document.getElementById('cfgIgPria').value = cfg.ig_pria;
  }

  if (cfg.nama_lengkap_wanita) {
    if (document.getElementById('dynNamaWanita')) document.getElementById('dynNamaWanita').textContent = cfg.nama_lengkap_wanita;
    if (document.getElementById('cfgNamaWanita')) document.getElementById('cfgNamaWanita').value = cfg.nama_lengkap_wanita;
  }
  if (cfg.panggilan_wanita && document.getElementById('cfgPanggilanWanita')) {
    document.getElementById('cfgPanggilanWanita').value = cfg.panggilan_wanita;
  }
  if (cfg.ortu_wanita) {
    if (document.getElementById('dynOrtuWanita')) document.getElementById('dynOrtuWanita').textContent = cfg.ortu_wanita;
    if (document.getElementById('cfgOrtuWanita')) document.getElementById('cfgOrtuWanita').value = cfg.ortu_wanita;
  }
  if (cfg.ig_wanita) {
    if (document.getElementById('dynIgTextWanita')) document.getElementById('dynIgTextWanita').textContent = cfg.ig_wanita;
    if (document.getElementById('dynIgWanita')) document.getElementById('dynIgWanita').href = 'https://instagram.com/' + cfg.ig_wanita.replace('@', '');
    if (document.getElementById('cfgIgWanita')) document.getElementById('cfgIgWanita').value = cfg.ig_wanita;
  }

  var elPinnedNames = document.getElementById('pinnedCoupleNames');
  if (elPinnedNames) {
    elPinnedNames.textContent = (currentClientConfig.nama_lengkap_pria || '') + ' & ' + (currentClientConfig.nama_lengkap_wanita || '');
  }

  if (cfg.tanggal_cover) {
    if (document.getElementById('dynCoverDate')) document.getElementById('dynCoverDate').textContent = cfg.tanggal_cover;
    if (document.getElementById('cfgCoverDate')) document.getElementById('cfgCoverDate').value = cfg.tanggal_cover;
  }
  if (cfg.tanggal_hero) {
    if (document.getElementById('dynHeroDate')) document.getElementById('dynHeroDate').textContent = cfg.tanggal_hero;
    if (document.getElementById('cfgHeroDate')) document.getElementById('cfgHeroDate').value = cfg.tanggal_hero;
  }
  if (cfg.countdown_target) {
    if (document.getElementById('cfgCountdownTarget')) document.getElementById('cfgCountdownTarget').value = cfg.countdown_target.slice(0, 16);
    initCountdown(cfg.countdown_target);
  }
  if (cfg.akad_cal_end && document.getElementById('cfgAkadCalEnd')) {
    document.getElementById('cfgAkadCalEnd').value = cfg.akad_cal_end.slice(0, 16);
  }
  if (cfg.resepsi_cal_start && document.getElementById('cfgResepsiCalStart')) {
    document.getElementById('cfgResepsiCalStart').value = cfg.resepsi_cal_start.slice(0, 16);
  }
  if (cfg.resepsi_cal_end && document.getElementById('cfgResepsiCalEnd')) {
    document.getElementById('cfgResepsiCalEnd').value = cfg.resepsi_cal_end.slice(0, 16);
  }

  if (cfg.tanggal_akad) {
    if (document.getElementById('dynAkadTanggal')) document.getElementById('dynAkadTanggal').textContent = cfg.tanggal_akad;
    if (document.getElementById('cfgAkadTanggal')) document.getElementById('cfgAkadTanggal').value = cfg.tanggal_akad;
  }
  if (cfg.waktu_akad) {
    if (document.getElementById('dynAkadWaktu')) document.getElementById('dynAkadWaktu').textContent = cfg.waktu_akad;
    if (document.getElementById('cfgAkadWaktu')) document.getElementById('cfgAkadWaktu').value = cfg.waktu_akad;
  }
  if (cfg.tanggal_resepsi) {
    if (document.getElementById('dynResepsiTanggal')) document.getElementById('dynResepsiTanggal').textContent = cfg.tanggal_resepsi;
    if (document.getElementById('cfgResepsiTanggal')) document.getElementById('cfgResepsiTanggal').value = cfg.tanggal_resepsi;
  }
  if (cfg.waktu_resepsi) {
    if (document.getElementById('dynResepsiWaktu')) document.getElementById('dynResepsiWaktu').textContent = cfg.waktu_resepsi;
    if (document.getElementById('cfgResepsiWaktu')) document.getElementById('cfgResepsiWaktu').value = cfg.waktu_resepsi;
  }
  if (cfg.lokasi_acara) {
    if (document.getElementById('dynAkadLokasi')) document.getElementById('dynAkadLokasi').textContent = cfg.lokasi_acara;
    if (document.getElementById('cfgLokasi')) document.getElementById('cfgLokasi').value = cfg.lokasi_acara;
  }
  if (cfg.lokasi_acara_resepsi) {
    if (document.getElementById('dynResepsiLokasi')) document.getElementById('dynResepsiLokasi').textContent = cfg.lokasi_acara_resepsi;
    if (document.getElementById('cfgLokasiResepsi')) document.getElementById('cfgLokasiResepsi').value = cfg.lokasi_acara_resepsi;
  }
  if (cfg.info_hiburan) {
    if (document.getElementById('dynInfoHiburan')) document.getElementById('dynInfoHiburan').textContent = cfg.info_hiburan;
    if (document.getElementById('cfgInfoHiburan')) document.getElementById('cfgInfoHiburan').value = cfg.info_hiburan;
  }
  if (cfg.link_maps) {
    if (document.getElementById('dynAkadMaps')) document.getElementById('dynAkadMaps').href = cfg.link_maps;
    if (document.getElementById('dynResepsiMaps')) document.getElementById('dynResepsiMaps').href = cfg.link_maps;
    if (document.getElementById('cfgLinkMaps')) document.getElementById('cfgLinkMaps').value = cfg.link_maps;
  }
  if (cfg.quote_text) {
    var cleanQuote = cfg.quote_text.replace(/^["']+|["']+$/g, '').trim();
    if (document.getElementById('dynQuoteText')) document.getElementById('dynQuoteText').textContent = cleanQuote;
    if (document.getElementById('cfgQuote')) document.getElementById('cfgQuote').value = cleanQuote;
  }
  if (cfg.quote_author) {
    if (document.getElementById('dynQuoteAuthor')) document.getElementById('dynQuoteAuthor').textContent = cfg.quote_author;
    if (document.getElementById('cfgQuoteAuthor')) document.getElementById('cfgQuoteAuthor').value = cfg.quote_author;
  }

  if (cfg.rekening_1_bank) {
    if (document.getElementById('dynRek1Bank')) document.getElementById('dynRek1Bank').textContent = 'BANK ' + cfg.rekening_1_bank;
    if (document.getElementById('cfgRek1Bank')) document.getElementById('cfgRek1Bank').value = cfg.rekening_1_bank;
  }
  if (cfg.rekening_1_nomor) {
    if (document.getElementById('dynRek1Nomor')) document.getElementById('dynRek1Nomor').textContent = cfg.rekening_1_nomor;
    if (document.getElementById('cfgRek1Nomor')) document.getElementById('cfgRek1Nomor').value = cfg.rekening_1_nomor;
  }
  if (cfg.rekening_1_nama) {
    if (document.getElementById('dynRek1Nama')) document.getElementById('dynRek1Nama').textContent = 'a.n. ' + cfg.rekening_1_nama;
    if (document.getElementById('cfgRek1Nama')) document.getElementById('cfgRek1Nama').value = cfg.rekening_1_nama;
  }

  if (cfg.rekening_2_bank) {
    if (document.getElementById('dynRek2Bank')) document.getElementById('dynRek2Bank').textContent = 'BANK ' + cfg.rekening_2_bank;
    if (document.getElementById('cfgRek2Bank')) document.getElementById('cfgRek2Bank').value = cfg.rekening_2_bank;
  }
  if (cfg.rekening_2_nomor) {
    if (document.getElementById('dynRek2Nomor')) document.getElementById('dynRek2Nomor').textContent = cfg.rekening_2_nomor;
    if (document.getElementById('cfgRek2Nomor')) document.getElementById('cfgRek2Nomor').value = cfg.rekening_2_nomor;
  }
  if (cfg.rekening_2_nama) {
    if (document.getElementById('dynRek2Nama')) document.getElementById('dynRek2Nama').textContent = 'a.n. ' + cfg.rekening_2_nama;
    if (document.getElementById('cfgRek2Nama')) document.getElementById('cfgRek2Nama').value = cfg.rekening_2_nama;
  }

  var selQris = document.getElementById('cfgQrisEnabled');
  if (selQris) {
    selQris.value = (String(cfg.qris_enabled).toLowerCase() === 'false') ? 'false' : 'true';
  }

  if (cfg.qris_image_url) {
    if (document.getElementById('dynQRISImage')) document.getElementById('dynQRISImage').src = convertDriveUrl(cfg.qris_image_url);
    if (document.getElementById('cfgQrisUrl')) document.getElementById('cfgQrisUrl').value = cfg.qris_image_url;
  }
  if (cfg.alamat_kado_fisik) {
    if (document.getElementById('dynAddressText')) document.getElementById('dynAddressText').textContent = cfg.alamat_kado_fisik;
    if (document.getElementById('cfgAlamatKado')) document.getElementById('cfgAlamatKado').value = cfg.alamat_kado_fisik;
  }

  var inWaTpl = document.getElementById('cfgWaTemplate');
  if (inWaTpl) {
    inWaTpl.value = cfg.wa_message_template || currentClientConfig.wa_message_template || DEFAULT_WA_TEMPLATE;
  }

  for (var b = 1; b <= 3; b++) {
    var bJudul = cfg['story_judul_' + b] || currentClientConfig['story_judul_' + b];
    var bWaktu = cfg['story_waktu_' + b] || currentClientConfig['story_waktu_' + b];
    var bTeks = cfg['story_babak_' + b];

    if (bJudul) {
      if (document.getElementById('dynStoryJudul' + b)) document.getElementById('dynStoryJudul' + b).textContent = bJudul;
      if (document.getElementById('cfgStoryJudul' + b)) document.getElementById('cfgStoryJudul' + b).value = bJudul;
    }
    if (bWaktu) {
      if (document.getElementById('dynStoryWaktu' + b)) document.getElementById('dynStoryWaktu' + b).textContent = bWaktu;
      if (document.getElementById('cfgStoryWaktu' + b)) document.getElementById('cfgStoryWaktu' + b).value = bWaktu;
    }
    if (bTeks) {
      var cleanStory = bTeks.replace(/^["']+|["']+$/g, '').trim();
      if (document.getElementById('dynStory' + b)) document.getElementById('dynStory' + b).textContent = '"' + cleanStory + '"';
      if (document.getElementById('cfgStoryBabak' + b)) document.getElementById('cfgStoryBabak' + b).value = cleanStory;
    }
  }

  var selStory = document.getElementById('cfgStoryPhotoEnabled');
  if (selStory) {
    selStory.value = (String(cfg.story_photo_enabled).toLowerCase() === 'false') ? 'false' : 'true';
  }

  applyFeatureTogglesToUI();

  if (cfg.asset_wax_seal_cover && document.getElementById('btnWaxSeal')) {
    document.getElementById('btnWaxSeal').src = convertDriveUrl(cfg.asset_wax_seal_cover);
  }
  if (cfg.asset_cover_lily) {
    var elLily = document.querySelector('.flower-cover-corner') || document.querySelector('.flower-cover-lily');
    if (elLily) { elLily.src = convertDriveUrl(cfg.asset_cover_lily); elLily.style.display = 'block'; }
  }
  if (cfg.asset_cover_branch) {
    var elBranch = document.querySelector('.flower-cover-branch');
    if (elBranch) { elBranch.src = convertDriveUrl(cfg.asset_cover_branch); elBranch.style.display = 'block'; }
  }
  if (cfg.asset_hero_pink) {
    var cleanPink = convertDriveUrl(cfg.asset_hero_pink);
    var heroPink = document.querySelector('.flower-hero-pink');
    var cdPink = document.querySelector('.flower-countdown-pink');
    if (heroPink) { heroPink.src = cleanPink; heroPink.style.display = 'block'; }
    if (cdPink) { cdPink.src = cleanPink; cdPink.style.display = 'block'; }
  }
  if (cfg.asset_hero_crescent) {
    var heroCresc = document.querySelector('.flower-hero-crescent');
    if (heroCresc) { heroCresc.src = convertDriveUrl(cfg.asset_hero_crescent); heroCresc.style.display = 'block'; }
  }
  if (cfg.asset_twin_flowers) {
    var cleanTwin = convertDriveUrl(cfg.asset_twin_flowers);
    var twinLeft = document.querySelector('.flower-twin-item.twin-left');
    var twinRight = document.querySelector('.flower-twin-item.twin-right');
    if (twinLeft) { twinLeft.src = cleanTwin; twinLeft.style.display = 'block'; }
    if (twinRight) { twinRight.src = cleanTwin; twinRight.style.display = 'block'; }
  }
  if (cfg.asset_pastel_roses) {
    var cleanPastel = convertDriveUrl(cfg.asset_pastel_roses);
    document.querySelectorAll('.flower-event-pastel').forEach(function(pr) {
      pr.src = cleanPastel;
      pr.style.display = 'block';
    });
  }
  if (cfg.asset_garland_vines) {
    var cleanGarland = convertDriveUrl(cfg.asset_garland_vines);
    var garlandLeft = document.querySelector('.flower-journey-garland-left');
    var garlandRight = document.querySelector('.flower-journey-garland-right');
    if (garlandLeft) { garlandLeft.src = cleanGarland; garlandLeft.style.display = 'block'; }
    if (garlandRight) { garlandRight.src = cleanGarland; garlandRight.style.display = 'block'; }
  }
  if (cfg.asset_ribbon_roses) {
    var elRibbon = document.querySelector('.flower-ribbon-roses');
    if (elRibbon) { elRibbon.src = convertDriveUrl(cfg.asset_ribbon_roses); elRibbon.style.display = 'block'; }
  }
  if (cfg.asset_orchid) {
    var cleanOrchid = convertDriveUrl(cfg.asset_orchid);
    document.querySelectorAll('.flower-journey-orchid').forEach(function(jo) {
      jo.src = cleanOrchid;
      jo.style.display = 'block';
    });
  }
  if (cfg.asset_crest_frame) {
    var cleanCrest = convertDriveUrl(cfg.asset_crest_frame);
    document.querySelectorAll('.crest-frame-seal').forEach(function(img) {
      img.src = cleanCrest;
      img.style.display = 'block';
    });
  }
  if (cfg.asset_eucalyptus) {
    var cleanEuca = convertDriveUrl(cfg.asset_eucalyptus);
    var eucaP = document.querySelector('.eucalyptus-accent-pria');
    var eucaW = document.querySelector('.eucalyptus-accent-wanita');
    if (eucaP) { eucaP.src = cleanEuca; eucaP.style.display = 'block'; }
    if (eucaW) { eucaW.src = cleanEuca; eucaW.style.display = 'block'; }
  }

  if (cfg.audio_url) {
    if (document.getElementById('cfgAudioUrl')) document.getElementById('cfgAudioUrl').value = cfg.audio_url;
    setupAudioPlayer(cfg.audio_url);
  } else {
    setupAudioPlayer(DEFAULT_AUDIO_URL);
  }

  var activeAudioTitle = (cfg.audio_title !== undefined && cfg.audio_title !== null) ? String(cfg.audio_title).trim() : '';
  currentClientConfig.audio_title = activeAudioTitle;
  if (document.getElementById('cfgAudioTitle')) {
    document.getElementById('cfgAudioTitle').value = activeAudioTitle;
  }
  applyAudioTitleToUI(activeAudioTitle);

  if (cfg.foto_cover_url) {
    if (document.getElementById('dynHeroPhoto')) document.getElementById('dynHeroPhoto').src = convertDriveUrl(cfg.foto_cover_url);
    if (document.getElementById('cfgFotoCover')) document.getElementById('cfgFotoCover').value = cfg.foto_cover_url;
  }
  if (cfg.foto_pria_url) {
    if (document.getElementById('dynPhotoPria')) document.getElementById('dynPhotoPria').src = convertDriveUrl(cfg.foto_pria_url);
    if (document.getElementById('cfgFotoPria')) document.getElementById('cfgFotoPria').value = cfg.foto_pria_url;
  }
  if (cfg.foto_wanita_url) {
    if (document.getElementById('dynPhotoWanita')) document.getElementById('dynPhotoWanita').src = convertDriveUrl(cfg.foto_wanita_url);
    if (document.getElementById('cfgFotoWanita')) document.getElementById('cfgFotoWanita').value = cfg.foto_wanita_url;
  }

  for (var s = 1; s <= 3; s++) {
    var sUrl = cfg['story_foto_' + s];
    var elStoryImg = document.getElementById('dynStoryFoto' + s);
    var elStoryInp = document.getElementById('cfgStoryFoto' + s);
    if (sUrl && elStoryImg) elStoryImg.src = convertDriveUrl(sUrl);
    if (sUrl && elStoryInp) elStoryInp.value = sUrl;
    if (!cfg['dynStoryFoto' + s + '_transform'] && cfg['story_foto_' + s + '_pos'] && elStoryImg) {
      elStoryImg.style.objectPosition = cfg['story_foto_' + s + '_pos'];
    }
  }

  for (var i = 1; i <= 6; i++) {
    var gUrl = cfg['galeri_' + i + '_url'];
    var elImg = document.getElementById('dynGaleri' + i);
    var elInp = document.getElementById('cfgGaleri' + i);
    if (gUrl && elImg) elImg.src = convertDriveUrl(gUrl);
    if (gUrl && elInp) elInp.value = gUrl;
    if (!cfg['dynGaleri' + i + '_transform'] && cfg['galeri_' + i + '_pos'] && elImg) {
      elImg.style.objectPosition = cfg['galeri_' + i + '_pos'];
    }
  }

  var allPhotoKeys = [
    'dynPhotoPria', 'dynPhotoWanita', 'dynHeroPhoto',
    'dynStoryFoto1', 'dynStoryFoto2', 'dynStoryFoto3',
    'dynGaleri1', 'dynGaleri2', 'dynGaleri3', 'dynGaleri4', 'dynGaleri5', 'dynGaleri6'
  ];

  allPhotoKeys.forEach(function(targetId) {
    var tStr = cfg[targetId + '_transform'];
    if (tStr) {
      var parts = tStr.split('|');
      if (parts.length === 3) {
        var z = parseInt(parts[0], 10) || 100;
        var x = parseFloat(parts[1]);
        var y = parseFloat(parts[2]);
        if (isNaN(x)) x = 50;
        if (isNaN(y)) y = 50;
        photoTransforms[targetId] = { zoom: z, x: x, y: y };
        var imgEl = document.getElementById(targetId);
        if (imgEl) {
          imgEl.style.objectPosition = x + '% ' + y + '%';
          imgEl.style.transform = z > 100 ? 'scale(' + (z / 100) + ')' : '';
        }
      }
    }
  });
}

function saveConfigData() {
  var payload = {
    cover_eyebrow: document.getElementById('cfgCoverEyebrow').value.trim(),
    salam_pembuka_judul: document.getElementById('cfgSalamJudul').value.trim(),
    salam_pembuka_teks: document.getElementById('cfgSalamTeks').value.trim(),
    judul_sesi_1: document.getElementById('cfgJudulSesi1').value.trim(),
    judul_sesi_2: document.getElementById('cfgJudulSesi2').value.trim(),
    teks_pengantar_kado: document.getElementById('cfgPengantarKado').value.trim(),
    teks_penutup_footer: document.getElementById('cfgPenutupFooter').value.trim(),
    panggilan_title: document.getElementById('cfgPanggilanTitle').value.trim(),
    inisial_mempelai: document.getElementById('cfgInisialMempelai').value.trim(),
    nama_lengkap_pria: document.getElementById('cfgNamaPria').value,
    panggilan_pria: document.getElementById('cfgPanggilanPria').value,
    ortu_pria: document.getElementById('cfgOrtuPria').value,
    ig_pria: document.getElementById('cfgIgPria').value,
    nama_lengkap_wanita: document.getElementById('cfgNamaWanita').value,
    panggilan_wanita: document.getElementById('cfgPanggilanWanita').value,
    ortu_wanita: document.getElementById('cfgOrtuWanita').value,
    ig_wanita: document.getElementById('cfgIgWanita').value,
    tanggal_cover: document.getElementById('cfgCoverDate').value,
    tanggal_hero: document.getElementById('cfgHeroDate').value,
    countdown_target: document.getElementById('cfgCountdownTarget').value,
    akad_cal_end: document.getElementById('cfgAkadCalEnd').value,
    resepsi_cal_start: document.getElementById('cfgResepsiCalStart').value,
    resepsi_cal_end: document.getElementById('cfgResepsiCalEnd').value,
    tanggal_akad: document.getElementById('cfgAkadTanggal').value,
    waktu_akad: document.getElementById('cfgAkadWaktu').value,
    tanggal_resepsi: document.getElementById('cfgResepsiTanggal').value,
    waktu_resepsi: document.getElementById('cfgResepsiWaktu').value,
    lokasi_ringkas: document.getElementById('cfgLokasiRingkas').value,
    lokasi_acara: document.getElementById('cfgLokasi').value,
    lokasi_acara_resepsi: document.getElementById('cfgLokasiResepsi').value,
    info_hiburan: document.getElementById('cfgInfoHiburan').value,
    link_maps: document.getElementById('cfgLinkMaps').value,
    quote_text: document.getElementById('cfgQuote').value,
    quote_author: document.getElementById('cfgQuoteAuthor').value,
    story_judul_1: document.getElementById('cfgStoryJudul1').value.trim(),
    story_waktu_1: document.getElementById('cfgStoryWaktu1').value.trim(),
    story_babak_1: document.getElementById('cfgStoryBabak1').value.trim(),
    story_judul_2: document.getElementById('cfgStoryJudul2').value.trim(),
    story_waktu_2: document.getElementById('cfgStoryWaktu2').value.trim(),
    story_babak_2: document.getElementById('cfgStoryBabak2').value.trim(),
    story_judul_3: document.getElementById('cfgStoryJudul3').value.trim(),
    story_waktu_3: document.getElementById('cfgStoryWaktu3').value.trim(),
    story_babak_3: document.getElementById('cfgStoryBabak3').value.trim(),
    rekening_1_bank: document.getElementById('cfgRek1Bank').value,
    rekening_1_nomor: document.getElementById('cfgRek1Nomor').value,
    rekening_1_nama: document.getElementById('cfgRek1Nama').value,
    rekening_2_bank: document.getElementById('cfgRek2Bank').value,
    rekening_2_nomor: document.getElementById('cfgRek2Nomor').value,
    rekening_2_nama: document.getElementById('cfgRek2Nama').value,
    qris_enabled: document.getElementById('cfgQrisEnabled').value,
    qris_image_url: document.getElementById('cfgQrisUrl').value.trim(),
    alamat_kado_fisik: document.getElementById('cfgAlamatKado').value,
    wa_message_template: document.getElementById('cfgWaTemplate').value,
    public_web_app_url: document.getElementById('cfgPublicAppUrl').value.trim(),
    audio_title: document.getElementById('cfgAudioTitle') ? document.getElementById('cfgAudioTitle').value.trim() : '',
    audio_url: document.getElementById('cfgAudioUrl').value.trim(),
    story_photo_enabled: document.getElementById('cfgStoryPhotoEnabled').value,
    foto_cover_url: document.getElementById('cfgFotoCover').value.trim(),
    foto_pria_url: document.getElementById('cfgFotoPria').value.trim(),
    foto_wanita_url: document.getElementById('cfgFotoWanita').value.trim(),
    twibbon_subtext: document.getElementById('cfgTwibbonSubtext').value.trim(),
    twibbon_templates_json: JSON.stringify(customTwibbonTemplates || [])
  };

  for (var s = 1; s <= 3; s++) {
    var elS = document.getElementById('cfgStoryFoto' + s);
    if (elS) payload['story_foto_' + s] = elS.value.trim();
    var stT = photoTransforms['dynStoryFoto' + s];
    if (stT) payload['story_foto_' + s + '_pos'] = stT.x + '% ' + stT.y + '%';
  }

  for (var i = 1; i <= 6; i++) {
    var elG = document.getElementById('cfgGaleri' + i);
    if (elG) payload['galeri_' + i + '_url'] = elG.value.trim();
    var glT = photoTransforms['dynGaleri' + i];
    if (glT) payload['galeri_' + i + '_pos'] = glT.x + '% ' + glT.y + '%';
  }

  for (var k in liveEditedFields) {
    if (liveEditedFields.hasOwnProperty(k)) {
      payload[k] = liveEditedFields[k];
    }
  }

  for (var targetId in photoTransforms) {
    if (photoTransforms.hasOwnProperty(targetId)) {
      var pt = photoTransforms[targetId];
      payload[targetId + '_transform'] = pt.zoom + '|' + pt.x + '|' + pt.y;
    }
  }

  showToast('Menyimpan seluruh perubahan ke Google Sheets...');

  if (isGasApiConfigured()) {
    callGasApiPost('saveConfig', { config: payload, pin: currentAdminPin })
      .then(function(res) {
        if (res && res.status === 'success') {
          liveEditedFields = {};
          showToast('Data konfigurasi & posisi foto berhasil disimpan permanen!');
          loadAdminData();
        } else {
          showToast((res && res.message) ? res.message : 'Gagal menyimpan.');
        }
      })
      .catch(function(err) {
        showToast('Gagal menyimpan: ' + err.message);
      });
  }
}

// ==========================================================================
// 13. REKAP KEHADIRAN TAMU & ANALITIK PORSI KATERING
// ==========================================================================
function loadRSVPFeedAndAnalytics() {
  if (!isGasApiConfigured()) return;

  callGasApiGet('getRSVP')
    .then(function(res) {
      if (res && res.status === 'success' && res.data) {
        rawRSVPData = res.data;
        updateCateringAnalytics(res.data);
        renderDetailedRSVPTable(res.data);
        filterPublicRSVPFeed();
      }
    })
    .catch(function(err) {
      console.warn('Error loadRSVP:', err);
    });
}

function updateCateringAnalytics(list) {
  var total = list.length;
  var hadir = 0;
  var tidakHadir = 0;
  var totalPax = 0;

  list.forEach(function(item) {
    if (item.kehadiran === 'Hadir') {
      hadir++;
      totalPax += parseInt(item.pax, 10) || 1;
    } else {
      tidakHadir++;
    }
  });

  var statTotal = document.getElementById('statTotalRSVP');
  var statPax = document.getElementById('statTotalPax');
  var statHad = document.getElementById('statHadir');
  var statNo = document.getElementById('statTidakHadir');
  var barHadir = document.getElementById('barHadir');
  var lblRatio = document.getElementById('lblRatioPercent');

  if (statTotal) statTotal.textContent = total;
  if (statPax) statPax.textContent = totalPax;
  if (statHad) statHad.textContent = hadir;
  if (statNo) statNo.textContent = tidakHadir;

  var ratio = total > 0 ? Math.round((hadir / total) * 100) : 0;
  if (barHadir) barHadir.style.width = ratio + '%';
  if (lblRatio) lblRatio.textContent = ratio + '% Tamu Hadir (' + totalPax + ' Pax)';
}

function renderDetailedRSVPTable(list) {
  var container = document.getElementById('rsvpDetailedCardList');
  if (!container) return;
  container.innerHTML = '';

  if (!list || list.length === 0) {
    container.innerHTML = '<div class="admin-list-empty">Belum ada data konfirmasi kehadiran yang sesuai filter.</div>';
    return;
  }

  list.forEach(function(item) {
    var isHadir = (item.kehadiran === 'Hadir');
    var badgeHtml = isHadir
      ? '<span class="status-badge sent">Hadir</span>'
      : '<span class="status-badge pending">Berhalangan</span>';
    var paxHtml = isHadir
      ? '<span class="rsvp-pax-pill">' + (parseInt(item.pax, 10) || 1) + ' Pax</span>'
      : '';

    var safeRsvpId = escapeJsAttr(item.id || '');
    var safeRsvpNama = escapeJsAttr(item.nama || 'Anonim');
    var delBtnHtml = safeRsvpId
      ? '<button type="button" class="btn-rsvp-delete" onclick="openConfirmDeleteRSVPModal(\'' + safeRsvpId + '\', \'' + safeRsvpNama + '\')" title="Hapus data RSVP ini">🗑️ Hapus</button>'
      : '';

    var card = document.createElement('div');
    card.className = 'rsvp-item-card ' + (isHadir ? 'is-attending' : 'is-absent');
    card.innerHTML =
      '<div class="rsvp-card-top">' +
        '<div class="rsvp-card-name">' + escapeHtml(item.nama || 'Anonim') + '</div>' +
        '<div class="rsvp-card-badges">' + paxHtml + badgeHtml + '</div>' +
      '</div>' +
      '<div class="rsvp-card-msg">' + escapeHtml(item.pesan || '-') + '</div>' +
      '<div class="rsvp-card-footer">' +
        '<span>WA: ' + escapeHtml(item.kontak || '-') + ' • ' + escapeHtml(item.timestamp || '-') + '</span>' +
        delBtnHtml +
      '</div>';

    container.appendChild(card);
  });
}

function setRSVPStatusFilter(status, btnEl) {
  currentRSVPFilter = status;
  var pills = document.querySelectorAll('#screenRSVP .filter-pills-row .btn-filter-pill');
  pills.forEach(function(p) { p.classList.remove('active'); });
  if (btnEl) btnEl.classList.add('active');
  filterRSVPTable();
}

function filterRSVPTable() {
  var filtered = getFilteredRSVPData();
  renderDetailedRSVPTable(filtered);
}

function closeLightbox() {
  var modal = document.getElementById('lightboxModal');
  if (modal) modal.classList.remove('show');
}

function toggleQRISModal(show) {
  var modal = document.getElementById('qrisModal');
  if (!modal) return;
  if (show) modal.classList.add('show');
  else modal.classList.remove('show');
}

function toggleGiftModal(show) {
  var modal = document.getElementById('giftModal');
  if (!modal) return;
  if (show) modal.classList.add('show');
  else modal.classList.remove('show');
}

// ==========================================================================
// 14. LIVE INLINE EDITING LANGSUNG DI KANVAS UNDANGAN
// ==========================================================================
function enableLiveInlineEditing() {
  var editables = document.querySelectorAll('.live-editable');
  editables.forEach(function(el) {
    el.setAttribute('contenteditable', 'true');
    if (el._liveBound) return;
    el._liveBound = true;

    el.addEventListener('blur', function() {
      var key = el.getAttribute('data-key');
      if (!key) return;
      var val = el.innerText.trim();
      if (key.indexOf('story_babak_') === 0) {
        val = val.replace(/^["']+|["']+$/g, '').trim();
      }
      liveEditedFields[key] = val;
      syncInlineFieldToInput(key, val);
    });
  });
}

function syncInlineFieldToInput(key, val) {
  var keyInputMap = {
    cover_eyebrow: 'cfgCoverEyebrow',
    salam_pembuka_judul: 'cfgSalamJudul',
    salam_pembuka_teks: 'cfgSalamTeks',
    judul_sesi_1: 'cfgJudulSesi1',
    judul_sesi_2: 'cfgJudulSesi2',
    teks_pengantar_kado: 'cfgPengantarKado',
    teks_penutup_footer: 'cfgPenutupFooter',
    panggilan_title: 'cfgPanggilanTitle',
    tanggal_cover: 'cfgCoverDate',
    tanggal_hero: 'cfgHeroDate',
    lokasi_ringkas: 'cfgLokasiRingkas',
    quote_text: 'cfgQuote',
    quote_author: 'cfgQuoteAuthor',
    nama_lengkap_pria: 'cfgNamaPria',
    ortu_pria: 'cfgOrtuPria',
    nama_lengkap_wanita: 'cfgNamaWanita',
    ortu_wanita: 'cfgOrtuWanita',
    tanggal_akad: 'cfgAkadTanggal',
    waktu_akad: 'cfgAkadWaktu',
    lokasi_acara: 'cfgLokasi',
    tanggal_resepsi: 'cfgResepsiTanggal',
    waktu_resepsi: 'cfgResepsiWaktu',
    lokasi_acara_resepsi: 'cfgLokasiResepsi',
    info_hiburan: 'cfgInfoHiburan',
    story_judul_1: 'cfgStoryJudul1',
    story_waktu_1: 'cfgStoryWaktu1',
    story_babak_1: 'cfgStoryBabak1',
    story_judul_2: 'cfgStoryJudul2',
    story_waktu_2: 'cfgStoryWaktu2',
    story_babak_2: 'cfgStoryBabak2',
    story_judul_3: 'cfgStoryJudul3',
    story_waktu_3: 'cfgStoryWaktu3',
    story_babak_3: 'cfgStoryBabak3'
  };

  var inputId = keyInputMap[key];
  if (inputId && document.getElementById(inputId)) {
    document.getElementById(inputId).value = val;
  }
}

function saveAllLiveEdits() {
  var editables = document.querySelectorAll('.live-editable');
  editables.forEach(function(el) {
    var key = el.getAttribute('data-key');
    if (key) {
      var val = el.innerText.trim();
      if (key.indexOf('story_babak_') === 0) {
        val = val.replace(/^["']+|["']+$/g, '').trim();
      }
      liveEditedFields[key] = val;
      syncInlineFieldToInput(key, val);
    }
  });
  saveConfigData();
}

// ==========================================================================
// 15. STUDIO PHOTO INSPECTOR & ZOOM (GESER POSISI & PERBESAR FOTO)
// ==========================================================================
function openPhotoAdjustModal(targetId) {
  currentPhotoTargetId = targetId || 'dynPhotoPria';
  var sel = document.getElementById('selTargetPhoto');
  if (sel) sel.value = currentPhotoTargetId;

  var targetImg = document.getElementById(currentPhotoTargetId);
  var previewImg = document.getElementById('canvasPreviewImg');
  var urlInp = document.getElementById('canvasDirectPhotoUrl');

  var photoConfigInputMap = {
    dynHeroPhoto: 'cfgFotoCover',
    dynPhotoPria: 'cfgFotoPria',
    dynPhotoWanita: 'cfgFotoWanita',
    dynStoryFoto1: 'cfgStoryFoto1',
    dynStoryFoto2: 'cfgStoryFoto2',
    dynStoryFoto3: 'cfgStoryFoto3',
    dynGaleri1: 'cfgGaleri1',
    dynGaleri2: 'cfgGaleri2',
    dynGaleri3: 'cfgGaleri3',
    dynGaleri4: 'cfgGaleri4',
    dynGaleri5: 'cfgGaleri5',
    dynGaleri6: 'cfgGaleri6'
  };

  var cfgId = photoConfigInputMap[currentPhotoTargetId];
  if (urlInp && cfgId && document.getElementById(cfgId)) {
    urlInp.value = document.getElementById(cfgId).value;
  }

  if (targetImg && previewImg) {
    previewImg.src = targetImg.src;
  }

  var tf = photoTransforms[currentPhotoTargetId] || { zoom: 100, x: 50, y: 50 };
  var sl = document.getElementById('sliderZoom');
  var lb = document.getElementById('lblZoomVal');
  if (sl) sl.value = tf.zoom;
  if (lb) lb.textContent = tf.zoom + '%';

  updateCanvasPreviewDisplay();

  var modal = document.getElementById('photoAdjustModal');
  if (modal) modal.classList.add('show');
}

function closePhotoAdjustModal() {
  var modal = document.getElementById('photoAdjustModal');
  if (modal) modal.classList.remove('show');
}

function onTargetPhotoChanged(newTargetId) {
  openPhotoAdjustModal(newTargetId);
}

function updateDirectPhotoSource(rawUrl) {
  var clean = convertDriveUrl(rawUrl);
  if (!clean) return;

  var previewImg = document.getElementById('canvasPreviewImg');
  var targetImg = document.getElementById(currentPhotoTargetId);
  if (previewImg) previewImg.src = clean;
  if (targetImg) targetImg.src = clean;

  var photoConfigInputMap = {
    dynHeroPhoto: 'cfgFotoCover',
    dynPhotoPria: 'cfgFotoPria',
    dynPhotoWanita: 'cfgFotoWanita',
    dynStoryFoto1: 'cfgStoryFoto1',
    dynStoryFoto2: 'cfgStoryFoto2',
    dynStoryFoto3: 'cfgStoryFoto3',
    dynGaleri1: 'cfgGaleri1',
    dynGaleri2: 'cfgGaleri2',
    dynGaleri3: 'cfgGaleri3',
    dynGaleri4: 'cfgGaleri4',
    dynGaleri5: 'cfgGaleri5',
    dynGaleri6: 'cfgGaleri6'
  };

  var cfgId = photoConfigInputMap[currentPhotoTargetId];
  if (cfgId && document.getElementById(cfgId)) {
    document.getElementById(cfgId).value = rawUrl.trim();
  }
}

function updateCanvasPreviewDisplay() {
  var previewImg = document.getElementById('canvasPreviewImg');
  if (!previewImg) return;
  var tf = photoTransforms[currentPhotoTargetId] || { zoom: 100, x: 50, y: 50 };
  previewImg.style.objectPosition = tf.x + '% ' + tf.y + '%';
  previewImg.style.transform = tf.zoom > 100 ? 'scale(' + (tf.zoom / 100) + ')' : '';
}

function nudgePhoto(dx, dy) {
  var tf = photoTransforms[currentPhotoTargetId] || { zoom: 100, x: 50, y: 50 };
  tf.x = Math.max(0, Math.min(100, tf.x + dx));
  tf.y = Math.max(0, Math.min(100, tf.y + dy));
  photoTransforms[currentPhotoTargetId] = tf;
  updateCanvasPreviewDisplay();
}

function resetPhotoTransform() {
  photoTransforms[currentPhotoTargetId] = { zoom: 100, x: 50, y: 50 };
  var sl = document.getElementById('sliderZoom');
  var lb = document.getElementById('lblZoomVal');
  if (sl) sl.value = 100;
  if (lb) lb.textContent = '100%';
  updateCanvasPreviewDisplay();
}

function onZoomSliderChanged(val) {
  var tf = photoTransforms[currentPhotoTargetId] || { zoom: 100, x: 50, y: 50 };
  tf.zoom = parseInt(val, 10) || 100;
  photoTransforms[currentPhotoTargetId] = tf;
  var lb = document.getElementById('lblZoomVal');
  if (lb) lb.textContent = tf.zoom + '%';
  updateCanvasPreviewDisplay();
}

function applyPhotoTransformToTarget() {
  var targetImg = document.getElementById(currentPhotoTargetId);
  var tf = photoTransforms[currentPhotoTargetId] || { zoom: 100, x: 50, y: 50 };

  if (targetImg) {
    targetImg.style.objectPosition = tf.x + '% ' + tf.y + '%';
    targetImg.style.transform = tf.zoom > 100 ? 'scale(' + (tf.zoom / 100) + ')' : '';
  }

  closePhotoAdjustModal();
  showToast('Posisi & zoom foto diterapkan! Klik Simpan di atas untuk mengunci ke database.');
}

function initCanvasDragInteractions() {
  var box = document.getElementById('canvasPreviewBox');
  if (!box) return;

  box.addEventListener('mousedown', function(e) {
    isDraggingCanvasPhoto = true;
    canvasDragStartX = e.clientX;
    canvasDragStartY = e.clientY;
  });

  window.addEventListener('mousemove', function(e) {
    if (!isDraggingCanvasPhoto) return;
    var dx = (canvasDragStartX - e.clientX) * 0.4;
    var dy = (canvasDragStartY - e.clientY) * 0.4;
    canvasDragStartX = e.clientX;
    canvasDragStartY = e.clientY;
    nudgePhoto(dx, dy);
  });

  window.addEventListener('mouseup', function() {
    isDraggingCanvasPhoto = false;
  });

  box.addEventListener('touchstart', function(e) {
    if (!e.touches[0]) return;
    isDraggingCanvasPhoto = true;
    canvasDragStartX = e.touches[0].clientX;
    canvasDragStartY = e.touches[0].clientY;
  }, { passive: true });

  box.addEventListener('touchmove', function(e) {
    if (!isDraggingCanvasPhoto || !e.touches[0]) return;
    var dx = (canvasDragStartX - e.touches[0].clientX) * 0.4;
    var dy = (canvasDragStartY - e.touches[0].clientY) * 0.4;
    canvasDragStartX = e.touches[0].clientX;
    canvasDragStartY = e.touches[0].clientY;
    nudgePhoto(dx, dy);
  }, { passive: true });

  box.addEventListener('touchend', function() {
    isDraggingCanvasPhoto = false;
  });
}

// ==========================================================================
// 16. MANAJEMEN TAMU, DETEKSI NOMOR GANDA, CHECK-IN & PENGAMANAN DATA
// ==========================================================================
function normalizeWaNumber(rawWa) {
  var digits = String(rawWa || '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.charAt(0) === '0') {
    digits = '62' + digits.slice(1);
  } else if (digits.charAt(0) === '8') {
    digits = '62' + digits;
  }
  return digits;
}

function buildDuplicateWaMap(list) {
  var counts = {};
  var arr = list || [];
  arr.forEach(function(g) {
    var norm = normalizeWaNumber(g.wa);
    if (norm) {
      counts[norm] = (counts[norm] || 0) + 1;
    }
  });

  var dupGuestsTotal = 0;
  arr.forEach(function(g) {
    var norm = normalizeWaNumber(g.wa);
    if (norm && counts[norm] > 1) {
      dupGuestsTotal++;
    }
  });

  var badgeEl = document.getElementById('dupWaCountBadge');
  if (badgeEl) badgeEl.textContent = dupGuestsTotal;

  return counts;
}

function toggleDuplicateWaFilter(btnEl) {
  filterDuplicateWaOnly = !filterDuplicateWaOnly;
  if (btnEl) {
    if (filterDuplicateWaOnly) btnEl.classList.add('active');
    else btnEl.classList.remove('active');
  }
  filterGuestListTable();
}

function getEffectiveAppUrl() {
  var cfgInput = document.getElementById('cfgPublicAppUrl');
  if (cfgInput && cfgInput.value.trim()) {
    return cfgInput.value.trim().replace(/\/$/, '');
  }
  return window.location.href.split('?')[0].split('#')[0];
}

function buildProfessionalWaMessage(guestName, guestLink) {
  var elTpl = document.getElementById('cfgWaTemplate');
  var rawTpl = (elTpl && elTpl.value.trim())
    ? elTpl.value
    : (currentClientConfig.wa_message_template || DEFAULT_WA_TEMPLATE);

  var namaLengkapPasangan =
    (currentClientConfig.nama_lengkap_pria || 'Mempelai Pria') +
    ' & ' +
    (currentClientConfig.nama_lengkap_wanita || 'Mempelai Wanita');
  var namaPanggilan = currentClientConfig.panggilan_title || 'Kedua Mempelai';
  var tglAkad = currentClientConfig.tanggal_akad || '';
  var tglResepsi = currentClientConfig.tanggal_resepsi || '';
  var lokasi = currentClientConfig.lokasi_acara || '';

  return rawTpl
    .replace(/\{nama_tamu\}/gi, guestName)
    .replace(/\{nama_mempelai_lengkap\}/gi, namaLengkapPasangan)
    .replace(/\{nama_panggilan\}/gi, namaPanggilan)
    .replace(/\{tanggal_akad\}/gi, tglAkad)
    .replace(/\{tanggal_resepsi\}/gi, tglResepsi)
    .replace(/\{lokasi_acara\}/gi, lokasi)
    .replace(/\{link_undangan\}/gi, guestLink);
}

function updateGuestCheckinStats(list) {
  var arr = list || [];
  var total = arr.length;
  var hadir = 0;

  arr.forEach(function(g) {
    if (String(g.kehadiranHariH || '').trim() === 'Sudah Hadir') {
      hadir++;
    }
  });

  var belum = Math.max(0, total - hadir);
  var elTotal = document.getElementById('statGuestTotal');
  var elHadir = document.getElementById('statGuestHadir');
  var elBelum = document.getElementById('statGuestBelum');

  if (elTotal) elTotal.textContent = total;
  if (elHadir) elHadir.textContent = hadir;
  if (elBelum) elBelum.textContent = belum;
  buildDuplicateWaMap(arr);
}

function setGuestAttendanceFilter(status, btnEl) {
  currentGuestFilter = status;
  var pills = document.querySelectorAll('#guestStatusFilterRow .btn-filter-pill');
  pills.forEach(function(p) { p.classList.remove('active'); });
  if (btnEl) btnEl.classList.add('active');
  filterGuestListTable();
}

function setGuestCategoryFilter(category, btnEl) {
  currentGuestCategoryFilter = category;
  var pills = document.querySelectorAll('#guestCategoryFilterRow .btn-cat-pill:not(.btn-dup-filter)');
  pills.forEach(function(p) { p.classList.remove('active'); });
  if (btnEl) btnEl.classList.add('active');
  filterGuestListTable();
}

function filterGuestListTable() {
  var filtered = getFilteredGuestData();
  renderGuestTable(filtered);
}

function loadGuestList() {
  var container = document.getElementById('guestCardList');
  if (!container || !isGasApiConfigured()) return;

  callGasApiPost('getGuestList', { pin: currentAdminPin })
    .then(function(res) {
      if (res && res.status === 'success' && res.data) {
        guestQueueList = res.data;
        updateGuestCheckinStats(res.data);
        filterGuestListTable();
      }
    })
    .catch(function(err) {
      console.warn('Error loadGuestList:', err);
    });
}

function manualCheckInGuest(guestName, category) {
  unlockScanAudioContext();
  if (!guestName || !isGasApiConfigured()) return;

  showToast('Mencatat kehadiran ' + guestName + '...');
  callGasApiPost('checkInGuest', {
    identifier: guestName,
    pin: currentAdminPin,
    categoryHint: category || 'Tamu'
  })
    .then(function(res) {
      if (res && res.status === 'success') {
        playScanBeepSound('success');
        showToast('Berhasil Check-In: ' + (res.guestName || guestName));
        loadGuestList();
      } else if (res && res.status === 'already_checked_in') {
        playScanBeepSound('duplicate');
        showToast('Info: ' + (res.guestName || guestName) + ' sudah tercatat hadir.');
      } else {
        showToast((res && res.message) ? res.message : 'Gagal check-in.');
      }
    })
    .catch(function(err) {
      showToast('Error check-in: ' + err.message);
    });
}

function escapeJsAttr(str) {
  return String(str || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;');
}

function renderGuestTable(list) {
  var container = document.getElementById('guestCardList');
  if (!container) return;
  container.innerHTML = '';

  var dupMap = buildDuplicateWaMap(guestQueueList);

  if (!list || list.length === 0) {
    container.innerHTML = '<div class="admin-list-empty">Tidak ada daftar tamu yang sesuai dengan pencarian atau filter.</div>';
    return;
  }

  list.forEach(function(g) {
    var isSent = (g.status === 'Sudah Dikirim');
    var waStatusBadge = isSent
      ? '<span class="status-badge sent">Sudah Dikirim</span>'
      : '<span class="status-badge pending">Belum Dikirim</span>';

    var isCheckedIn = (String(g.kehadiranHariH || '').trim() === 'Sudah Hadir');
    var cleanTime = formatCleanTimeOnly(g.waktuCheckin);
    var checkinBadge = isCheckedIn
      ? '<span class="badge-checkin-hadir">✅ Hadir • ' + escapeHtml(cleanTime) + ' WIB</span>'
      : '<span class="badge-checkin-belum">Belum Hadir</span>';

    var normWa = normalizeWaNumber(g.wa);
    var dupCount = (normWa && dupMap[normWa]) ? dupMap[normWa] : 0;
    var isDuplicateWa = dupCount > 1;
    var dupTagHtml = isDuplicateWa
      ? '<span class="badge-dup-wa">⚠️ Nomor WA Ganda (' + dupCount + 'x)</span>'
      : '';

    var safeId = escapeJsAttr(g.id);
    var safeWa = escapeJsAttr(g.wa);
    var safeNama = escapeJsAttr(g.nama);
    var safeKat = escapeJsAttr(g.kategori || 'Teman');

    var checkinActionBtn = !isCheckedIn
      ? '<button type="button" class="btn-card-action btn-card-checkin" onclick="manualCheckInGuest(\'' + safeNama + '\', \'' + safeKat + '\')">✓ Check-In</button>'
      : '<button type="button" class="btn-card-action btn-card-checked-cancel" onclick="openConfirmCancelCheckInModal(\'' + safeId + '\', \'' + safeNama + '\')" title="Ketuk jika salah pencet untuk membatalkan status hadir">✓ Hadir ✕</button>';

    var deleteBtn =
      '<button type="button" class="btn-card-action btn-card-delete" onclick="openConfirmDeleteGuestModal(\'' + safeId + '\', \'' + safeNama + '\', \'' + safeWa + '\', ' + isCheckedIn + ', ' + isSent + ')" title="Hapus tamu ini">🗑️</button>';

    var card = document.createElement('div');
    card.className = 'guest-item-card' + (isCheckedIn ? ' is-present' : '') + (isDuplicateWa ? ' has-dup-wa' : '');
    card.innerHTML =
      '<div class="guest-card-top">' +
        '<div class="guest-card-identity">' +
          '<div class="guest-card-name">' + escapeHtml(g.nama) + '</div>' +
          '<div class="guest-card-tags">' +
            '<span class="guest-cat-tag">' + escapeHtml(g.kategori || 'Teman') + '</span>' +
            dupTagHtml +
          '</div>' +
        '</div>' +
        '<div class="guest-card-checkin-status">' + checkinBadge + '</div>' +
      '</div>' +
      '<div class="guest-card-meta">' +
        '<span class="guest-wa-num">WA: ' + escapeHtml(g.wa || 'Tanpa Nomor') + '</span>' +
        '<div>' + waStatusBadge + '</div>' +
      '</div>' +
      '<div class="guest-card-actions">' +
        '<button type="button" class="btn-card-action btn-card-wa" onclick="handleGuestSent(\'' + safeId + '\', \'' + safeWa + '\', \'' + safeNama + '\', \'' + safeKat + '\')">' +
          '<svg class="svg-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
          '<span>Kirim WA</span>' +
        '</button>' +
        '<button type="button" class="btn-card-action btn-card-copy" onclick="copyGuestLink(\'' + safeNama + '\', \'' + safeKat + '\')">' +
          '<span>Salin Link</span>' +
        '</button>' +
        checkinActionBtn +
        deleteBtn +
      '</div>';

    container.appendChild(card);
  });
}

function addNewGuest() {
  var nama = document.getElementById('addGuestNama').value.trim();
  var wa = document.getElementById('addGuestWA').value.trim();
  var kat = document.getElementById('addGuestKategori').value;

  if (!nama) {
    showToast('Nama tamu tidak boleh kosong.');
    return;
  }

  var normNewWa = normalizeWaNumber(wa);
  if (normNewWa) {
    var existingMatches = (guestQueueList || []).filter(function(g) {
      return normalizeWaNumber(g.wa) === normNewWa;
    });
    if (existingMatches.length > 0) {
      var existingDesc = existingMatches.map(function(m) {
        return '"' + m.nama + '" (' + (m.kategori || 'Tamu') + ')';
      }).join(', ');

      pendingDuplicateGuestPayload = { nama: nama, wa: wa, kategori: kat };
      var msgEl = document.getElementById('duplicateWaMessage');
      var modal = document.getElementById('duplicateWaModal');
      if (msgEl) {
        msgEl.innerHTML =
          'Nomor WhatsApp <strong>' + escapeHtml(wa) + '</strong> sudah terdaftar di Buku Tamu atas nama:<br>' +
          '<span style="color:#92400E; font-weight:700;">' + escapeHtml(existingDesc) + '</span>.<br><br>' +
          'Apakah Anda yakin ingin tetap menambahkannya sebagai undangan terpisah?';
      }
      if (modal) modal.classList.add('show');
      return;
    }
  }

  executeSaveGuest({ nama: nama, wa: wa, kategori: kat });
}

function closeDuplicateWaModal() {
  var modal = document.getElementById('duplicateWaModal');
  if (modal) modal.classList.remove('show');
  pendingDuplicateGuestPayload = null;
}

function confirmProceedDuplicateGuest() {
  var payload = pendingDuplicateGuestPayload;
  closeDuplicateWaModal();
  if (payload) {
    executeSaveGuest(payload);
  }
}

function executeSaveGuest(guestPayload) {
  if (!guestPayload || !isGasApiConfigured()) return;
  showToast('Menambahkan tamu...');
  callGasApiPost('saveGuest', { guest: guestPayload, pin: currentAdminPin })
    .then(function(res) {
      if (res && res.status === 'success') {
        showToast('Tamu berhasil ditambahkan!');
        document.getElementById('addGuestNama').value = '';
        document.getElementById('addGuestWA').value = '';
        loadGuestList();
      } else {
        showToast((res && res.message) ? res.message : 'Gagal menambah tamu.');
      }
    })
    .catch(function(err) {
      showToast('Error: ' + err.message);
    });
}

// ==========================================================================
// 16B. PENGAMANAN DATA: CANCEL CHECK-IN, HAPUS SATUAN, HAPUS DEMO & RESET
// ==========================================================================
function openConfirmActionModal(title, bodyHtml, confirmBtnText, isDanger, actionObj) {
  pendingConfirmAction = actionObj;
  var titleEl = document.getElementById('confirmActionTitle');
  var bodyEl = document.getElementById('confirmActionBody');
  var btnExec = document.getElementById('btnExecuteConfirmAction');
  var modal = document.getElementById('confirmActionModal');

  if (titleEl) {
    titleEl.textContent = title;
    titleEl.style.color = isDanger ? '#991B1B' : 'var(--color-burgundy)';
  }
  if (bodyEl) bodyEl.innerHTML = bodyHtml;
  if (btnExec) {
    btnExec.textContent = confirmBtnText || 'Ya, Lanjutkan';
    btnExec.style.background = isDanger ? '#B91C1C' : 'linear-gradient(145deg, #60151E, #3D090F)';
  }
  if (modal) modal.classList.add('show');
}

function closeConfirmActionModal() {
  var modal = document.getElementById('confirmActionModal');
  if (modal) modal.classList.remove('show');
  pendingConfirmAction = null;
}

function openConfirmCancelCheckInModal(guestId, guestName) {
  openConfirmActionModal(
    'Batalkan Status Hadir?',
    'Tamu <strong>' + escapeHtml(guestName) + '</strong> saat ini tercatat <strong>Sudah Hadir</strong>.<br><br>Apakah Anda ingin membatalkan status kehadirannya kembali menjadi <strong>Belum Hadir</strong> (misal karena salah pencet / salah scan)?',
    'Ya, Batalkan Hadir',
    false,
    { type: 'cancel_checkin', id: guestId, nama: guestName }
  );
}

function openConfirmDeleteGuestModal(guestId, guestName, guestWa, isCheckedIn, isSent) {
  var extraWarn = '';
  if (isCheckedIn || isSent) {
    extraWarn =
      '<div style="background:#FEF2F2; border:1px solid #FCA5A5; color:#991B1B; padding:8px 10px; border-radius:7px; margin-top:8px; font-size:11px;">' +
      '<strong>⚠️ Perhatian Data Aktif:</strong> Tamu ini sudah berstatus <strong>' +
      (isCheckedIn ? 'Sudah Hadir di Lokasi' : 'Sudah Dikirim Undangan WA') +
      '</strong>. Pastikan Anda benar-benar ingin menghapusnya.' +
      '</div>';
  }

  openConfirmActionModal(
    'Hapus Data Tamu?',
    'Anda akan menghapus tamu <strong>' + escapeHtml(guestName) + '</strong> (WA: ' + escapeHtml(guestWa || '-') + ') secara permanen dari Buku Tamu.' + extraWarn,
    'Ya, Hapus Tamu',
    true,
    { type: 'delete_guest', id: guestId, nama: guestName }
  );
}

function openConfirmDeleteRSVPModal(rsvpId, rsvpName) {
  openConfirmActionModal(
    'Hapus Data RSVP?',
    'Anda akan menghapus data konfirmasi kehadiran & ucapan doa dari <strong>' + escapeHtml(rsvpName) + '</strong> secara permanen.',
    'Ya, Hapus RSVP',
    true,
    { type: 'delete_rsvp', id: rsvpId, nama: rsvpName }
  );
}

function openConfirmDeleteDemoModal() {
  openConfirmActionModal(
    '🧹 Hapus Data Demo Bawaan',
    'Sistem hanya akan menghapus baris contoh demo bawaan (seperti <em>Bapak Ahmad Fauzi</em>, <em>Sahabat &amp; Rekan Kerja</em>, <em>Siti Rahma</em>, dll).<br><br><strong>Seluruh data tamu asli klien Anda tetap aman 100% dan tidak akan tersentuh.</strong>',
    'Bersihkan Data Demo',
    false,
    { type: 'delete_demo' }
  );
}

function executePendingConfirmAction() {
  var action = pendingConfirmAction;
  if (!action || !isGasApiConfigured()) return;

  var btnExec = document.getElementById('btnExecuteConfirmAction');
  if (btnExec) {
    btnExec.disabled = true;
    btnExec.textContent = 'Memproses...';
  }

  function finishAction() {
    if (btnExec) {
      btnExec.disabled = false;
    }
    closeConfirmActionModal();
  }

  if (action.type === 'cancel_checkin') {
    callGasApiPost('cancelCheckInGuest', { guestId: action.id, pin: currentAdminPin })
      .then(function(res) {
        finishAction();
        if (res && res.status === 'success') {
          showToast(res.message || 'Status kehadiran berhasil dibatalkan.');
          loadGuestList();
        } else {
          showToast((res && res.message) ? res.message : 'Gagal membatalkan status hadir.');
        }
      })
      .catch(function(err) {
        finishAction();
        showToast('Error: ' + err.message);
      });
  } else if (action.type === 'delete_guest') {
    callGasApiPost('deleteSingleGuest', { guestId: action.id, pin: currentAdminPin })
      .then(function(res) {
        finishAction();
        if (res && res.status === 'success') {
          showToast(res.message || 'Data tamu berhasil dihapus.');
          loadGuestList();
        } else {
          showToast((res && res.message) ? res.message : 'Gagal menghapus tamu.');
        }
      })
      .catch(function(err) {
        finishAction();
        showToast('Error: ' + err.message);
      });
  } else if (action.type === 'delete_rsvp') {
    callGasApiPost('deleteSingleRSVP', { rsvpId: action.id, pin: currentAdminPin })
      .then(function(res) {
        finishAction();
        if (res && res.status === 'success') {
          showToast(res.message || 'Data RSVP berhasil dihapus.');
          loadRSVPFeedAndAnalytics();
        } else {
          showToast((res && res.message) ? res.message : 'Gagal menghapus RSVP.');
        }
      })
      .catch(function(err) {
        finishAction();
        showToast('Error: ' + err.message);
      });
  } else if (action.type === 'delete_demo') {
    callGasApiPost('deleteDemoDataOnly', { pin: currentAdminPin })
      .then(function(res) {
        finishAction();
        if (res && res.status === 'success') {
          showToast(res.message || 'Data demo berhasil dibersihkan.');
          loadGuestList();
          loadRSVPFeedAndAnalytics();
        } else {
          showToast((res && res.message) ? res.message : 'Gagal membersihkan data demo.');
        }
      })
      .catch(function(err) {
        finishAction();
        showToast('Error: ' + err.message);
      });
  }
}

function toggleResetZonePanel() {
  var body = document.getElementById('resetZoneBody');
  var chev = document.getElementById('resetZoneChevron');
  if (!body) return;
  var isHidden = (body.style.display === 'none' || !body.style.display);
  body.style.display = isHidden ? 'flex' : 'none';
  if (chev) chev.textContent = isHidden ? '▲' : '▼';
}

function openResetDataModal(scope) {
  pendingResetScope = scope || 'all';
  var warnEl = document.getElementById('resetDataWarningText');
  var inpKey = document.getElementById('inputResetKeyword');
  var modal = document.getElementById('resetDataModal');

  var labelTarget = 'SELURUH Daftar Tamu & Data RSVP';
  if (pendingResetScope === 'guests') labelTarget = 'SELURUH Daftar Tamu (Buku Tamu)';
  else if (pendingResetScope === 'rsvp') labelTarget = 'SELURUH Data Konfirmasi RSVP & Ucapan';

  if (warnEl) {
    warnEl.innerHTML =
      'Anda akan mengosongkan <strong>' + labelTarget + '</strong> secara permanen untuk persiapan klien baru.<br>' +
      'Data yang sudah dihapus tidak dapat dikembalikan.';
  }
  if (inpKey) inpKey.value = '';
  if (modal) modal.classList.add('show');
}

function closeResetDataModal() {
  var modal = document.getElementById('resetDataModal');
  if (modal) modal.classList.remove('show');
}

function executeResetClientData() {
  var inpKey = document.getElementById('inputResetKeyword');
  var keyword = inpKey ? inpKey.value.trim().toUpperCase() : '';

  if (keyword !== 'HAPUS') {
    showToast('Ketik kata kunci HAPUS dengan huruf kapital untuk konfirmasi.');
    if (inpKey) inpKey.focus();
    return;
  }

  if (!isGasApiConfigured()) return;

  var btnExec = document.getElementById('btnExecuteResetData');
  if (btnExec) {
    btnExec.disabled = true;
    btnExec.textContent = 'Mengosongkan...';
  }

  callGasApiPost('resetAllClientData', {
    scope: pendingResetScope,
    keyword: keyword,
    pin: currentAdminPin
  })
    .then(function(res) {
      if (btnExec) {
        btnExec.disabled = false;
        btnExec.textContent = 'Kosongkan Data';
      }
      if (res && res.status === 'success') {
        closeResetDataModal();
        showToast(res.message || 'Data berhasil dikosongkan!');
        loadGuestList();
        loadRSVPFeedAndAnalytics();
      } else {
        showToast((res && res.message) ? res.message : 'Gagal mengosongkan data.');
      }
    })
    .catch(function(err) {
      if (btnExec) {
        btnExec.disabled = false;
        btnExec.textContent = 'Kosongkan Data';
      }
      showToast('Error: ' + err.message);
    });
}

function handleGuestSent(guestId, phone, guestName, category) {
  var appUrl = getEffectiveAppUrl();
  var guestLink = appUrl + '?to=' + encodeURIComponent(guestName) + (category ? '&cat=' + encodeURIComponent(category) : '');
  var waText = buildProfessionalWaMessage(guestName, guestLink);

  var cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);

  var waUrl = cleanPhone
    ? 'https://api.whatsapp.com/send?phone=' + cleanPhone + '&text=' + encodeURIComponent(waText)
    : 'https://api.whatsapp.com/send?text=' + encodeURIComponent(waText);

  window.open(waUrl, '_blank');

  if (isGasApiConfigured()) {
    callGasApiPost('updateGuestStatus', {
      guestId: guestId,
      newStatus: 'Sudah Dikirim',
      pin: currentAdminPin
    }).then(function() {
      loadGuestList();
    });
  }
}

function copyGuestLink(guestName, category) {
  var appUrl = getEffectiveAppUrl();
  var link = appUrl + '?to=' + encodeURIComponent(guestName) + '&cat=' + encodeURIComponent(category || 'Tamu');
  copyToClipboard(link, 'Tautan Tamu ' + guestName);
}

function toggleGuestInputMode(mode) {
  var fSingle = document.getElementById('formGuestSingle');
  var fBulk = document.getElementById('formGuestBulk');
  var bSingle = document.getElementById('btnModeSingle');
  var bBulk = document.getElementById('btnModeBulk');

  if (mode === 'bulk') {
    if (fSingle) fSingle.style.display = 'none';
    if (fBulk) fBulk.style.display = 'block';
    if (bSingle) bSingle.classList.remove('active');
    if (bBulk) bBulk.classList.add('active');
  } else {
    if (fSingle) fSingle.style.display = 'block';
    if (fBulk) fBulk.style.display = 'none';
    if (bSingle) bSingle.classList.add('active');
    if (bBulk) bBulk.classList.remove('active');
  }
}

function handleCsvFileSelected(input) {
  var file = input.files && input.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function(e) {
    var content = e.target.result;
    document.getElementById('bulkPasteInput').value = content;
    handlePasteInputChanged();
  };
  reader.readAsText(file);
}

function handlePasteInputChanged() {
  var text = document.getElementById('bulkPasteInput').value;
  parsedBulkGuests = parseCsvOrTsv(text);
  renderBulkPreview(parsedBulkGuests);
}

function parseCsvOrTsv(text) {
  if (!text || !text.trim()) return [];
  var cleanText = text.replace(/^\uFEFF/, '');
  var lines = cleanText.split(/\r\n|\n|\r/);
  var results = [];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;

    var delimiter = '\t';
    if (line.indexOf('\t') !== -1) delimiter = '\t';
    else if (line.indexOf(';') !== -1) delimiter = ';';
    else if (line.indexOf(',') !== -1) delimiter = ',';

    var cols = line.split(delimiter);
    var col1 = cols[0] ? cols[0].replace(/^["']|["']$/g, '').trim() : '';
    var col2 = cols[1] ? cols[1].replace(/^["']|["']$/g, '').trim() : '';
    var col3 = cols[2] ? cols[2].replace(/^["']|["']$/g, '').trim() : 'Teman';

    if (i === 0 && (col1.toLowerCase() === 'nama' || col1.toLowerCase() === 'nama_tamu' || col1.toLowerCase() === 'name')) {
      continue;
    }

    if (col1) {
      results.push({
        nama: col1,
        wa: col2,
        kategori: col3 || 'Teman'
      });
    }
  }
  return results;
}

function renderBulkPreview(guests) {
  var container = document.getElementById('bulkPreviewContainer');
  var tbody = document.getElementById('bulkPreviewTableBody');
  var notice = document.getElementById('bulkStatusNotice');
  var dupBox = document.getElementById('bulkDuplicateWarningBox');
  var dupText = document.getElementById('bulkDuplicateWarningText');
  if (!container || !tbody) return;

  if (!guests || guests.length === 0) {
    container.style.display = 'none';
    if (notice) notice.style.display = 'none';
    if (dupBox) dupBox.style.display = 'none';
    return;
  }

  var existingWaSet = {};
  (guestQueueList || []).forEach(function(g) {
    var nw = normalizeWaNumber(g.wa);
    if (nw) existingWaSet[nw] = true;
  });

  var seenInBatch = {};
  var dupCount = 0;

  guests.forEach(function(g) {
    var nw = normalizeWaNumber(g.wa);
    if (nw && (existingWaSet[nw] || seenInBatch[nw])) {
      g._isDup = true;
      dupCount++;
    } else {
      g._isDup = false;
      if (nw) seenInBatch[nw] = true;
    }
  });

  if (dupBox && dupText) {
    if (dupCount > 0) {
      dupBox.style.display = 'block';
      dupText.textContent = '⚠️ Ditemukan ' + dupCount + ' baris dengan nomor WhatsApp yang sudah terdaftar / kembar.';
    } else {
      dupBox.style.display = 'none';
    }
  }

  container.style.display = 'block';
  tbody.innerHTML = '';

  guests.slice(0, 10).forEach(function(g) {
    var tr = document.createElement('tr');
    if (g._isDup) tr.className = 'is-dup-row';
    tr.innerHTML =
      '<td>' + escapeHtml(g.nama) + (g._isDup ? ' <strong>(⚠️ WA Ganda)</strong>' : '') + '</td>' +
      '<td>' + escapeHtml(g.wa || '-') + '</td>' +
      '<td>' + escapeHtml(g.kategori || 'Teman') + '</td>';
    tbody.appendChild(tr);
  });

  if (notice) {
    notice.style.display = 'block';
    notice.textContent = 'Terdeteksi ' + guests.length + ' baris tamu siap diimpor ke Google Sheets.';
  }
}

function processBulkGuests() {
  if (!parsedBulkGuests || parsedBulkGuests.length === 0) {
    showToast('Tidak ada data tamu yang valid untuk diimpor.');
    return;
  }

  var chkSkip = document.getElementById('chkSkipBulkDuplicates');
  var shouldSkipDup = chkSkip ? chkSkip.checked : true;
  var listToImport = shouldSkipDup
    ? parsedBulkGuests.filter(function(g) { return !g._isDup; })
    : parsedBulkGuests;

  if (listToImport.length === 0) {
    showToast('Semua baris pada file ini memiliki nomor WA ganda. Tidak ada data baru yang diimpor.');
    return;
  }

  if (!isGasApiConfigured()) return;

  var btn = document.getElementById('btnProcessBulk');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Menyimpan ' + listToImport.length + ' Tamu...';
  }

  callGasApiPost('importGuestsBatch', { guests: listToImport, pin: currentAdminPin })
    .then(function(res) {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Simpan Semua Tamu ke Database';
      }
      if (res && res.status === 'success') {
        showToast('Berhasil mengimpor ' + res.count + ' tamu!');
        clearBulkInputs();
        toggleGuestInputMode('single');
        loadGuestList();
      } else {
        showToast((res && res.message) ? res.message : 'Gagal menyimpan batch.');
      }
    })
    .catch(function(err) {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Simpan Semua Tamu ke Database';
      }
      showToast('Error impor: ' + err.message);
    });
}

function downloadCsvTemplate() {
  var csvContent = "Nama Tamu;Nomor WhatsApp;Kategori\n" +
                   "Bapak Ahmad Fauzi & Keluarga;081234567890;VIP\n" +
                   "Sahabat & Alumni Kampus;081398765432;Teman\n" +
                   "Rekan Kerja Kantor;085712345678;Rekan Kerja\n";
  var blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  var link = document.createElement("a");
  var url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "Template_Tamu_Undangan_Excel.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function clearBulkInputs() {
  var inpFile = document.getElementById('bulkCsvFile');
  var inpPaste = document.getElementById('bulkPasteInput');
  if (inpFile) inpFile.value = '';
  if (inpPaste) inpPaste.value = '';
  parsedBulkGuests = [];
  renderBulkPreview([]);
  showToast('Kotak tempelan kolom berhasil dibersihkan.');
}

function openQueueSenderModal() {
  if (!guestQueueList || guestQueueList.length === 0) {
    showToast('Daftar tamu kosong. Tambahkan tamu terlebih dahulu.');
    return;
  }
  currentQueueIndex = 0;
  var modal = document.getElementById('queueModal');
  if (modal) modal.classList.add('show');
  renderCurrentQueueItem();
}

function closeQueueModal() {
  var modal = document.getElementById('queueModal');
  if (!modal) return;
  modal.classList.remove('show');
}

function renderCurrentQueueItem() {
  if (currentQueueIndex >= guestQueueList.length) {
    showToast('Semua tamu dalam antrean telah selesai!');
    closeQueueModal();
    return;
  }

  var g = guestQueueList[currentQueueIndex];
  var counter = document.getElementById('queueCounterText');
  var elName = document.getElementById('queueGuestName');
  var elMeta = document.getElementById('queueGuestMeta');
  var elLink = document.getElementById('queuePreviewLink');

  if (counter) counter.textContent = 'Tamu ' + (currentQueueIndex + 1) + ' dari ' + guestQueueList.length;
  if (elName) elName.textContent = g.nama;
  if (elMeta) elMeta.textContent = (g.wa || 'Tanpa Nomor') + ' • ' + (g.kategori || 'Tamu');

  var appUrl = getEffectiveAppUrl();
  if (elLink) elLink.textContent = appUrl + '?to=' + encodeURIComponent(g.nama);
}

function sendAndNextQueue() {
  if (currentQueueIndex >= guestQueueList.length) return;
  var g = guestQueueList[currentQueueIndex];
  handleGuestSent(g.id, g.wa, g.nama, g.kategori);
  currentQueueIndex++;
  renderCurrentQueueItem();
}

function skipQueueGuest() {
  currentQueueIndex++;
  renderCurrentQueueItem();
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================================================
// 17. INISIALISASI SAAT HALAMAN SELESAI DIMUAT (DOM READY)
// ==========================================================================
document.addEventListener('DOMContentLoaded', function() {
  initSavedPhotoTransformsFromDOM();
  initPetalAnimation();
  initGuestFromUrl();
  initCountdown();
  initScrollReveal();
  initCanvasDragInteractions();
  loadInitialAppData();

  var secretTapTarget = document.getElementById('secretFooterTap');
  var tapCount = 0;
  var tapTimer = null;

  if (secretTapTarget) {
    function handleFooterTap() {
      tapCount++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(function() {
        tapCount = 0;
      }, 1200);

      if (tapCount >= 3) {
        tapCount = 0;
        openStudioPasscodeBar();
      }
    }

    secretTapTarget.addEventListener('click', handleFooterTap);
    secretTapTarget.addEventListener('touchend', function() {
      handleFooterTap();
    }, { passive: true });
  }

  try {
    var params = new URLSearchParams(window.location.search);
    if (params.get('admin') === '1') {
      setTimeout(function() {
        openStudioPasscodeBar();
      }, 400);
    }
  } catch (e) {}

  // Inisialisasi elemen DOM setelah halaman ter-load sepenuhnya
  coverOverlay = document.getElementById('coverOverlay');
  weddingAudio = document.getElementById('weddingAudio');
  floatingPlayer = document.getElementById('floatingPlayer');
  vinylDisc = document.getElementById('vinylDisc');
  audioStatusText = document.getElementById('audioStatusText');
  btnOpen = document.getElementById('btnOpenInvitation');
  btnWaxSeal = document.getElementById('btnWaxSeal');

  if (btnOpen) {
    btnOpen.addEventListener('click', openEnvelope);
  }
  if (btnWaxSeal) {
    btnWaxSeal.addEventListener('click', openEnvelope);
  }
  if (floatingPlayer) {
    floatingPlayer.addEventListener('click', function() {
      toggleAudio();
    });
  }
});
