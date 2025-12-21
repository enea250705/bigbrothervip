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

// Single Video Player - Switches between channels
let currentChannel = 1; // Default to Kanali 1
window.currentChannel = currentChannel; // Make available globally
const mainVideoPlayer = {
    element: null,
    isPlaying: false,
    isMuted: false,
    videoElement: null,
    iframeElement: null,
    streamType: null
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
// ============================================
// STREAM URLS CONFIGURATION
// ============================================
// When you have live streams, replace these URLs:
// - For HLS streams (.m3u8): Set streamType to 'hls' or 'video'
// - For DASH streams (.mpd): Set streamType to 'dash' or 'video'
// - For iframe embeds (YouTube, Twitch, etc.): Set streamType to 'iframe'
// - For direct video URLs: Set streamType to 'video'
// 
// Live streams will automatically use native HTML5 video player
// with full controls (play, pause, volume, fullscreen, etc.)
// ============================================
const streamUrls = {
    1: '//ok.ru/videoembed/10641169915590?nochat=1&autoplay=1', // Kanali 1 - OK.ru live stream
    2: '//ok.ru/videoembed/10641176665798?nochat=1&autoplay=1'  // Kanali 2 - OK.ru live stream
};

// Stream types configuration (auto-detected, but can be manually set)
// Options: 'video' (native HTML5), 'hls', 'dash', or 'iframe'
// For live streams, 'video' or 'hls' will use native player with full controls
const streamTypes = {
    1: 'iframe', // OK.ru uses iframe embed
    2: 'iframe'   // OK.ru uses iframe embed
};

// Helper function to detect stream type
function detectStreamType(url) {
    if (!url) return 'video';
    
    // Check for iframe embed (YouTube, Twitch, OK.ru, etc.)
    if (url.includes('youtube.com') || url.includes('youtu.be') || 
        url.includes('twitch.tv') || url.includes('vimeo.com') ||
        url.includes('ok.ru') || url.includes('odnoklassniki.ru') ||
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

// Initialize main video player
function initializeMainVideoPlayer() {
    const videoPlayer = document.getElementById('mainVideoPlayer');
    if (!videoPlayer) return;
    
    mainVideoPlayer.element = videoPlayer;
    
    // Play button
    const playButton = document.getElementById('mainPlayButton');
    if (playButton) {
        playButton.addEventListener('click', () => {
            // Add visual feedback
            playButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                playButton.style.transform = 'scale(1)';
            }, 150);

            // Start the stream
            startStream(currentChannel);
        });
    }
    
    // Control buttons (optional - native video controls are preferred)
    // These are kept for iframe embeds, but video elements use native controls
    const fullscreenBtn = document.getElementById('mainFullscreenBtn');
    const volumeBtn = document.getElementById('mainVolumeBtn');
    
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => toggleFullscreen());
    }
    if (volumeBtn) {
        volumeBtn.addEventListener('click', () => toggleVolume());
    }
    
    // Note: For live streams, native video player controls handle:
    // - Play/Pause
    // - Volume control
    // - Fullscreen (double-click or button in controls)
    // - Seeking (for non-live streams)
    // - Picture-in-picture
    // - Playback speed
    
    // Channel tab buttons
    const channelTab1 = document.getElementById('channelTab1');
    const channelTab2 = document.getElementById('channelTab2');
    
    if (channelTab1) {
        channelTab1.addEventListener('click', () => switchChannel(1));
    }
    if (channelTab2) {
        channelTab2.addEventListener('click', () => switchChannel(2));
    }
}

