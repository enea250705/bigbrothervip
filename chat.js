// Live Chat and Viewer Counter using Firebase Realtime Database
// No backend required - Firebase handles everything (free tier available)
//
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use existing)
// 3. Enable "Realtime Database" (not Firestore)
// 4. Set database rules to:
//    {
//      "rules": {
//        "chats": {
//          ".read": true,
//          ".write": true
//        },
//        "viewers": {
//          ".read": true,
//          ".write": true
//        }
//      }
//    }
// 5. Get your config from Project Settings > General > Your apps
// 6. Replace the firebaseConfig below with your actual credentials

// Firebase configuration - REPLACE WITH YOUR OWN
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/"
};

// Check if Firebase is configured
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" && 
                             firebaseConfig.databaseURL !== "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/";

// Initialize Firebase (only if not already initialized)
if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded. Please add Firebase scripts to HTML.');
} else if (!isFirebaseConfigured) {
    console.warn('Firebase not configured. Please update firebaseConfig in chat.js with your Firebase credentials.');
    console.warn('Live chat and viewer counter will not work until Firebase is configured.');
} else {
    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    const database = firebase.database();
    
    // Generate unique user ID for this session
    function getUserId() {
        let userId = sessionStorage.getItem('bbvip_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('bbvip_user_id', userId);
        }
        return userId;
    }
    
    // Generate random username if not set
    function getUsername() {
        let username = sessionStorage.getItem('bbvip_username');
        if (!username) {
            const adjectives = ['Super', 'Mega', 'Ultra', 'Pro', 'Elite', 'Top', 'Best', 'Cool'];
            const nouns = ['Shikues', 'Fan', 'Mbështetës', 'Dashamirës', 'Adhurues'];
            username = adjectives[Math.floor(Math.random() * adjectives.length)] + 
                      nouns[Math.floor(Math.random() * nouns.length)] + 
                      Math.floor(Math.random() * 1000);
            sessionStorage.setItem('bbvip_username', username);
        }
        return username;
    }
    
    // Live Chat Manager
    class LiveChat {
        constructor(channelNum) {
            this.channelNum = channelNum;
            this.userId = getUserId();
            this.username = getUsername();
            this.messagesRef = database.ref(`chats/channel${channelNum}/messages`);
            this.viewersRef = database.ref(`viewers/channel${channelNum}`);
            this.userViewerRef = null;
            this.maxMessages = 50; // Keep last 50 messages
        }
        
        // Initialize chat
        init() {
            this.setupChatUI();
            this.setupViewerCounter();
            this.setupMessageListener();
            this.registerViewer();
        }
        
        // Setup chat UI
        setupChatUI() {
            const container = document.getElementById(`kanali${this.channelNum}Container`);
            if (!container) return;
            
            // Create chat container
            const chatContainer = document.createElement('div');
            chatContainer.className = 'live-chat-container';
            chatContainer.id = `chatContainer${this.channelNum}`;
            chatContainer.innerHTML = `
                <div class="chat-header">
                    <h3>💬 Chat Live - Kanali ${this.channelNum}</h3>
                    <button class="chat-toggle-btn" onclick="toggleChat(${this.channelNum})">−</button>
                </div>
                <div class="chat-messages" id="chatMessages${this.channelNum}">
                    <div class="chat-loading">Duke ngarkuar mesazhet...</div>
                </div>
                <div class="chat-input-container">
                    <input type="text" 
                           id="chatInput${this.channelNum}" 
                           class="chat-input" 
                           placeholder="Shkruaj një mesazh..."
                           maxlength="200">
                    <button class="chat-send-btn" onclick="sendMessage(${this.channelNum})">Dërgo</button>
                </div>
            `;
            
            // Insert after video wrapper
            const videoWrapper = container.querySelector('.video-wrapper');
            if (videoWrapper) {
                videoWrapper.parentNode.insertBefore(chatContainer, videoWrapper.nextSibling);
            }
            
            // Enter key to send
            const input = document.getElementById(`chatInput${this.channelNum}`);
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.sendMessage();
                    }
                });
            }
        }
        
        // Setup message listener
        setupMessageListener() {
            this.messagesRef.limitToLast(this.maxMessages).on('child_added', (snapshot) => {
                const message = snapshot.val();
                this.displayMessage(message);
            });
        }
            
        // Display message
        displayMessage(message) {
            const messagesContainer = document.getElementById(`chatMessages${this.channelNum}`);
            if (!messagesContainer) return;
            
            // Remove loading message
            const loading = messagesContainer.querySelector('.chat-loading');
            if (loading) loading.remove();
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'chat-message';
            if (message.userId === this.userId) {
                messageDiv.classList.add('own-message');
            }
            
            const time = new Date(message.timestamp).toLocaleTimeString('sq-AL', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            messageDiv.innerHTML = `
                <div class="message-header">
                    <span class="message-username">${this.escapeHtml(message.username)}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-text">${this.escapeHtml(message.text)}</div>
            `;
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // Send message
        sendMessage() {
            const input = document.getElementById(`chatInput${this.channelNum}`);
            if (!input) return;
            
            const text = input.value.trim();
            if (!text) return;
            
            // Create message
            const message = {
                userId: this.userId,
                username: this.username,
                text: text,
                timestamp: Date.now(),
                channel: this.channelNum
            };
            
            // Push to Firebase
            this.messagesRef.push(message)
                .then(() => {
                    input.value = '';
                })
                .catch((error) => {
                    console.error('Error sending message:', error);
                    alert('Gabim në dërgimin e mesazhit. Ju lutem provoni përsëri.');
                });
        }
        
        // Setup viewer counter
        setupViewerCounter() {
            // Listen for viewer count changes
            this.viewersRef.on('value', (snapshot) => {
                const viewers = snapshot.val();
                const count = viewers ? Object.keys(viewers).length : 0;
                this.updateViewerCount(count);
            });
        }
        
        // Update viewer count display
        updateViewerCount(count) {
            const viewerElement = document.getElementById(`viewerCount${this.channelNum}`);
            if (viewerElement) {
                viewerElement.textContent = count.toLocaleString('sq-AL');
            }
        }
        
        // Register as viewer
        registerViewer() {
            this.userViewerRef = this.viewersRef.child(this.userId);
            this.userViewerRef.set({
                timestamp: Date.now(),
                username: this.username
            });
            
            // Update timestamp every 30 seconds to stay active
            setInterval(() => {
                if (this.userViewerRef) {
                    this.userViewerRef.update({
                        timestamp: Date.now()
                    });
                }
            }, 30000);
            
            // Remove viewer when page unloads
            window.addEventListener('beforeunload', () => {
                if (this.userViewerRef) {
                    this.userViewerRef.remove();
                }
            });
            
            // Clean up inactive viewers (older than 1 minute)
            this.viewersRef.once('value', (snapshot) => {
                const viewers = snapshot.val();
                if (viewers) {
                    const now = Date.now();
                    Object.keys(viewers).forEach(userId => {
                        const viewer = viewers[userId];
                        if (now - viewer.timestamp > 60000) {
                            this.viewersRef.child(userId).remove();
                        }
                    });
                }
            });
        }
        
        // Escape HTML to prevent XSS
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }
    
    // Global functions for chat
    window.sendMessage = function(channelNum) {
        if (window.chatInstances && window.chatInstances[channelNum]) {
            window.chatInstances[channelNum].sendMessage();
        }
    };
    
    window.toggleChat = function(channelNum) {
        const container = document.getElementById(`chatContainer${channelNum}`);
        if (container) {
            container.classList.toggle('chat-collapsed');
            const btn = container.querySelector('.chat-toggle-btn');
            if (btn) {
                btn.textContent = container.classList.contains('chat-collapsed') ? '+' : '−';
            }
        }
    };
    
    // Initialize chats when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for containers to be available
        setTimeout(() => {
            if (!isFirebaseConfigured) {
                // Show setup message in chat containers
                const containers = ['kanali1Container', 'kanali2Container'];
                containers.forEach(containerId => {
                    const container = document.getElementById(containerId);
                    if (container) {
                        const chatContainer = document.createElement('div');
                        chatContainer.className = 'live-chat-container';
                        chatContainer.innerHTML = `
                            <div class="chat-header">
                                <h3>💬 Chat Live</h3>
                            </div>
                            <div class="chat-messages" style="display: flex; align-items: center; justify-content: center; padding: 40px;">
                                <div style="text-align: center; color: var(--text-gray);">
                                    <p style="margin-bottom: 10px;">⚠️ Firebase nuk është konfiguruar</p>
                                    <p style="font-size: 12px;">Ju lutem konfiguroni Firebase në chat.js për të aktivizuar chat-in live dhe numëruesin e shikuesve.</p>
                                </div>
                            </div>
                        `;
                        const videoWrapper = container.querySelector('.video-wrapper');
                        if (videoWrapper) {
                            videoWrapper.parentNode.insertBefore(chatContainer, videoWrapper.nextSibling);
                        }
                    }
                });
                return;
            }
            
            window.chatInstances = {};
            
            // Initialize chat for Kanali 1
            const container1 = document.getElementById('kanali1Container');
            if (container1) {
                window.chatInstances[1] = new LiveChat(1);
                window.chatInstances[1].init();
            }
            
            // Initialize chat for Kanali 2
            const container2 = document.getElementById('kanali2Container');
            if (container2) {
                window.chatInstances[2] = new LiveChat(2);
                window.chatInstances[2].init();
            }
        }, 1000);
    });
}

