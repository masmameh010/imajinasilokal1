// --- BAGIAN KONFIGURASI PASSWORD ---
// PENTING: Ganti password untuk setiap tool di sini.
// Key (misal, 'prompt-fashion-wanita.html') harus cocok dengan nilai 'data-target-page' pada link di index.html
const toolPasswords = {
  'prompt-fashion-wanita.html': 'wanitakreatif',
  'prompt-fashion-pria.html': 'priamodern',
  'ai-prompt-generator-template.html': 'templatecanggih',
  'copy-prompt-gallery': 'salinprompt' // Password khusus untuk menyalin prompt dari galeri
};
// -------------------------------------


// --- Elemen-elemen DOM ---
const mobileMenu = document.querySelector('.mobile-menu');
const navMenu = document.querySelector('nav ul');
const header = document.querySelector('header');

// --- Elemen Modal Prompt ---
const promptModal = document.getElementById("promptModal");
const modalPromptText = document.getElementById("modalPromptText");
const copyPromptButton = document.getElementById("copyPromptButton");
const modalCloseButton = document.getElementById("modalCloseButton");
const copyFeedback = document.getElementById("copy-feedback");

// --- Elemen Modal Password ---
const passwordModal = document.getElementById("passwordModal");
const passwordModalCloseButton = document.getElementById("passwordModalCloseButton");
const passwordModalMessage = document.getElementById("passwordModalMessage");
const passwordInput = document.getElementById("passwordInput");
const submitPasswordButton = document.getElementById("submitPasswordButton");
const passwordError = document.getElementById("passwordError");

// --- Variabel untuk Menyimpan Konteks Aksi yang Tertunda ---
// Ini akan menyimpan target (tool mana yang diklik) dan aksi apa yang harus dilakukan setelah password benar
let passwordContext = {
    target: null,
    onSuccess: null
};


// --- FUNGSI UTAMA UNTUK PASSWORD ---

/**
 * Meminta password dengan menampilkan modal.
 * @param {string} targetIdentifier - Kunci unik untuk tool yang diproteksi (misal, nama file atau 'copy-prompt-gallery').
 * @param {string} toolName - Nama tool yang akan ditampilkan di pesan modal.
 * @param {function} onSuccessCallback - Fungsi yang akan dijalankan jika password benar.
 */
function requestPassword(targetIdentifier, toolName, onSuccessCallback) {
    if (passwordModal && passwordInput && passwordError && passwordModalMessage) {
        // Menyimpan konteks
        passwordContext.target = targetIdentifier;
        passwordContext.onSuccess = onSuccessCallback;

        // Reset dan tampilkan modal
        passwordModalMessage.textContent = `Fitur "${toolName}" dilindungi. Masukkan password untuk melanjutkan.`;
        passwordInput.value = "";
        passwordError.style.display = 'none';
        passwordModal.style.display = "block";
        passwordInput.focus();
    } else {
        console.error("Elemen modal password tidak ditemukan. Pastikan HTML modal password ada di halaman.");
        alert("Komponen password tidak ditemukan. Tidak bisa melanjutkan.");
    }
}

// Fungsi untuk menangani submit password
if (submitPasswordButton && passwordModal && passwordInput && passwordError) {
    const handlePasswordSubmit = () => {
        const enteredPassword = passwordInput.value;
        const correctPassword = toolPasswords[passwordContext.target]; // Dapatkan password yang benar berdasarkan target

        if (enteredPassword === correctPassword) {
            passwordModal.style.display = "none";
            if (typeof passwordContext.onSuccess === 'function') {
                passwordContext.onSuccess();
            }
            // Reset konteks setelah berhasil
            passwordContext.target = null;
            passwordContext.onSuccess = null;
        } else {
            passwordError.textContent = "Password salah. Silakan coba lagi.";
            passwordError.style.display = 'block';
        }
    };

    submitPasswordButton.addEventListener('click', handlePasswordSubmit);
    passwordInput.addEventListener('keyup', (event) => {
        if (event.key === "Enter") {
            handlePasswordSubmit();
        }
    });
}