// Switch between channels
function switchChannel(channelNum) {
    if (channelNum === currentChannel) return;
    
    currentChannel = channelNum;
    window.currentChannel = channelNum; // Update global reference
    
    // Update active tab
    document.querySelectorAll('.channel-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeTab = document.getElementById(`channelTab${channelNum}`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Update channel name
    const channelName = document.getElementById('currentChannelName');
    if (channelName) {
        channelName.textContent = `KANALI ${channelNum}`;
    }
    
    // Update chat visibility when switching channels
    if (window.updateChatVisibility) {
        window.updateChatVisibility(channelNum);
    }
    
    // Update viewer count when switching channels
    setTimeout(() => {
        updateViewerCountDisplay();
        // Also force update from stored counts (from viewer-counter.js)
        if (window.viewerCounts && window.viewerCounts[channelNum] !== undefined) {
            const currentViewerCount = document.getElementById('currentViewerCount');
            if (currentViewerCount) {
                currentViewerCount.textContent = window.viewerCounts[channelNum].toLocaleString('sq-AL');
                console.log(`Updated viewer count on channel switch to: ${window.viewerCounts[channelNum]}`);
            }
        }
        // Also update from viewer counter instances
        if (window.viewerCounters && window.viewerCounters[channelNum]) {
            window.viewerCounters[channelNum].updateDisplay();
        }
    }, 500);
    
    // Stop current stream and reset player
    if (mainVideoPlayer.isPlaying) {
        stopStream();
    }
    
    // Reset player to show play button
    resetPlayer();
}

// Reset player to initial state
function resetPlayer() {
    const videoPlayer = mainVideoPlayer.element;
    if (!videoPlayer) return;
    
    const streamMessage = document.getElementById('streamMessage');
    if (streamMessage) {
        streamMessage.textContent = `Kliko për të filluar shikimin e Kanali ${currentChannel}`;
    }
    
    // Reset state
    mainVideoPlayer.isPlaying = false;
    mainVideoPlayer.videoElement = null;
    mainVideoPlayer.iframeElement = null;
    
    // Show play button overlay
    const overlay = videoPlayer.querySelector('.video-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
    
    // Reset video player HTML to placeholder
    videoPlayer.innerHTML = `
        <div class="video-overlay">
            <div class="play-button" id="mainPlayButton">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="40" fill="rgba(255, 255, 255, 0.9)"/>
                    <path d="M32 24L32 56L56 40L32 24Z" fill="#0033A0"/>
                </svg>
            </div>
            <p class="stream-message" id="streamMessage">Kliko për të filluar shikimin e Kanali ${currentChannel}</p>
        </div>
        <div class="video-controls">
            <button class="control-btn fullscreen-btn" id="mainFullscreenBtn">⛶</button>
            <button class="control-btn volume-btn" id="mainVolumeBtn">🔊</button>
        </div>
    `;
    
    // Re-initialize play button
    const newPlayButton = document.getElementById('mainPlayButton');
    if (newPlayButton) {
        newPlayButton.addEventListener('click', () => {
            startStream(currentChannel);
        });
    }
}

// Stop current stream
function stopStream() {
    if (mainVideoPlayer.videoElement) {
        mainVideoPlayer.videoElement.pause();
        mainVideoPlayer.videoElement.src = '';
        mainVideoPlayer.videoElement.load();
    }
    mainVideoPlayer.isPlaying = false;
}

// Update viewer count display
function updateViewerCountDisplay() {
    const currentViewerCount = document.getElementById('currentViewerCount');
    
    if (currentViewerCount) {
        // Get viewer count from chat system if available
        if (window.viewerCounts && window.viewerCounts[currentChannel]) {
            currentViewerCount.textContent = window.viewerCounts[currentChannel].toLocaleString('sq-AL');
        } else {
            // Fallback to animated counts if Firebase viewer counts not available
            const viewerCount1 = document.getElementById('viewerCount1');
            const viewerCount2 = document.getElementById('viewerCount2');
            
            if (currentChannel === 1 && viewerCount1) {
                currentViewerCount.textContent = viewerCount1.textContent;
            } else if (currentChannel === 2 && viewerCount2) {
                currentViewerCount.textContent = viewerCount2.textContent;
            } else {
                // Final fallback
                updateViewerCounts();
                setTimeout(() => {
                    if (currentChannel === 1 && viewerCount1) {
                        currentViewerCount.textContent = viewerCount1.textContent;
                    } else if (currentChannel === 2 && viewerCount2) {
                        currentViewerCount.textContent = viewerCount2.textContent;
                    }
                }, 100);
            }
        }
    }
}

function startStream(channelNum) {
    console.log('startStream called with channel:', channelNum);

    // Use current channel if not specified
    if (!channelNum) channelNum = currentChannel;

    if (mainVideoPlayer.isPlaying && currentChannel === channelNum) {
        console.log('Stream already playing for this channel');
        return;
    }

    // Show loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
        console.log('Loading indicator shown');
    }
    
    const videoPlayer = mainVideoPlayer.element;
    if (!videoPlayer) return;
    
    const streamUrl = streamUrls[channelNum];
    
    if (!streamUrl) {
        console.error(`No stream URL configured for channel ${channelNum}`);
        // Hide loading indicator on error
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        return;
    }

    console.log('Starting stream for channel', channelNum, 'with URL:', streamUrl);
    
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
        // For iframe embeds (YouTube, Twitch, OK.ru, custom players)
        // Convert OK.ru video URL to embed format if needed
        let embedUrl = streamUrl;
        if (streamUrl.includes('ok.ru/video/')) {
            // OK.ru embed format: //ok.ru/videoembed/{video_id}?nochat=1&autoplay=1
            const videoId = streamUrl.match(/\/video\/(\d+)/);
            if (videoId) {
                // Use protocol-relative URL with nochat and autoplay parameters
                embedUrl = `//ok.ru/videoembed/${videoId[1]}?nochat=1&autoplay=1`;
                console.log('OK.ru video ID extracted:', videoId[1]);
                console.log('OK.ru embed URL:', embedUrl);
            } else {
                console.error('Failed to extract OK.ru video ID from URL:', streamUrl);
            }
        }
        
        playerHTML = `
            <iframe 
                id="mainIframe"
                width="100%" 
                height="100%" 
                src="${embedUrl}" 
                frameborder="0" 
                allow="autoplay; fullscreen" 
                allowfullscreen
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; background: #000;"
            ></iframe>
        `;
        console.log('Iframe player HTML created for:', embedUrl);
        // Note: OK.ru player has its own controls and fullscreen - no custom controls needed
        // Parameters: nochat=1 (removes chat), autoplay=1 (starts automatically)
    } else if (streamType === 'hls') {
        // For HLS streams (.m3u8) - requires hls.js library
        playerHTML = `
            <video 
                id="mainVideo"
                width="100%" 
                height="100%" 
                controls
                preload="auto"
                playsinline
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; background: #000;"
            >
                <source src="${streamUrl}" type="application/x-mpegURL">
                Shfletuesi juaj nuk mbështet HLS streams.
            </video>
            <div class="video-controls">
                <button class="control-btn fullscreen-btn" id="mainFullscreenBtn">⛶</button>
                <button class="control-btn volume-btn" id="mainVolumeBtn">🔊</button>
            </div>
        `;
    } else if (streamType === 'dash') {
        // For DASH streams (.mpd) - requires dash.js library
        playerHTML = `
            <video 
                id="mainVideo"
                width="100%" 
                height="100%" 
                controls
                preload="auto"
                playsinline
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; background: #000;"
            >
                <source src="${streamUrl}" type="application/dash+xml">
                Shfletuesi juaj nuk mbështet DASH streams.
            </video>
            <div class="video-controls">
                <button class="control-btn fullscreen-btn" id="mainFullscreenBtn">⛶</button>
                <button class="control-btn volume-btn" id="mainVolumeBtn">🔊</button>
            </div>
        `;
    } else {
        // Default: Video file (.mp4, .webm, .ogg, etc.) or Live Stream
        // For live streams, use native HTML5 video player with full controls
        const videoType = streamUrl.endsWith('.webm') ? 'video/webm' : 
                         streamUrl.endsWith('.ogg') ? 'video/ogg' : 'video/mp4';
        
        // Check if it's a live stream URL (common patterns)
        const isLiveStream = streamUrl.includes('.m3u8') || 
                            streamUrl.includes('.mpd') || 
                            streamUrl.includes('live') ||
                            streamUrl.includes('stream');
        
        playerHTML = `
            <video 
                id="mainVideo"
                width="100%" 
                height="100%" 
                controls
                controlsList="nodownload"
                preload="auto"
                playsinline
                ${isLiveStream ? '' : 'autoplay loop'}
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; background: #000;"
            >
                <source src="${streamUrl}" type="${videoType}">
                Shfletuesi juaj nuk mbështet video HTML5.
            </video>
        `;
        // Note: Removed custom controls - using native video player controls only
        // Native controls include: play/pause, volume, fullscreen, seek, etc.
    }
    
    videoPlayer.innerHTML = playerHTML;
    mainVideoPlayer.isPlaying = true;
    mainVideoPlayer.streamType = streamType;
    
    // Hide overlay and loading indicator
    const overlay = videoPlayer.querySelector('.video-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    
    // For iframe embeds (like OK.ru on Kanali 1), hide loading immediately
    // No video element is created - only iframe
    if (streamType === 'iframe') {
        const loading = document.getElementById('loadingIndicator');
        if (loading) {
            loading.style.display = 'none';
        }
        console.log('Iframe embed loaded - no video element created');
    }
    
    // Get video/iframe element (only one will exist based on streamType)
    const video = document.getElementById('mainVideo');
    const iframe = document.getElementById('mainIframe');
    
    // Re-attach event listeners and start video
    setTimeout(() => {
        // Store element reference
        if (video) {
            mainVideoPlayer.videoElement = video;
            
            // Add load event listener
            video.addEventListener('loadedmetadata', () => {
                console.log('Video metadata loaded');
            });
            
            video.addEventListener('canplay', () => {
                console.log('Video can play');
                // Try to play when video is ready
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log(`Video channel ${channelNum} started playing`);
                        mainVideoPlayer.isPlaying = true;
                    }).catch((error) => {
                        console.error(`Error playing video channel ${channelNum}:`, error);
                        // Show play button if autoplay fails
                        const overlay = videoPlayer.querySelector('.video-overlay');
                        if (overlay) overlay.style.display = 'flex';
                    });
                }
            });
            
            // Explicitly try to play the video
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log(`Video channel ${channelNum} started playing immediately`);
                    mainVideoPlayer.isPlaying = true;
                }).catch((error) => {
                    console.log(`Autoplay prevented for channel ${channelNum}, waiting for canplay event:`, error);
                    // Will retry on canplay event
                });
            }
            
            // Handle video errors with detailed logging
            video.addEventListener('error', (e) => {
                console.error(`Video channel ${channelNum} error:`, e);
                const error = video.error;
                if (error) {
                    let errorMsg = 'Gabim në ngarkimin e videos. ';
                    let errorDetails = '';
                    switch(error.code) {
                        case error.MEDIA_ERR_ABORTED:
                            errorMsg += 'Video u ndal.';
                            errorDetails = 'Video loading was aborted.';
                            break;
                        case error.MEDIA_ERR_NETWORK:
                            errorMsg += 'Gabim në rrjet. Kontrolloni lidhjen tuaj.';
                            errorDetails = 'Network error. Check your connection or Cloudflare settings.';
                            break;
                        case error.MEDIA_ERR_DECODE:
                            errorMsg += 'Video nuk mund të dekodohet.';
                            errorDetails = 'Video cannot be decoded.';
                            break;
                        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                            errorMsg += 'Formati i videos nuk mbështetet.';
                            break;
                        default:
                            errorMsg += 'Gabim i panjohur.';
                    }
                    console.error(errorMsg);
                }
            });
            
            // Handle video load
            video.addEventListener('loadeddata', () => {
                console.log(`Video channel ${channelNum} loaded successfully`);
            });
        }
        if (iframe) {
            mainVideoPlayer.iframeElement = iframe;
            
            // Add error handling for iframe
            iframe.addEventListener('load', () => {
                console.log('Iframe loaded successfully');
                // Hide loading indicator
                const loading = document.getElementById('loadingIndicator');
                if (loading) loading.style.display = 'none';
            });
            
            // Check if OK.ru blocks embedding (common issue)
            setTimeout(() => {
                try {
                    // Try to access iframe content (will fail if cross-origin, which is normal)
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                    console.log('Iframe content accessible');
                } catch (e) {
                    console.warn('Cross-origin restriction (normal for OK.ru embeds):', e.message);
                    // This is expected - OK.ru uses cross-origin restrictions
                }
                
                // Check if iframe actually loaded content
                if (iframe.contentWindow) {
                    console.log('Iframe window accessible');
                } else {
                    console.error('Iframe window not accessible - OK.ru may be blocking embed');
                }
            }, 2000);
        }
    }, 100);
}

