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

// ============================================
// STREAM CONFIGURATION
// ============================================
// Currently using video files. To switch to live streams:
// 1. Replace the URLs below with your live stream URLs
// 2. Supported formats:
//    - Video files: .mp4, .webm, .ogg
//    - HLS streams: .m3u8
//    - DASH streams: .mpd
//    - Iframe embeds: Full URL (will use iframe instead of video element)
// ============================================
const streamUrls = {
    1: 'ssstik.io_@_bigbrothervipalbania_5_1766232867952.mp4', // Kanali 1 - Replace with live stream URL when ready
    2: 'ssstik.io_@_bigbrothervipalbania_5_1766232867952.mp4'  // Kanali 2 - Replace with live stream URL when ready
};

// Stream types configuration (auto-detected, but can be manually set)
const streamTypes = {
    1: 'video', // 'video', 'hls', 'dash', or 'iframe'
    2: 'video'   // 'video', 'hls', 'dash', or 'iframe'
};

// Helper function to detect stream type
function detectStreamType(url) {
    if (!url) return 'video';
    
    // Check for iframe embed (YouTube, Twitch, etc.)
    if (url.includes('youtube.com') || url.includes('youtu.be') || 
        url.includes('twitch.tv') || url.includes('vimeo.com') ||
        url.includes('embed') || url.includes('player')) {
        return 'iframe';
    }
    
    // Check for HLS stream
    if (url.includes('.m3u8')) {
        return 'hls';
    }
    
    // Check for DASH stream
    if (url.includes('.mpd')) {
        return 'dash';
    }
    
    // Default to video file
    return 'video';
}

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
    
    if (!streamUrl) {
        console.error(`No stream URL configured for channel ${channelNum}`);
        return;
    }
    
    // Detect stream type (or use manual configuration)
    const streamType = streamTypes[channelNum] || detectStreamType(streamUrl);
    
    let playerHTML = '';
    
    // ============================================
    // STREAM PLAYER SETUP
    // ============================================
    // This section handles different stream types
    // Modify here if you need custom stream handling
    // ============================================
    
    if (streamType === 'iframe') {
        // For iframe embeds (YouTube, Twitch, custom players)
        playerHTML = `
            <iframe 
                id="iframe${channelNum}"
                width="100%" 
                height="100%" 
                src="${streamUrl}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            ></iframe>
            <div class="video-controls">
                <button class="control-btn fullscreen-btn" data-channel="${channelNum}">⛶</button>
                <button class="control-btn volume-btn" data-channel="${channelNum}">🔊</button>
            </div>
        `;
    } else if (streamType === 'hls') {
        // For HLS streams (.m3u8) - requires hls.js library
        playerHTML = `
            <video 
                id="video${channelNum}"
                width="100%" 
                height="100%" 
                controls
                autoplay
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; background: #000;"
            >
                <source src="${streamUrl}" type="application/x-mpegURL">
                Shfletuesi juaj nuk mbështet HLS streams.
            </video>
            <div class="video-controls">
                <button class="control-btn fullscreen-btn" data-channel="${channelNum}">⛶</button>
                <button class="control-btn volume-btn" data-channel="${channelNum}">🔊</button>
            </div>
        `;
    } else if (streamType === 'dash') {
        // For DASH streams (.mpd) - requires dash.js library
        playerHTML = `
            <video 
                id="video${channelNum}"
                width="100%" 
                height="100%" 
                controls
                autoplay
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; background: #000;"
            >
                <source src="${streamUrl}" type="application/dash+xml">
                Shfletuesi juaj nuk mbështet DASH streams.
            </video>
            <div class="video-controls">
                <button class="control-btn fullscreen-btn" data-channel="${channelNum}">⛶</button>
                <button class="control-btn volume-btn" data-channel="${channelNum}">🔊</button>
            </div>
        `;
    } else {
        // Default: Video file (.mp4, .webm, .ogg, etc.)
        const videoType = streamUrl.endsWith('.webm') ? 'video/webm' : 
                         streamUrl.endsWith('.ogg') ? 'video/ogg' : 'video/mp4';
        
        playerHTML = `
            <video 
                id="video${channelNum}"
                width="100%" 
                height="100%" 
                controls
                autoplay
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; background: #000;"
            >
                <source src="${streamUrl}" type="${videoType}">
                Shfletuesi juaj nuk mbështet video HTML5.
            </video>
            <div class="video-controls">
                <button class="control-btn fullscreen-btn" data-channel="${channelNum}">⛶</button>
                <button class="control-btn volume-btn" data-channel="${channelNum}">🔊</button>
            </div>
        `;
    }
    
    videoPlayer.innerHTML = playerHTML;
    videoPlayers[channelNum].isPlaying = true;
    videoPlayers[channelNum].streamType = streamType;
    
    // Get video/iframe element
    const video = document.getElementById(`video${channelNum}`);
    const iframe = document.getElementById(`iframe${channelNum}`);
    
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
        
        // Store element reference
        if (video) {
            videoPlayers[channelNum].videoElement = video;
        }
        if (iframe) {
            videoPlayers[channelNum].iframeElement = iframe;
        }
    }, 100);
}

