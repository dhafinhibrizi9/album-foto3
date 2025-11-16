// Data folder dan foto (disimpan di localStorage)
        let galleryData = JSON.parse(localStorage.getItem('galleryData')) || {
            "Liburan": { photos: [] },
            "Keluarga": { photos: [] },
            "Alam": { photos: [] },
            "Perjalanan": { photos: [] },
            "Acara Khusus": { photos: [] },
            "Lainnya": { photos: [] }
        };

        // Elemen DOM
        const folderContainer = document.getElementById('folderContainer');
        const galleryContainer = document.getElementById('galleryContainer');
        const photoGrid = document.getElementById('photoGrid');
        const galleryTitle = document.getElementById('galleryTitle');
        const backButton = document.getElementById('backButton');
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightboxImg');
        const lightboxTitle = document.getElementById('lightboxTitle');
        const closeLightbox = document.getElementById('closeLightbox');
        const prevButton = document.getElementById('prevButton');
        const nextButton = document.getElementById('nextButton');
        const fileInput = document.getElementById('fileInput');
        const photoTitle = document.getElementById('photoTitle');
        const folderSelect = document.getElementById('folderSelect');
        const uploadButton = document.getElementById('uploadButton');

        // State aplikasi
        let currentFolder = '';
        let currentPhotoIndex = 0;
        let currentPhotos = [];

        // Generate folder
        function generateFolders() {
            folderContainer.innerHTML = '';
            for (const folderName in galleryData) {
                const folder = document.createElement('div');
                folder.className = 'folder';
                const photoCount = galleryData[folderName].photos.length;
                
                folder.innerHTML = `
                    <div class="folder-icon">📁</div>
                    <div class="folder-name">${folderName}</div>
                    ${photoCount > 0 ? `<div class="folder-count">${photoCount}</div>` : ''}
                `;
                
                folder.addEventListener('click', () => openFolder(folderName, folder));
                folderContainer.appendChild(folder);
            }
        }

        // Buka folder
        function openFolder(folderName, folderElement) {
            // Reset semua folder
            document.querySelectorAll('.folder').forEach(f => f.classList.remove('active-folder'));
            
            // Tandai folder aktif
            if (folderElement) folderElement.classList.add('active-folder');
            
            currentFolder = folderName;
            currentPhotos = galleryData[folderName].photos;
            
            // Update judul galeri
            galleryTitle.textContent = folderName;
            
            // Kosongkan grid foto
            photoGrid.innerHTML = '';
            
            // Cek apakah folder kosong
            if (currentPhotos.length === 0) {
                photoGrid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <p>Belum ada foto di album "${folderName}"</p>
                        <p>Gunakan form di atas untuk mengunggah foto pertama Anda!</p>
                    </div>
                `;
            } else {
                // Generate foto
                currentPhotos.forEach((photo, index) => {
                    const photoItem = document.createElement('div');
                    photoItem.className = 'photo-item';
                    photoItem.innerHTML = `
                        <img src="${photo.url}" alt="${photo.title}" loading="lazy">
                        <div class="photo-overlay">
                            <div class="photo-title">${photo.title}</div>
                            <div class="photo-date">${photo.date}</div>
                        </div>
                        <button class="delete-photo" data-index="${index}">×</button>
                    `;
                    
                    photoItem.addEventListener('click', (e) => {
                        if (!e.target.classList.contains('delete-photo')) {
                            openLightbox(index);
                        }
                    });
                    
                    // Event untuk tombol hapus
                    const deleteBtn = photoItem.querySelector('.delete-photo');
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        deletePhoto(index);
                    });
                    
                    photoGrid.appendChild(photoItem);
                });
            }
            
            // Tampilkan galeri dan sembunyikan folder
            document.querySelector('.folder-section').style.display = 'none';
            galleryContainer.style.display = 'block';
        }

        // Kembali ke folder
        backButton.addEventListener('click', () => {
            galleryContainer.style.display = 'none';
            document.querySelector('.folder-section').style.display = 'block';
        });

        // Buka lightbox
        function openLightbox(index) {
            currentPhotoIndex = index;
            updateLightbox();
            lightbox.style.display = 'flex';
        }

        // Update lightbox
        function updateLightbox() {
            const photo = currentPhotos[currentPhotoIndex];
            lightboxImg.src = photo.url;
            lightboxTitle.textContent = photo.title;
        }

        // Tutup lightbox
        closeLightbox.addEventListener('click', () => {
            lightbox.style.display = 'none';
        });

        // Navigasi foto di lightbox
        prevButton.addEventListener('click', () => {
            currentPhotoIndex = (currentPhotoIndex - 1 + currentPhotos.length) % currentPhotos.length;
            updateLightbox();
        });

        nextButton.addEventListener('click', () => {
            currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotos.length;
            updateLightbox();
        });

        // Tutup lightbox dengan klik di luar gambar
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
            }
        });

        // Navigasi dengan keyboard
        document.addEventListener('keydown', (e) => {
            if (lightbox.style.display === 'flex') {
                if (e.key === 'ArrowLeft') {
                    currentPhotoIndex = (currentPhotoIndex - 1 + currentPhotos.length) % currentPhotos.length;
                    updateLightbox();
                } else if (e.key === 'ArrowRight') {
                    currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotos.length;
                    updateLightbox();
                } else if (e.key === 'Escape') {
                    lightbox.style.display = 'none';
                }
            }
        });

        // Upload foto
        uploadButton.addEventListener('click', () => {
            const files = fileInput.files;
            const title = photoTitle.value || 'Foto Baru';
            const folder = folderSelect.value;
            
            if (!folder) {
                alert('Pilih folder terlebih dahulu!');
                return;
            }
            
            if (files.length === 0) {
                alert('Pilih foto terlebih dahulu!');
                return;
            }
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Validasi tipe file
                if (!file.type.match('image.*')) {
                    alert(`File "${file.name}" bukan gambar. Hanya file gambar yang diizinkan.`);
                    continue;
                }
                
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const newPhoto = {
                        id: Date.now() + i, // ID unik berdasarkan timestamp
                        title: files.length === 1 ? title : `${title} ${i + 1}`,
                        date: new Date().toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        }),
                        url: e.target.result
                    };
                    
                    galleryData[folder].photos.push(newPhoto);
                    
                    // Simpan ke localStorage
                    saveToLocalStorage();
                    
                    // Refresh tampilan folder
                    generateFolders();
                    
                    // Jika folder yang diupload sedang terbuka, refresh tampilan
                    if (currentFolder === folder) {
                        openFolder(folder);
                    }
                };
                
                reader.onerror = function() {
                    alert(`Gagal membaca file "${file.name}".`);
                };
                
                reader.readAsDataURL(file);
            }
            
            // Reset form
            fileInput.value = '';
            photoTitle.value = '';
            folderSelect.value = '';
            
            if (files.length > 0) {
                alert(`Berhasil mengunggah ${files.length} foto!`);
            }
        });

        // Hapus foto
        function deletePhoto(index) {
            if (confirm('Apakah Anda yakin ingin menghapus foto ini?')) {
                galleryData[currentFolder].photos.splice(index, 1);
                saveToLocalStorage();
                generateFolders(); // Refresh folder count
                openFolder(currentFolder); // Refresh gallery
            }
        }

        // Simpan data ke localStorage
        function saveToLocalStorage() {
            localStorage.setItem('galleryData', JSON.stringify(galleryData));
        }

        // Inisialisasi
        generateFolders();