function toggleFullscreen() {
    const videoPlayer = mainVideoPlayer.element;
    const streamType = mainVideoPlayer.streamType || 'video';
    const video = mainVideoPlayer.videoElement || videoPlayer.querySelector('#mainVideo');
    const iframe = mainVideoPlayer.iframeElement || videoPlayer.querySelector('#mainIframe');
    
    // For live streams, use native fullscreen from video controls
    // This function is kept for backward compatibility but native controls are preferred
    const elementToFullscreen = streamType === 'iframe' ? iframe : video;
    
    if (elementToFullscreen) {
        // Use native fullscreen API - video controls also have built-in fullscreen button
        if (elementToFullscreen.requestFullscreen) {
            elementToFullscreen.requestFullscreen().catch(err => {
                console.log('Fullscreen request failed:', err);
            });
        } else if (elementToFullscreen.webkitRequestFullscreen) {
            elementToFullscreen.webkitRequestFullscreen();
        } else if (elementToFullscreen.mozRequestFullScreen) {
            elementToFullscreen.mozRequestFullScreen();
        } else if (elementToFullscreen.msRequestFullscreen) {
            elementToFullscreen.msRequestFullscreen();
        }
    }
}

function toggleVolume() {
    mainVideoPlayer.isMuted = !mainVideoPlayer.isMuted;
    const videoPlayer = mainVideoPlayer.element;
    const streamType = mainVideoPlayer.streamType || 'video';
    const video = mainVideoPlayer.videoElement || videoPlayer.querySelector('#mainVideo');
    const iframe = mainVideoPlayer.iframeElement || videoPlayer.querySelector('#mainIframe');
    const volumeBtn = document.getElementById('mainVolumeBtn');
    
    // Handle volume based on stream type
    if (streamType === 'iframe') {
        // For iframes, volume control is limited (depends on embed)
        // Most iframe embeds handle volume internally
        console.log('Volume control for iframe embeds is limited');
    } else if (video) {
        // For video elements (file, HLS, DASH)
        video.muted = mainVideoPlayer.isMuted;
    }
    
    if (volumeBtn) {
        volumeBtn.textContent = mainVideoPlayer.isMuted ? '🔇' : '🔊';
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

    // Initialize main video player
    initializeMainVideoPlayer();

    // Auto-start the stream after a short delay to ensure everything is loaded
    // Kanali 1 uses OK.ru iframe embed - it will load automatically
    setTimeout(() => {
        console.log('Auto-starting stream...');
        startStream(1); // Start with Kanali 1 (OK.ru iframe embed)
    }, 500);

    // Set initial viewer counts
    updateViewerCounts();
    updateViewerCountDisplay();

    // Update viewer count display periodically
    setInterval(() => {
        updateViewerCountDisplay();
    }, 5000);
    
    // Picture-in-Picture functionality
    setupPictureInPicture();
});