function toggleFullscreen(channelNum) {
    const videoPlayer = videoPlayers[channelNum].element;
    const streamType = videoPlayers[channelNum].streamType || 'video';
    const video = videoPlayers[channelNum].videoElement || videoPlayer.querySelector(`#video${channelNum}`);
    const iframe = videoPlayers[channelNum].iframeElement || videoPlayer.querySelector(`#iframe${channelNum}`);
    const videoWrapper = videoPlayer.closest('.video-wrapper');
    
    // Handle fullscreen based on stream type
    const elementToFullscreen = streamType === 'iframe' ? iframe : video;
    
    if (elementToFullscreen) {
        if (elementToFullscreen.requestFullscreen) {
            elementToFullscreen.requestFullscreen();
        } else if (elementToFullscreen.webkitRequestFullscreen) {
            elementToFullscreen.webkitRequestFullscreen();
        } else if (elementToFullscreen.mozRequestFullScreen) {
            elementToFullscreen.mozRequestFullScreen();
        } else if (elementToFullscreen.msRequestFullscreen) {
            elementToFullscreen.msRequestFullscreen();
        }
    } else if (videoWrapper) {
        // Fallback to wrapper fullscreen
        if (videoWrapper.requestFullscreen) {
            videoWrapper.requestFullscreen();
        } else if (videoWrapper.webkitRequestFullscreen) {
            videoWrapper.webkitRequestFullscreen();
        } else if (videoWrapper.mozRequestFullScreen) {
            videoWrapper.mozRequestFullScreen();
        } else if (videoWrapper.msRequestFullscreen) {
            videoWrapper.msRequestFullscreen();
        }
    }
}

