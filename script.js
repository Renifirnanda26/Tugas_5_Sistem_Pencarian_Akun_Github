const githubForm = document.querySelector('#github-form');
const usernameInput = document.querySelector('#username-input');
const profileContainer = document.querySelector('#profile-container');
const loading = document.querySelector('#loading');

// Array untuk menyimpan riwayat pencarian. Nanti soalnya ada list user yang dicari (riwayatnya)
let searchHistory = [];

// Membuat elemen penampung riwayat secara dinamis, karna tidak diletakkan di html. jadi konsepna itu data riwayatnya sesuai yang dimasukkan user
const historyContainer = document.createElement('div');
historyContainer.className = 'history-container';
historyContainer.style.display = 'none'; // Disembunyikan di awal, tidak menampilkan langsung di halaman profil yang dicari

const historyTitle = document.createElement('h4');
historyTitle.textContent = 'Riwayat Pencarian:';

const historyList = document.createElement('ul');
historyList.id = 'history-list';

// Button Hapus Semua Riwayat 
const btnClearAll = document.createElement('button');
btnClearAll.textContent = 'Hapus Semua Riwayat';
btnClearAll.style.marginTop = '15px';
btnClearAll.addEventListener('click', () => {
    searchHistory = [];
    renderHistory();
    historyContainer.style.display = 'none'; // Sembunyikan jika sudah kosong, nanti akan dihpus dari tampilan webnya
});

// Susun elemen ke dalam container riwayat
historyContainer.append(historyTitle, historyList, btnClearAll);
githubForm.after(historyContainer);

// Fungsi untuk merender ulang daftar riwayat
const renderHistory = () => {
    historyList.innerHTML = '';

    if (searchHistory.length === 0) {
        historyContainer.style.display = 'none';
        return;
    }

    searchHistory.forEach((username, index) => {
        const li = document.createElement('li');
        li.className = 'history-item';

        const span = document.createElement('span');
        span.textContent = username;
        span.addEventListener('click', () => {
            usernameInput.value = username;
            loadGitHubUser(username);
        });

        // Tombol hapus sebelahnya nama riwayat, jadi hapusnya per item bukan langsung semua
        const btnRemove = document.createElement('button');
        btnRemove.textContent = 'Hapus';
        btnRemove.addEventListener('click', () => {
            searchHistory.splice(index, 1);
            renderHistory();
        });

        li.append(span, btnRemove);
        historyList.appendChild(li);
    });
};

// Fungsi utama mengambil data GitHub
const loadGitHubUser = async (username) => {
    try {
        profileContainer.innerHTML = '';
        loading.style.display = 'block';
        historyContainer.style.display = 'none'; // kan tadi ada perintah tampilkan riwayat, nah disini tuh fungsinya menyimpan nama user yang dicari, lalu nanti kemudian ditampilkan diakhir bersama list yang lain

        // Tetap di masukkan ke riwayat pencarian terlebih dahulu (meskipun nanti error/tidak ditemukan)
        if (!searchHistory.includes(username)) { //sebenernya disini saya gak mau masukin nama riwayat yang kosong, biar lebih clear, tapi kayaknya saya riset dibeberapa apk/web riwayatnya, lengkap, baik data eror atau sukses.
            searchHistory.unshift(username);
        }

        const response = await fetch(`https://api.github.com/users/${username}`);

        if (response.status === 404) {
            throw new Error('User tidak ditemukan');
        }

        if (!response.ok) {
            throw new Error("HTTP Error! Status: " + response.status);
        }

        const user = await response.json();

        // Membuat card profil jika berhasil
        const card = document.createElement("div");
        card.className = "profile-card";
        
        const img = document.createElement("img");
        img.src = user.avatar_url;
        img.alt = "Avatar";
        img.width = 100;

        const h3 = document.createElement("h3");
        h3.textContent = user.name || 'Nama tidak tersedia';

        const pBio = document.createElement("p");
        pBio.textContent = "Bio: " + (user.bio || 'Tidak ada bio');

        const pRepos = document.createElement("p");
        pRepos.textContent = "Jumlah Repositori Publik: " + user.public_repos;

        const aLink = document.createElement("a");
        aLink.href = user.html_url;
        aLink.target = "_blank";
        aLink.textContent = "Lihat Profil GitHub";

        // Tombol Tutup Profil
        const btnCloseCard = document.createElement("button");
        btnCloseCard.textContent = "Tutup Profil";
        btnCloseCard.style.display = "block";
        btnCloseCard.style.marginTop = "15px auto 0 auto";
        btnCloseCard.addEventListener('click', () => {
            card.remove(); // Hapus profil dari layar, biar tampilannya bersih, gak menggangu fokus jika nanti ada pencarian yang baru
            renderHistory(); // memperbarui data riwayat
            if (searchHistory.length > 0) {
                historyContainer.style.display = 'block'; // Tampilkan riwayat setelah ditutup, Nah disi baru riwayat yang tadi disimpan dikeluarkan.
            }
        });

        card.append(img, h3, pBio, pRepos, aLink, btnCloseCard);
        profileContainer.appendChild(card);

    } catch (error) {
        console.error("Gagal mengambil data pengguna:", error);
        profileContainer.innerHTML = `<p class="error">Gagal memuat data: ${error.message}</p>`;
    } finally {
        loading.style.display = 'none';
    }
};

// Event listener form submit
githubForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    if (!username) return;

    loadGitHubUser(username);
    usernameInput.value = '';
});