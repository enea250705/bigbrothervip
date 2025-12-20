// Simple Real-Time Viewer Counter using Pusher (Free Tier)
// Much simpler than Firebase - just counts active viewers

// Simple viewer counter - No external service needed!
// Uses localStorage + BroadcastChannel for real-time updates across tabs
// Works across different users on the same device/browser

// Simple viewer counter class
class SimpleViewerCounter {
    constructor(channelNum) {
        this.channelNum = channelNum;
        this.viewerCount = 0;
        this.isActive = true;
        this.channelName = `channel-${channelNum}`;
        
        // Initialize
        this.init();
    }
    
    init() {
        console.log(`[ViewerCounter] Initializing for channel ${this.channelNum}`);
        this.useSimpleCounter();
    }
    
    // Simple counter using localStorage + BroadcastChannel for cross-tab communication
    useSimpleCounter() {
        console.log('[ViewerCounter] Using simple counter method');
        
        // Generate unique session ID for this tab
        const sessionId = 'viewer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const storageKey = `bbvip_viewer_${this.channelNum}`;
        
        // Use BroadcastChannel for real-time updates across tabs
        let broadcastChannel = null;
        try {
            broadcastChannel = new BroadcastChannel(`bbvip_viewers_${this.channelNum}`);
            broadcastChannel.onmessage = (event) => {
                if (event.data.type === 'viewer_update') {
                    this.viewerCount = event.data.count;
                    this.updateDisplay();
                }
            };
        } catch (e) {
            console.log('[ViewerCounter] BroadcastChannel not supported, using localStorage only');
        }
        
        // Register this viewer
        const registerViewer = () => {
            const viewers = JSON.parse(localStorage.getItem(storageKey) || '{}');
            viewers[sessionId] = Date.now();
            localStorage.setItem(storageKey, JSON.stringify(viewers));
            
            // Broadcast update
            if (broadcastChannel) {
                broadcastChannel.postMessage({
                    type: 'viewer_joined',
                    sessionId: sessionId,
                    channel: this.channelNum
                });
            }
        };
        
        registerViewer();
        
        // Update count every 3 seconds
        const updateCount = () => {
            if (!this.isActive) return;
            
            const now = Date.now();
            const viewers = JSON.parse(localStorage.getItem(storageKey) || '{}');
            const activeViewers = {};
            
            // Clean up old viewers (inactive for 30 seconds) and update active ones
            Object.keys(viewers).forEach(id => {
                if (now - viewers[id] < 30000) {
                    activeViewers[id] = viewers[id];
                }
            });
            
            // Update this viewer's timestamp
            activeViewers[sessionId] = now;
            localStorage.setItem(storageKey, JSON.stringify(activeViewers));
            
            // Count active viewers
            const newCount = Object.keys(activeViewers).length;
            if (newCount !== this.viewerCount) {
                this.viewerCount = newCount;
                this.updateDisplay();
                
                // Broadcast update
                if (broadcastChannel) {
                    broadcastChannel.postMessage({
                        type: 'viewer_update',
                        count: newCount,
                        channel: this.channelNum
                    });
                }
            }
        };
        
        // Initial count
        updateCount();
        
        // Update periodically
        setInterval(updateCount, 3000);
        
        // Clean up on page unload
        const cleanup = () => {
            this.isActive = false;
            const viewers = JSON.parse(localStorage.getItem(storageKey) || '{}');
            delete viewers[sessionId];
            localStorage.setItem(storageKey, JSON.stringify(viewers));
            
            if (broadcastChannel) {
                broadcastChannel.postMessage({
                    type: 'viewer_left',
                    sessionId: sessionId,
                    channel: this.channelNum
                });
            }
        };
        
        window.addEventListener('beforeunload', cleanup);
        window.addEventListener('pagehide', cleanup);
    }
    
    updateDisplay() {
        const currentViewerCount = document.getElementById('currentViewerCount');
        if (currentViewerCount) {
            const currentChannel = window.currentChannel || 1;
            if (this.channelNum === currentChannel) {
                currentViewerCount.textContent = this.viewerCount.toLocaleString('sq-AL');
            }
        }
        
        // Store for later use
        window.viewerCounts = window.viewerCounts || {};
        window.viewerCounts[this.channelNum] = this.viewerCount;
    }
}

// Initialize viewer counters when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('[ViewerCounter] Initializing counters...');
        window.viewerCounters = {
            1: new SimpleViewerCounter(1),
            2: new SimpleViewerCounter(2)
        };
        
        // Update display when channel switches
        if (window.switchChannel) {
            const originalSwitchChannel = window.switchChannel;
            window.switchChannel = function(channelNum) {
                originalSwitchChannel(channelNum);
                // Update viewer count display
                if (window.viewerCounters && window.viewerCounters[channelNum]) {
                    window.viewerCounters[channelNum].updateDisplay();
                }
            };
        }
    }, 1000);
});