function toggleVolume(channelNum) {
    videoPlayers[channelNum].isMuted = !videoPlayers[channelNum].isMuted;
    const videoPlayer = videoPlayers[channelNum].element;
    const streamType = videoPlayers[channelNum].streamType || 'video';
    const video = videoPlayers[channelNum].videoElement || videoPlayer.querySelector(`#video${channelNum}`);
    const iframe = videoPlayers[channelNum].iframeElement || videoPlayer.querySelector(`#iframe${channelNum}`);
    const volumeBtn = videoPlayer.querySelector(`.volume-btn[data-channel="${channelNum}"]`);
    
    // Handle volume based on stream type
    if (streamType === 'iframe') {
        // For iframes, volume control is limited (depends on embed)
        // Most iframe embeds handle volume internally
        console.log('Volume control for iframe embeds is limited');
    } else if (video) {
        // For video elements (file, HLS, DASH)
        video.muted = videoPlayers[channelNum].isMuted;
    }
    
    if (volumeBtn) {
        volumeBtn.textContent = videoPlayers[channelNum].isMuted ? '🔇' : '🔊';
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

// Load News from localStorage
function loadNews() {
    const news = JSON.parse(localStorage.getItem('bbvipNews') || '[]');
    const newsGrid = document.getElementById('newsGrid');
    
    if (news.length === 0) {
        newsGrid.innerHTML = '<p style="text-align: center; color: var(--text-gray); font-size: 18px; grid-column: 1 / -1;">Nuk ka lajme për momentin.</p>';
    } else {
        newsGrid.innerHTML = news.map(item => {
            const mediaElement = item.mediaUrl ? 
                (item.mediaType && item.mediaType.startsWith('video/') || item.mediaUrl.includes('.mp4') || item.mediaUrl.includes('.webm') || item.mediaUrl.includes('.mov') ?
                    `<video style="width: 100%; height: 200px; object-fit: cover;" controls preload="metadata" width="350" height="200"><source src="${item.mediaUrl}" type="video/mp4"></video>` :
                    `<img src="${item.mediaUrl}" style="width: 100%; height: 200px; object-fit: cover;" alt="${item.title}" loading="lazy" width="350" height="200">`) :
                `<div class="news-image"></div>`;
            
            return `
                <article class="news-card" itemscope itemtype="https://schema.org/NewsArticle">
                    ${mediaElement}
                    <div class="news-content">
                        <time class="news-date" datetime="${item.date}" itemprop="datePublished">${new Date(item.date).toLocaleDateString('sq-AL', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</time>
                        <h3 class="news-title" itemprop="headline">${item.title}</h3>
                        <div class="news-excerpt" itemprop="description">${item.excerpt}</div>
                        ${item.mediaUrl ? `<meta itemprop="image" content="${item.mediaUrl}">` : ''}
                    </div>
                </article>
            `;
        }).join('');
    }
}

// Load Clips from localStorage
function loadClips() {
    const clips = JSON.parse(localStorage.getItem('bbvipClips') || '[]');
    const clipsGrid = document.getElementById('clipsGrid');
    
    if (clips.length === 0) {
        clipsGrid.innerHTML = '<p style="text-align: center; color: var(--text-gray); font-size: 18px; grid-column: 1 / -1;">Nuk ka klipa për momentin.</p>';
    } else {
        clipsGrid.innerHTML = clips.map(item => {
            const mediaElement = item.mediaUrl ? 
                (item.mediaType && item.mediaType.startsWith('video/') || item.mediaUrl.includes('.mp4') || item.mediaUrl.includes('.webm') || item.mediaUrl.includes('.mov') || item.mediaUrl.startsWith('data:video/') ?
                    `<video style="width: 100%; height: 200px; object-fit: cover;" controls preload="metadata" width="350" height="200" itemprop="contentUrl"><source src="${item.mediaUrl}" type="video/mp4"></video>` :
                    `<img src="${item.mediaUrl}" style="width: 100%; height: 200px; object-fit: cover;" alt="${item.title}" loading="lazy" width="350" height="200" itemprop="thumbnailUrl">`) :
                `<div class="news-image" style="position: relative;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; background: rgba(0, 51, 160, 0.8); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>`;
            
            return `
                <article class="news-card" itemscope itemtype="https://schema.org/VideoObject">
                    ${mediaElement}
                    <div class="news-content">
                        <time class="news-date" datetime="${item.date}" itemprop="uploadDate">${new Date(item.date).toLocaleDateString('sq-AL', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</time>
                        <h3 class="news-title" itemprop="name">${item.title}</h3>
                        ${item.excerpt ? `<div class="news-excerpt" itemprop="description">${item.excerpt}</div>` : ''}
                        ${item.mediaUrl ? `<meta itemprop="contentUrl" content="${item.mediaUrl}"><meta itemprop="thumbnailUrl" content="${item.mediaUrl}">` : ''}
                    </div>
                </article>
            `;
        }).join('');
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


// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadNews();
    loadClips();
    initNewsTabs();
    
    // Initialize both video players
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

// Register Service Worker (only if ad limit not reached)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Check ad limit before registering service worker
        const adCount = window.AdManager ? window.AdManager.getAdCount() : 0;
        const maxAds = window.AdManager ? window.AdManager.MAX_ADS : 7;
        
        if (adCount < maxAds) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered successfully:', registration.scope);
                })
                .catch((error) => {
                    console.log('Service Worker registration failed:', error);
                });
        } else {
            console.log('Ad limit reached. Service worker (ads) not registered.');
        }
    });
}