// Picture-in-Picture setup
function setupPictureInPicture() {
    // Check if browser supports Picture-in-Picture
    if (!document.pictureInPictureEnabled) {
        console.log('Picture-in-Picture not supported in this browser');
        return;
    }
    
    let pipActive = false;
    
    // Function to enter Picture-in-Picture
    async function enterPictureInPicture() {
        const video = mainVideoPlayer.videoElement || document.getElementById('mainVideo');
        const iframe = mainVideoPlayer.iframeElement || document.getElementById('mainIframe');
        
        if (!video && !iframe) return;
        
        // For video elements, use native PiP API
        if (video && video.readyState >= 2) {
            try {
                if (document.pictureInPictureElement !== video) {
                    await video.requestPictureInPicture();
                    pipActive = true;
                    console.log('Entered Picture-in-Picture mode');
                }
            } catch (error) {
                console.log('Could not enter Picture-in-Picture:', error);
            }
        } else if (iframe) {
            // For iframes, PiP is limited - show notification
            console.log('Picture-in-Picture for iframe embeds is limited. Use browser controls if available.');
            // Some browsers allow PiP for iframes, but it's not widely supported
            // The user can use browser's native PiP if available
        }
    }
    
    // Exit Picture-in-Picture
    async function exitPictureInPicture() {
        if (document.pictureInPictureElement) {
            try {
                await document.exitPictureInPicture();
                pipActive = false;
                console.log('Exited Picture-in-Picture mode');
            } catch (error) {
                console.log('Could not exit Picture-in-Picture:', error);
            }
        }
    }
    
    // Listen for PiP events
    document.addEventListener('enterpictureinpicture', () => {
        pipActive = true;
        console.log('Entered Picture-in-Picture');
    });
    
    document.addEventListener('leavepictureinpicture', () => {
        pipActive = false;
        console.log('Left Picture-in-Picture');
    });
    
    // Trigger PiP when user scrolls to bottom of page
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollPercentage = (scrollPosition / documentHeight) * 100;
            
            // If scrolled to bottom (within 5% of end) and video is playing
            if (scrollPercentage >= 95 && mainVideoPlayer.isPlaying && !pipActive) {
                enterPictureInPicture();
            }
        }, 300);
    });
    
    // Trigger PiP when user switches tabs (page becomes hidden)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && mainVideoPlayer.isPlaying && !pipActive) {
            // User switched tabs - enter PiP
            enterPictureInPicture();
        } else if (!document.hidden && pipActive) {
            // User came back - optionally exit PiP (or keep it)
            // Uncomment below if you want to exit PiP when user returns
            // exitPictureInPicture();
        }
    });
    
    // Make PiP functions available globally
    window.enterPictureInPicture = enterPictureInPicture;
    window.exitPictureInPicture = exitPictureInPicture;
}

// Add parallax effect on scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

