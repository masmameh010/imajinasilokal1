// --- BAGIAN KONFIGURASI PASSWORD ---
// PENTING: Ganti password ini dengan password yang Anda inginkan.
const PROTECTED_CONTENT_PASSWORD = "Bananakost@0000"; // Password Anda

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
const passwordInput = document.getElementById("passwordInput");
const submitPasswordButton = document.getElementById("submitPasswordButton");
const passwordError = document.getElementById("passwordError");

// --- Variabel untuk Menyimpan Aksi Setelah Password Benar ---
let pendingAction = null;


// --- FUNGSI UTAMA UNTUK PASSWORD ---

// Fungsi untuk meminta password
function requestPassword(onSuccessCallback) {
    if (passwordModal && passwordInput && passwordError) {
        pendingAction = onSuccessCallback;
        passwordInput.value = ""; 
        passwordError.style.display = 'none'; 
        passwordModal.style.display = "block"; 
        passwordInput.focus();
    } else {
        console.error("Elemen modal password tidak ditemukan. Pastikan HTML modal password ada di halaman.");
        // Jika modal password tidak ada, langsung jalankan aksi (atau beri error, tergantung kebutuhan)
        if (typeof onSuccessCallback === 'function') {
            //  onSuccessCallback(); // Hati-hati: ini akan bypass password jika modal tidak ada.
            alert("Komponen password tidak ditemukan. Tidak bisa melanjutkan.");
        }
    }
}

// Fungsi untuk menangani submit password
if (submitPasswordButton && passwordModal && passwordInput && passwordError) {
    submitPasswordButton.addEventListener('click', () => {
        if (passwordInput.value === PROTECTED_CONTENT_PASSWORD) {
            passwordModal.style.display = "none";
            if (typeof pendingAction === 'function') {
                pendingAction(); 
            }
            pendingAction = null; 
        } else {
            passwordError.textContent = "Password salah. Silakan coba lagi.";
            passwordError.style.display = 'block';
        }
    });
    passwordInput.addEventListener('keyup', (event) => {
        if (event.key === "Enter") {
            submitPasswordButton.click();
        }
    });
}

// Fungsi untuk menutup modal password
if (passwordModalCloseButton && passwordModal) {
    passwordModalCloseButton.onclick = function() {
        passwordModal.style.display = "none";
        pendingAction = null; 
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
                if(header && getComputedStyle(header).position === 'fixed') {
                   headerOffset = header.offsetHeight; 
                }
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
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

// --- LOGIKA PROTEKSI KONTEN ---

// 1. Proteksi untuk link Tools (tetap sama)
document.querySelectorAll('.protected-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault(); 
        const targetPage = this.dataset.targetPage;
        if (targetPage) {
            requestPassword(() => {
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
        pendingAction = null; 
    }
}

// Tombol Salin Prompt di Modal Prompt (DENGAN PROTEKSI PASSWORD)
if (copyPromptButton && modalPromptText && copyFeedback) {
    copyPromptButton.addEventListener("click", function() {
        const textToCopy = modalPromptText.textContent;
        if (!textToCopy) return;

        // Minta password SEBELUM menyalin
        requestPassword(() => {
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
            setTimeout(() => { copyFeedback.textContent = ""; }, 2000); 
        });
    });
}
