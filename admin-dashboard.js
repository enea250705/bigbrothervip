// Check authentication
window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const loginTime = parseInt(localStorage.getItem('adminLoginTime') || '0');
    const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    
    if (!isLoggedIn || (Date.now() - loginTime > sessionTimeout)) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        window.location.href = 'admin.html';
        return;
    }
    
    initDashboard();
});

// Initialize dashboard
function initDashboard() {
    // Tab switching
    const tabs = document.querySelectorAll('.admin-tab');
    const sections = document.querySelectorAll('.admin-form-section');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show/hide sections
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            const targetSection = document.getElementById(`${targetTab}-section`);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Load lists when viewing manage sections
            if (targetTab === 'manage-news') {
                loadNewsList();
            } else if (targetTab === 'manage-clips') {
                loadClipsList();
            }
        });
    });
    
    // Initialize forms
    initNewsForm();
    initClipForm();
    
    // Load initial data
    loadNewsList();
    loadClipsList();
}

// Initialize News Form
function initNewsForm() {
    const form = document.getElementById('addNewsForm');
    const fileInput = document.getElementById('newsFile');
    const preview = document.getElementById('newsPreview');
    
    // File preview
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                preview.innerHTML = '';
                if (file.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    preview.appendChild(img);
                } else if (file.type.startsWith('video/')) {
                    const video = document.createElement('video');
                    video.src = event.target.result;
                    video.controls = true;
                    preview.appendChild(video);
                }
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('newsTitle').value;
        const date = document.getElementById('newsDate').value;
        const excerpt = document.getElementById('newsExcerpt').value;
        const imageUrl = document.getElementById('newsImage').value;
        const file = fileInput.files[0];
        
        let mediaUrl = imageUrl;
        
        // If file is uploaded, convert to base64
        if (file && !imageUrl) {
            const reader = new FileReader();
            reader.onload = (event) => {
                mediaUrl = event.target.result;
                saveNewsItem(title, date, excerpt, mediaUrl, file.type);
            };
            reader.readAsDataURL(file);
        } else {
            saveNewsItem(title, date, excerpt, mediaUrl, '');
        }
    });
}

// Initialize Clip Form
function initClipForm() {
    const form = document.getElementById('addClipForm');
    const fileInput = document.getElementById('clipFile');
    const preview = document.getElementById('clipPreview');
    
    // File preview
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                preview.innerHTML = '';
                if (file.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    preview.appendChild(img);
                } else if (file.type.startsWith('video/')) {
                    const video = document.createElement('video');
                    video.src = event.target.result;
                    video.controls = true;
                    preview.appendChild(video);
                }
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('clipTitle').value;
        const date = document.getElementById('clipDate').value;
        const excerpt = document.getElementById('clipExcerpt').value;
        const imageUrl = document.getElementById('clipImage').value;
        const file = fileInput.files[0];
        
        let mediaUrl = imageUrl;
        
        // If file is uploaded, convert to base64
        if (file && !imageUrl) {
            const reader = new FileReader();
            reader.onload = (event) => {
                mediaUrl = event.target.result;
                saveClipItem(title, date, excerpt, mediaUrl, file.type);
            };
            reader.readAsDataURL(file);
        } else {
            saveClipItem(title, date, excerpt, mediaUrl, '');
        }
    });
}

// Save News Item
function saveNewsItem(title, date, excerpt, mediaUrl, mediaType) {
    const news = JSON.parse(localStorage.getItem('bbvipNews') || '[]');
    
    const newsItem = {
        id: Date.now().toString(),
        title: title,
        date: date,
        excerpt: excerpt,
        mediaUrl: mediaUrl,
        mediaType: mediaType || (mediaUrl.startsWith('data:') ? 'base64' : 'url')
    };
    
    news.unshift(newsItem); // Add to beginning
    localStorage.setItem('bbvipNews', JSON.stringify(news));
    
    // Show success message
    const successMsg = document.getElementById('newsSuccess');
    successMsg.style.display = 'block';
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 3000);
    
    // Reset form
    document.getElementById('addNewsForm').reset();
    document.getElementById('newsPreview').innerHTML = '';
    
    // Reload news list
    loadNewsList();
}

// Save Clip Item
function saveClipItem(title, date, excerpt, mediaUrl, mediaType) {
    const clips = JSON.parse(localStorage.getItem('bbvipClips') || '[]');
    
    const clipItem = {
        id: Date.now().toString(),
        title: title,
        date: date,
        excerpt: excerpt || '',
        mediaUrl: mediaUrl,
        mediaType: mediaType || (mediaUrl.startsWith('data:') ? 'base64' : 'url')
    };
    
    clips.unshift(clipItem); // Add to beginning
    localStorage.setItem('bbvipClips', JSON.stringify(clips));
    
    // Show success message
    const successMsg = document.getElementById('clipSuccess');
    successMsg.style.display = 'block';
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 3000);
    
    // Reset form
    document.getElementById('addClipForm').reset();
    document.getElementById('clipPreview').innerHTML = '';
    
    // Reload clips list
    loadClipsList();
}

// Load News List
function loadNewsList() {
    const news = JSON.parse(localStorage.getItem('bbvipNews') || '[]');
    const newsList = document.getElementById('newsList');
    
    if (news.length === 0) {
        newsList.innerHTML = '<p style="text-align: center; color: var(--text-gray);">Nuk ka lajme.</p>';
        return;
    }
    
    newsList.innerHTML = news.map(item => `
        <div class="item-card">
            <div class="item-info">
                <div class="item-title">${item.title}</div>
                <div class="item-date">${new Date(item.date).toLocaleDateString('sq-AL', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</div>
            </div>
            <button class="delete-btn" onclick="deleteNews('${item.id}')">Fshi</button>
        </div>
    `).join('');
}

// Load Clips List
function loadClipsList() {
    const clips = JSON.parse(localStorage.getItem('bbvipClips') || '[]');
    const clipsList = document.getElementById('clipsList');
    
    if (clips.length === 0) {
        clipsList.innerHTML = '<p style="text-align: center; color: var(--text-gray);">Nuk ka klipe.</p>';
        return;
    }
    
    clipsList.innerHTML = clips.map(item => `
        <div class="item-card">
            <div class="item-info">
                <div class="item-title">${item.title}</div>
                <div class="item-date">${new Date(item.date).toLocaleDateString('sq-AL', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</div>
            </div>
            <button class="delete-btn" onclick="deleteClip('${item.id}')">Fshi</button>
        </div>
    `).join('');
}

// Delete News
function deleteNews(id) {
    if (confirm('A jeni të sigurt që dëshironi të fshini këtë lajm?')) {
        const news = JSON.parse(localStorage.getItem('bbvipNews') || '[]');
        const filtered = news.filter(item => item.id !== id);
        localStorage.setItem('bbvipNews', JSON.stringify(filtered));
        loadNewsList();
    }
}

// Delete Clip
function deleteClip(id) {
    if (confirm('A jeni të sigurt që dëshironi të fshini këtë klip?')) {
        const clips = JSON.parse(localStorage.getItem('bbvipClips') || '[]');
        const filtered = clips.filter(item => item.id !== id);
        localStorage.setItem('bbvipClips', JSON.stringify(filtered));
        loadClipsList();
    }
}

// Logout
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminLoginTime');
    window.location.href = 'admin.html';
}




