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

// News Data (empty for now)
const news = [];

// Clips Data (empty for now)
const clips = [];

// Load News
function loadNews() {
    const newsGrid = document.getElementById('newsGrid');
    if (news.length === 0) {
        newsGrid.innerHTML = '<p style="text-align: center; color: var(--text-gray); font-size: 18px; grid-column: 1 / -1;">Nuk ka lajme për momentin.</p>';
    } else {
        newsGrid.innerHTML = news.map(item => `
            <div class="news-card">
                <div class="news-image"></div>
                <div class="news-content">
                    <div class="news-date">${new Date(item.date).toLocaleDateString('sq-AL', { 
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
}

// Load Clips
function loadClips() {
    const clipsGrid = document.getElementById('clipsGrid');
    if (clips.length === 0) {
        clipsGrid.innerHTML = '<p style="text-align: center; color: var(--text-gray); font-size: 18px; grid-column: 1 / -1;">Nuk ka klipa për momentin.</p>';
    } else {
        clipsGrid.innerHTML = clips.map(item => `
            <div class="news-card">
                <div class="news-image" style="position: relative;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; background: rgba(0, 51, 160, 0.8); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                <div class="news-content">
                    <div class="news-date">${new Date(item.date).toLocaleDateString('sq-AL', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</div>
                    <div class="news-title">${item.title}</div>
                    <div class="news-excerpt">${item.excerpt || ''}</div>
                </div>
            </div>
        `).join('');
    }
}

// News/Clips Tab Switching
function initNewsTabs() {
    const tabs = document.querySelectorAll('.news-tabs .channel-tab');
    const newsGrid = document.getElementById('newsGrid');
    const clipsGrid = document.getElementById('clipsGrid');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabType = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => {
                t.classList.remove('active');
                t.style.background = 'rgba(26, 26, 26, 0.8)';
                t.style.borderColor = 'rgba(0, 51, 160, 0.3)';
            });
            tab.classList.add('active');
            tab.style.background = 'var(--primary-blue)';
            tab.style.borderColor = 'var(--primary-blue)';
            tab.style.boxShadow = '0 5px 20px rgba(0, 51, 160, 0.5)';
            
            // Show/hide grids
            if (tabType === 'news') {
                newsGrid.style.display = 'grid';
                clipsGrid.style.display = 'none';
            } else {
                newsGrid.style.display = 'none';
                clipsGrid.style.display = 'grid';
            }
        });
    });
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
    loadClips();
    initNewsTabs();
    
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