// Fungsi untuk menutup modal password
if (passwordModalCloseButton && passwordModal) {
    passwordModalCloseButton.onclick = function() {
        passwordModal.style.display = "none";
        // Reset konteks jika modal ditutup
        passwordContext.target = null;
        passwordContext.onSuccess = null;
    }
}


// --- FUNGSI NAVIGASI DAN LAINNYA ---

// Mobile Menu Toggle
if (mobileMenu && navMenu) {
    mobileMenu.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileMenu.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
    });
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#') && href.length > 1) {
            e.preventDefault();
            const targetId = href;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                let headerOffset = 0;
                if (header && getComputedStyle(header).position === 'fixed') {
                    headerOffset = header.offsetHeight;
                }
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                if (navMenu && navMenu.classList.contains('active') && this.closest('nav')) {
                    navMenu.classList.remove('active');
                    if (mobileMenu) {
                        const menuIcon = mobileMenu.querySelector('i');
                        if (menuIcon) {
                            menuIcon.classList.remove('fa-times');
                            menuIcon.classList.add('fa-bars');
                        }
                    }
                }
            }
        } else if (href === '#') {
            e.preventDefault();
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    if (header) {
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'var(--shadow)';
        }
    }
});

// Update tahun di copyright footer secara dinamis
const currentYearEl = document.getElementById("currentYear");
if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
}

// --- LOGIKA PROTEKSI KONTEN DENGAN PASSWORD BERBEDA ---

// 1. Proteksi untuk link Tools
document.querySelectorAll('.protected-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetPage = this.dataset.targetPage;
        const toolItem = this.closest('.ai-tool-item');
        const toolName = toolItem ? toolItem.querySelector('h3').textContent : 'Fitur';

        if (targetPage) {
            requestPassword(targetPage, toolName, () => {
                window.location.href = targetPage;
            });
        }
    });
});


// 2. Menampilkan Modal Prompt dari Galeri (TANPA password saat klik gambar)
document.querySelectorAll(".galeri-item-card").forEach(card => {
    card.addEventListener("click", function() {
        const promptText = this.dataset.prompt;
        if (promptText && promptModal && modalPromptText && copyFeedback) {
            modalPromptText.textContent = promptText;
            promptModal.style.display = "block";
            copyFeedback.textContent = ""; // Reset feedback jika ada
        }
    });
});

// --- Fungsionalitas Modal Prompt ---
if (modalCloseButton && promptModal) {
    modalCloseButton.onclick = function() {
        promptModal.style.display = "none";
    }
}

// Menutup modal jika klik di luar area konten
window.onclick = function(event) {
    if (promptModal && event.target == promptModal) {
        promptModal.style.display = "none";
    }
    if (passwordModal && event.target == passwordModal) {
        passwordModal.style.display = "none";
        // Reset konteks jika modal ditutup
        passwordContext.target = null;
        passwordContext.onSuccess = null;
    }
}

// Tombol Salin Prompt di Modal Prompt Galeri (DENGAN PROTEKSI PASSWORD KHUSUS)
if (copyPromptButton && modalPromptText && copyFeedback) {
    copyPromptButton.addEventListener("click", function() {
        const textToCopy = modalPromptText.textContent;
        if (!textToCopy) return;

        // Minta password SEBELUM menyalin, menggunakan identifier 'copy-prompt-gallery'
        requestPassword('copy-prompt-gallery', 'Salin Prompt', () => {
            try {
                const textArea = document.createElement("textarea");
                textArea.value = textToCopy;
                textArea.style.position = "fixed"; // Mencegah scroll
                textArea.style.top = "-9999px";
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                copyFeedback.textContent = "Prompt disalin!";
            } catch (err) {
                console.error('Gagal menyalin teks: ', err);
                copyFeedback.textContent = "Gagal menyalin.";
            }
            setTimeout(() => {
                if (copyFeedback) copyFeedback.textContent = "";
            }, 2000);
        });
    });
}
