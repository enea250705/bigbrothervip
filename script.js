// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const nav = document.querySelector('.nav');

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            nav.classList.remove('active');
        }
    });
});

// Active Nav Link
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Channel Switching
const channelTabs = document.querySelectorAll('.channel-tab');
const kanali1Container = document.getElementById('kanali1Container');
const kanali2Container = document.getElementById('kanali2Container');

let currentView = 'both'; // 'both', 'kanali1', 'kanali2'

channelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const channel = tab.getAttribute('data-channel');
        currentView = channel;
        
        // Update active tab
        channelTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show/hide channels
        if (channel === 'both') {
            kanali1Container.classList.remove('hidden');
            kanali2Container.classList.remove('hidden');
        } else if (channel === 'kanali1') {
            kanali1Container.classList.remove('hidden');
            kanali2Container.classList.add('hidden');
        } else if (channel === 'kanali2') {
            kanali1Container.classList.add('hidden');
            kanali2Container.classList.remove('hidden');
        }
    });
});

// Video Player Functionality for Both Channels
const videoPlayers = {
    1: { element: null, isPlaying: false, isMuted: false },
    2: { element: null, isPlaying: false, isMuted: false }
};

// Stream URLs - Replace these with actual Big Brother VIP Albania stream URLs
const streamUrls = {
    1: 'YOUR_KANALI_1_STREAM_URL_HERE', // Replace with actual stream URL
    2: 'YOUR_KANALI_2_STREAM_URL_HERE'  // Replace with actual stream URL
};

function initializeVideoPlayer(channelNum) {
    const videoPlayer = document.getElementById(`videoPlayer${channelNum}`);
    const playButton = videoPlayer.querySelector('.play-button');
    
    videoPlayers[channelNum].element = videoPlayer;
    
    playButton.addEventListener('click', () => {
        startStream(channelNum);
    });
    
    // Add control button listeners
    const fullscreenBtn = videoPlayer.querySelector(`.fullscreen-btn[data-channel="${channelNum}"]`);
    const volumeBtn = videoPlayer.querySelector(`.volume-btn[data-channel="${channelNum}"]`);
    
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => toggleFullscreen(channelNum));
    }
    if (volumeBtn) {
        volumeBtn.addEventListener('click', () => toggleVolume(channelNum));
    }
}

function startStream(channelNum) {
    if (videoPlayers[channelNum].isPlaying) return;
    
    const videoPlayer = videoPlayers[channelNum].element;
    const streamUrl = streamUrls[channelNum];
    
    // For demo purposes, using a placeholder. Replace with actual stream embed code
    // Example for iframe embed:
    videoPlayer.innerHTML = `
        <iframe 
            width="100%" 
            height="100%" 
            src="${streamUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0'}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            id="iframe${channelNum}"
        ></iframe>
        <div class="video-controls">
            <button class="control-btn fullscreen-btn" data-channel="${channelNum}">⛶</button>
            <button class="control-btn volume-btn" data-channel="${channelNum}">🔊</button>
        </div>
    `;
    
    videoPlayers[channelNum].isPlaying = true;
    
    // Re-attach event listeners
    setTimeout(() => {
        const fullscreenBtn = videoPlayer.querySelector(`.fullscreen-btn[data-channel="${channelNum}"]`);
        const volumeBtn = videoPlayer.querySelector(`.volume-btn[data-channel="${channelNum}"]`);
        
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => toggleFullscreen(channelNum));
        }
        if (volumeBtn) {
            volumeBtn.addEventListener('click', () => toggleVolume(channelNum));
        }
    }, 100);
}

function toggleFullscreen(channelNum) {
    const videoPlayer = videoPlayers[channelNum].element;
    const iframe = videoPlayer.querySelector(`#iframe${channelNum}`);
    const videoWrapper = videoPlayer.closest('.video-wrapper');
    
    if (iframe) {
        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        } else if (iframe.webkitRequestFullscreen) {
            iframe.webkitRequestFullscreen();
        } else if (iframe.mozRequestFullScreen) {
            iframe.mozRequestFullScreen();
        } else if (videoWrapper.requestFullscreen) {
            videoWrapper.requestFullscreen();
        }
    } else if (videoWrapper) {
        if (videoWrapper.requestFullscreen) {
            videoWrapper.requestFullscreen();
        }
    }
}

