// Live Chat and Viewer Counter using Firebase Realtime Database
// No backend required - Firebase handles everything (free tier available)
//
// SETUP INSTRUCTIONS:

console.log('🔵 chat.js file loaded and executing...');
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

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDf1OOWES1HSpA2enw33DOUZif-y_tZYFM",
    authDomain: "bbvip-63bea.firebaseapp.com",
    databaseURL: "https://bbvip-63bea-default-rtdb.firebaseio.com",
    projectId: "bbvip-63bea",
    storageBucket: "bbvip-63bea.firebasestorage.app",
    messagingSenderId: "320903242040",
    appId: "1:320903242040:web:3ab09533252cfe5a6ca1cd"
};

// Check if Firebase is configured
const isFirebaseConfigured = firebaseConfig.apiKey && 
                             firebaseConfig.databaseURL &&
                             firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

// Initialize Firebase (only if not already initialized)
console.log('🔵 Checking Firebase SDK...');
console.log('🔵 typeof firebase:', typeof firebase);
console.log('🔵 isFirebaseConfigured:', isFirebaseConfigured);

if (typeof firebase === 'undefined') {
    console.error('❌ Firebase SDK not loaded. Please add Firebase scripts to HTML.');
    console.error('Make sure these scripts are in <head>:');
    console.error('  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>');
    console.error('  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>');
} else if (!isFirebaseConfigured) {
    console.warn('⚠️ Firebase not configured. Please update firebaseConfig in chat.js with your Firebase credentials.');
    console.warn('Live chat and viewer counter will not work until Firebase is configured.');
} else {
    console.log('✅ Firebase SDK loaded');
    console.log('✅ Firebase config found');
    
    // Initialize Firebase
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized successfully');
        } else {
            console.log('✅ Firebase already initialized');
        }
        
        const database = firebase.database();
        console.log('✅ Firebase database reference created');
        
        // Test Firebase connection
        const testRef = database.ref('.info/connected');
        testRef.on('value', (snapshot) => {
            if (snapshot.val() === true) {
                console.log('✅ Firebase Realtime Database connected!');
            } else {
                console.warn('⚠️ Firebase Realtime Database not connected');
            }
        });
        
        // Test write permission
        const testWriteRef = database.ref('test');
        testWriteRef.set({ test: Date.now() }).then(() => {
            console.log('✅ Firebase write permission OK');
            testWriteRef.remove(); // Clean up
        }).catch((error) => {
            console.error('❌ Firebase write permission error:', error);
            console.error('Please check Firebase Realtime Database rules!');
        });
        
        // Make database available globally for chat functions
        window.firebaseDatabase = database;
    
    // Generate unique user ID (persists across sessions)
    function getUserId() {
        let userId = localStorage.getItem('bbvip_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('bbvip_user_id', userId);
        }
        return userId;
    }
    
    // Get username from localStorage (persists across sessions)
    function getUsername() {
        return localStorage.getItem('bbvip_username') || null;
    }
    
    // Set username in localStorage
    function setUsername(username) {
        if (username && username.trim().length > 0) {
            localStorage.setItem('bbvip_username', username.trim());
            return true;
        }
        return false;
    }
    
    // Show username picker modal (cannot be closed without username)
    function showUsernamePicker(callback) {
        // Check if modal already exists
        let modal = document.getElementById('usernamePickerModal');
        if (modal) {
            modal.style.display = 'flex';
            return;
        }
        
        // Create modal (no close button, cannot click outside)
        modal = document.createElement('div');
        modal.id = 'usernamePickerModal';
        modal.className = 'username-modal';
        modal.innerHTML = `
            <div class="username-modal-content">
                <h2>⚠️ Emri Kërkohet për Chat</h2>
                <p style="color: var(--text-gray); margin-bottom: 20px; font-size: 14px;">
                    Duhet të zgjidhni një emër për të marrë pjesë në chat. Ky emër do të ruhet dhe do të përdoret përsëri kur të ktheheni.
                </p>
                <input type="text" 
                       id="usernameInput" 
                       class="username-input" 
                       placeholder="Shkruani emrin tuaj (2-20 karaktere)..."
                       maxlength="20"
                       autocomplete="off"
                       required>
                <div class="username-actions">
                    <button class="username-submit-btn" onclick="submitUsername()">Hyr në Chat</button>
                </div>
                <p style="color: var(--text-gray); font-size: 12px; margin-top: 15px; text-align: center;">
                    <strong>Obligative:</strong> Emri duhet të jetë midis 2-20 karaktereve
                </p>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Prevent closing modal by clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                // Don't close - show message
                const input = document.getElementById('usernameInput');
                if (input && !input.value.trim()) {
                    input.style.borderColor = '#ff4444';
                    input.style.animation = 'shake 0.5s';
                    setTimeout(() => {
                        input.style.animation = '';
                    }, 500);
                }
            }
        });
        
        // Prevent ESC key from closing
        document.addEventListener('keydown', function preventEsc(e) {
            if (e.key === 'Escape' && document.getElementById('usernamePickerModal')) {
                e.preventDefault();
                e.stopPropagation();
                const input = document.getElementById('usernameInput');
                if (input) {
                    input.focus();
                    input.style.borderColor = '#ff4444';
                    input.style.animation = 'shake 0.5s';
                    setTimeout(() => {
                        input.style.animation = '';
                    }, 500);
                }
            }
        }, { once: false });
        
        // Focus input
        setTimeout(() => {
            const input = document.getElementById('usernameInput');
            if (input) {
                input.focus();
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        submitUsername();
                    }
                });
            }
        }, 100);
        
        // Store callback
        modal._callback = callback;
    }
    
    // Submit username
    window.submitUsername = function() {
        const input = document.getElementById('usernameInput');
        if (!input) return;
        
        const username = input.value.trim();
        
        // Validate username
        if (username.length < 2) {
            alert('Emri duhet të jetë të paktën 2 karaktere.');
            return;
        }
        if (username.length > 20) {
            alert('Emri nuk mund të jetë më shumë se 20 karaktere.');
            return;
        }
        
        // Set username
        if (setUsername(username)) {
            const modal = document.getElementById('usernamePickerModal');
            if (modal) {
                modal.style.display = 'none';
                if (modal._callback) {
                    modal._callback(username);
                }
            }
        }
    };
    
    // Live Chat Manager
    class LiveChat {
        constructor(channelNum) {
            this.channelNum = channelNum;
            this.userId = getUserId();
            this.username = getUsername();
            this.messagesRef = database.ref(`chats/channel${channelNum}/messages`);
            this.viewersRef = database.ref(`viewers/channel${channelNum}`);
            this.userViewerRef = null;
            this.maxMessages = 100; // Keep last 100 messages (increased for persistence)
            this.messagesLoaded = false;
        }
        
        // Initialize chat
        init() {
            // Check if username is set
            if (!this.username) {
                showUsernamePicker((username) => {
                    this.username = username;
                    this.setupChatUI();
                    this.setupViewerCounter();
                    this.setupMessageListener();
                    this.registerViewer();
                });
                return;
            }
            
            this.setupChatUI();
            this.setupViewerCounter();
            this.setupMessageListener();
            this.registerViewer();
        }
        
        // Setup chat UI
        setupChatUI() {
            console.log(`Setting up chat UI for channel ${this.channelNum}`);
            
            // Use mainStreamContainer (single container for both channels)
            const container = document.getElementById('mainStreamContainer');
            if (!container) {
                console.error(`Channel ${this.channelNum}: mainStreamContainer not found`);
                return;
            }
            
            // Check if chat container already exists
            let chatContainer = document.getElementById(`chatContainer${this.channelNum}`);
            if (chatContainer) {
                console.log(`Chat container ${this.channelNum} already exists`);
                // Update existing chat container
                chatContainer.style.display = 'none'; // Hide by default, show when channel matches
                return;
            }
            
            console.log(`Creating chat container for channel ${this.channelNum}`);
            
            // Create chat container
            chatContainer = document.createElement('div');
            chatContainer.className = 'live-chat-container';
            chatContainer.id = `chatContainer${this.channelNum}`;
            chatContainer.style.display = 'none'; // Hidden by default, shown when channel is active
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
                           placeholder="${this.username ? 'Shkruaj një mesazh...' : 'Duhet emër për të dërguar mesazhe...'}"
                           maxlength="200"
                           ${!this.username ? 'disabled' : ''}>
                    <button class="chat-send-btn" onclick="sendMessage(${this.channelNum})" ${!this.username ? 'disabled' : ''}>Dërgo</button>
                </div>
            `;
            
            // Insert after video wrapper
            const videoWrapper = container.querySelector('.video-wrapper');
            if (videoWrapper) {
                videoWrapper.parentNode.insertBefore(chatContainer, videoWrapper.nextSibling);
                console.log(`Chat container ${this.channelNum} inserted after video wrapper`);
            } else {
                // Fallback: append to container
                container.appendChild(chatContainer);
                console.log(`Chat container ${this.channelNum} appended to main container`);
            }
            
            console.log(`Chat container ${this.channelNum} created successfully`);
            
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
        
        // Setup message listener (loads all existing messages + new ones)
        setupMessageListener() {
            const messagesContainer = document.getElementById(`chatMessages${this.channelNum}`);
            
            // First, load all existing messages
            this.messagesRef.limitToLast(this.maxMessages).once('value', (snapshot) => {
                const messages = snapshot.val();
                if (messages) {
                    // Remove loading message
                    const loading = messagesContainer.querySelector('.chat-loading');
                    if (loading) loading.remove();
                    
                    // Sort messages by timestamp
                    const sortedMessages = Object.values(messages).sort((a, b) => a.timestamp - b.timestamp);
                    
                    // Display all existing messages
                    sortedMessages.forEach(message => {
                        this.displayMessage(message, false); // false = don't scroll
                    });
                    
                    // Scroll to bottom after loading all messages
                    setTimeout(() => {
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }, 100);
                } else {
                    // No messages yet, remove loading
                    const loading = messagesContainer.querySelector('.chat-loading');
                    if (loading) loading.remove();
                }
                this.messagesLoaded = true;
            });
            
            // Then listen for new messages
            this.messagesRef.limitToLast(this.maxMessages).on('child_added', (snapshot) => {
                // Only display if we've already loaded existing messages (to avoid duplicates)
                if (this.messagesLoaded) {
                    const message = snapshot.val();
                    this.displayMessage(message, true); // true = scroll to bottom
                }
            });
        }
            
        // Display message
        displayMessage(message, scrollToBottom = true) {
            const messagesContainer = document.getElementById(`chatMessages${this.channelNum}`);
            if (!messagesContainer) return;
            
            // Check if message already exists (prevent duplicates)
            const existingMessage = messagesContainer.querySelector(`[data-message-id="${message.timestamp}_${message.userId}"]`);
            if (existingMessage) return;
            
            // Remove loading message
            const loading = messagesContainer.querySelector('.chat-loading');
            if (loading) loading.remove();
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'chat-message';
            messageDiv.setAttribute('data-message-id', `${message.timestamp}_${message.userId}`);
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
            
            if (scrollToBottom) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }
        
        // Send message (only if username is set)
        sendMessage() {
            // Check if username is set
            if (!this.username) {
                alert('Duhet të zgjidhni një emër për të dërguar mesazhe. Ju lutem rifreskoni faqen dhe zgjidhni emrin tuaj.');
                showUsernamePicker((username) => {
                    this.username = username;
                    // Try sending again
                    setTimeout(() => this.sendMessage(), 100);
                });
                return;
            }
            
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
    
    // Function to update chat visibility based on current channel
    function updateChatVisibility(channelNum) {
        console.log(`Updating chat visibility to channel ${channelNum}`);
        
        // Hide all chat containers
        const chat1 = document.getElementById('chatContainer1');
        const chat2 = document.getElementById('chatContainer2');
        if (chat1) {
            chat1.style.display = 'none';
            console.log('Hiding chat 1');
        }
        if (chat2) {
            chat2.style.display = 'none';
            console.log('Hiding chat 2');
        }
        
        // Show chat for current channel
        const currentChat = document.getElementById(`chatContainer${channelNum}`);
        if (currentChat) {
            currentChat.style.display = 'block';
            console.log(`Showing chat for channel ${channelNum}`);
        } else {
            console.error(`Chat container ${channelNum} not found!`);
        }
    }
    
    // Make updateChatVisibility available globally
    window.updateChatVisibility = updateChatVisibility;
    
    // Initialize chats when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for containers to be available
        setTimeout(() => {
            if (!isFirebaseConfigured) {
                // Show setup message in main container
                const mainContainer = document.getElementById('mainStreamContainer');
                if (mainContainer) {
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
                    const videoWrapper = mainContainer.querySelector('.video-wrapper');
                    if (videoWrapper) {
                        videoWrapper.parentNode.insertBefore(chatContainer, videoWrapper.nextSibling);
                    }
                }
                return;
            }
            
            window.chatInstances = {};
            
            // Initialize chat for both channels (using single mainStreamContainer)
            const mainContainer = document.getElementById('mainStreamContainer');
            console.log('Main container found:', !!mainContainer);
            
            if (mainContainer) {
                // Initialize chat for Kanali 1
                console.log('Initializing chat for Kanali 1');
                window.chatInstances[1] = new LiveChat(1);
                window.chatInstances[1].init();
                
                // Initialize chat for Kanali 2
                console.log('Initializing chat for Kanali 2');
                window.chatInstances[2] = new LiveChat(2);
                window.chatInstances[2].init();
                
                // Show chat for current channel (default is channel 1)
                console.log('Showing chat for channel 1');
                updateChatVisibility(1);
                
                // Listen for channel changes to show/hide appropriate chat
                const channelTabs = document.querySelectorAll('.channel-tab-btn');
                console.log('Channel tabs found:', channelTabs.length);
                channelTabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        const channelNum = parseInt(tab.getAttribute('data-channel'));
                        console.log('Channel switched to:', channelNum);
                        updateChatVisibility(channelNum);
                    });
                });
            } else {
                console.error('mainStreamContainer not found! Chat cannot be initialized.');
            }
        }, 1000);
    });
    
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        console.error('Error details:', error.message);
        console.error('Please check:');
        console.error('1. Firebase project exists and is active');
        console.error('2. Realtime Database is enabled (not Firestore)');
        console.error('3. Database rules allow read/write');
        console.error('4. Domain is authorized (if using Authentication)');
    }
}

