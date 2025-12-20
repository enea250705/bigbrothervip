// Simple Real-Time Viewer Counter
// Uses Firebase Realtime Database (already set up for chat)
// When user enters: count goes up
// When user leaves: count goes down

console.log('🔵 viewer-counter.js loaded');

// Simple Viewer Counter Class
class SimpleViewerCounter {
    constructor(channelNum) {
        this.channelNum = channelNum;
        this.viewerCount = 0;
        this.userId = null;
        this.viewerRef = null;
        
        // Initialize
        this.init();
    }
    
    init() {
        console.log(`[ViewerCounter] Initializing for channel ${this.channelNum}`);
        
        // Check if Firebase is available
        if (typeof firebase === 'undefined' || !firebase.database) {
            console.error('[ViewerCounter] Firebase not available');
            this.showFallbackCount();
            return;
        }
        
        try {
            // Use Firebase database (already initialized in chat.js)
            const database = firebase.database();
            const viewersRef = database.ref(`viewers/channel_${this.channelNum}`);
            
            // Generate unique user ID for this session
            this.userId = 'viewer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            this.viewerRef = viewersRef.child(this.userId);
            
            console.log(`[ViewerCounter] User ID: ${this.userId}`);
            
            // Register as active viewer
            this.viewerRef.set({
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                channel: this.channelNum
            }).then(() => {
                console.log(`[ViewerCounter] Registered as viewer for channel ${this.channelNum}`);
            }).catch((error) => {
                console.error('[ViewerCounter] Error registering viewer:', error);
            });
            
            // Listen for viewer count changes
            viewersRef.on('value', (snapshot) => {
                const viewers = snapshot.val();
                if (viewers) {
                    const count = Object.keys(viewers).length;
                    this.viewerCount = count;
                    this.updateDisplay();
                    console.log(`[ViewerCounter] Channel ${this.channelNum} now has ${count} viewers`);
                } else {
                    this.viewerCount = 0;
                    this.updateDisplay();
                }
            }, (error) => {
                console.error('[ViewerCounter] Error reading viewer count:', error);
            });
            
            // Remove viewer when page unloads
            window.addEventListener('beforeunload', () => {
                this.removeViewer();
            });
            
            window.addEventListener('pagehide', () => {
                this.removeViewer();
            });
            
            // Also remove on visibility change (tab hidden for > 30 seconds)
            let hiddenTime = null;
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    hiddenTime = Date.now();
                } else {
                    if (hiddenTime && Date.now() - hiddenTime > 30000) {
                        // Tab was hidden for more than 30 seconds, remove viewer
                        this.removeViewer();
                    }
                    hiddenTime = null;
                }
            });
            
        } catch (error) {
            console.error('[ViewerCounter] Error initializing:', error);
            this.showFallbackCount();
        }
    }
    
    removeViewer() {
        if (this.viewerRef) {
            console.log(`[ViewerCounter] Removing viewer ${this.userId} from channel ${this.channelNum}`);
            this.viewerRef.remove().catch((error) => {
                console.error('[ViewerCounter] Error removing viewer:', error);
            });
        }
    }
    
    updateDisplay() {
        const currentViewerCount = document.getElementById('currentViewerCount');
        if (currentViewerCount) {
            const currentChannel = window.currentChannel || 1;
            if (this.channelNum === currentChannel) {
                currentViewerCount.textContent = this.viewerCount.toLocaleString('sq-AL');
                console.log(`[ViewerCounter] Updated display to: ${this.viewerCount}`);
            }
        }
        
        // Store for later use
        window.viewerCounts = window.viewerCounts || {};
        window.viewerCounts[this.channelNum] = this.viewerCount;
    }
    
    showFallbackCount() {
        // Fallback: show a static count
        this.viewerCount = 1;
        this.updateDisplay();
    }
}

// Initialize viewer counters when DOM and Firebase are ready
function initializeViewerCounters() {
    // Wait for Firebase to be ready
    if (typeof firebase === 'undefined' || !firebase.database) {
        console.log('[ViewerCounter] Waiting for Firebase...');
        setTimeout(initializeViewerCounters, 500);
        return;
    }
    
    // Wait a bit more for Firebase to fully initialize
    setTimeout(() => {
        console.log('[ViewerCounter] Initializing counters...');
        window.viewerCounters = {
            1: new SimpleViewerCounter(1),
            2: new SimpleViewerCounter(2)
        };
        
        // Update display when channel switches
        const originalSwitchChannel = window.switchChannel;
        if (originalSwitchChannel) {
            window.switchChannel = function(channelNum) {
                originalSwitchChannel(channelNum);
                // Update viewer count display
                if (window.viewerCounters && window.viewerCounters[channelNum]) {
                    window.viewerCounters[channelNum].updateDisplay();
                }
            };
        }
    }, 1000);
}

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeViewerCounters);
} else {
    initializeViewerCounters();
}