function toggleVolume(channelNum) {
    videoPlayers[channelNum].isMuted = !videoPlayers[channelNum].isMuted;
    const videoPlayer = videoPlayers[channelNum].element;
    const iframe = videoPlayer.querySelector(`#iframe${channelNum}`);
    const volumeBtn = videoPlayer.querySelector(`.volume-btn[data-channel="${channelNum}"]`);
    
    if (iframe) {
        const src = iframe.src;
        if (videoPlayers[channelNum].isMuted) {
            iframe.src = src.replace('mute=0', 'mute=1');
            if (volumeBtn) volumeBtn.textContent = '🔇';
        } else {
            iframe.src = src.replace('mute=1', 'mute=0');
            if (volumeBtn) volumeBtn.textContent = '🔊';
        }
    }
}

// Viewer Count Animation for Both Channels
function updateViewerCounts() {
    const viewerCount1 = document.getElementById('viewerCount1');
    const viewerCount2 = document.getElementById('viewerCount2');
    
    if (viewerCount1) {
        const baseCount1 = 8000;
        const randomChange1 = Math.floor(Math.random() * 500) - 250;
        const newCount1 = baseCount1 + randomChange1;
        viewerCount1.textContent = newCount1.toLocaleString();
    }
    
    if (viewerCount2) {
        const baseCount2 = 6000;
        const randomChange2 = Math.floor(Math.random() * 500) - 250;
        const newCount2 = baseCount2 + randomChange2;
        viewerCount2.textContent = newCount2.toLocaleString();
    }
}

setInterval(updateViewerCounts, 5000);

// Sample News Data
const news = [
    {
        date: '2025-12-15',
        title: 'Banor i Ri Hyn në Shtëpi',
        excerpt: 'Një banor i ri surprizë ka hyrë në shtëpinë e Big Brother VIP Albania, duke shkaktuar ndryshime dinamike...'
    },
    {
        date: '2025-12-14',
        title: 'Drama e Eliminimit',
        excerpt: 'Eliminimi i natës së kaluar ishte plot tension pasi dy banorë u përballën me votën e publikut...'
    },
    {
        date: '2025-12-13',
        title: 'Romancë në Shtëpi',
        excerpt: 'Dy banorë kanë filluar t\'i afrohen njëri-tjetrit, duke shkaktuar thashetheme për një romancë të mundshme...'
    },
    {
        date: '2025-12-12',
        title: 'Big Brother Shpall Sfidë të Re',
        excerpt: 'Një sfidë e re javore është shpallur që do të testojë forcën fizike dhe mendore të banorëve...'
    },
    {
        date: '2025-12-11',
        title: 'Numri i Shikuesve Thye Rekorde',
        excerpt: 'Big Brother VIP Albania ka arritur numra rekord shikuesish këtë sezon...'
    },
    {
        date: '2025-12-10',
        title: 'Banor Zbulon Sekret Të Shokueshëm',
        excerpt: 'Gjatë një bisede në orët e vona, një banor zbuloi një sekret që i la të tjerët pa fjalë...'
    },
];

// Load News
function loadNews() {
    const newsGrid = document.getElementById('newsGrid');
    newsGrid.innerHTML = news.map(item => `
        <div class="news-card">
            <div class="news-image"></div>
            <div class="news-content">
                <div class="news-date">${new Date(item.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</div>
                <div class="news-title">${item.title}</div>
                <div class="news-excerpt">${item.excerpt}</div>
            </div>
        </div>
    `).join('');
}

// Countdown Timer - 20 Dhjetor 2025, ora 21:00
function startCountdown() {
    // Target date: December 20, 2025 at 21:00 (9 PM)
    const targetDate = new Date('2025-12-20T21:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        if (distance < 0) {
            // Countdown finished
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }
        
        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update display
        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }
    
    // Update immediately
    updateCountdown();
    
    // Update every second
    setInterval(updateCountdown, 1000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadNews();
    
    // Start countdown timer
    startCountdown();
    
    // Initialize both video players (hidden for now)
    initializeVideoPlayer(1);
    initializeVideoPlayer(2);
    
    // Set initial viewer counts
    updateViewerCounts();
});

// Add parallax effect on scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
});

