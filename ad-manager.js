// Ad Manager - Limits ads to 7 per session for better UX
(function() {
    'use strict';
    
    const MAX_ADS_PER_SESSION = 7;
    const STORAGE_KEY = 'bbvip_ad_count';
    const AD_LOADED_KEY = 'bbvip_ads_loaded';
    
    // Get current ad count from sessionStorage
    function getAdCount() {
        const count = sessionStorage.getItem(STORAGE_KEY);
        return count ? parseInt(count, 10) : 0;
    }
    
    // Increment ad count
    function incrementAdCount() {
        const currentCount = getAdCount();
        if (currentCount < MAX_ADS_PER_SESSION) {
            sessionStorage.setItem(STORAGE_KEY, (currentCount + 1).toString());
            return true;
        }
        return false;
    }
    
    // Check if we can load more ads
    function canLoadAds() {
        return getAdCount() < MAX_ADS_PER_SESSION;
    }
    
    // Track ad script loading
    function trackAdScript(scriptUrl) {
        const loadedScripts = JSON.parse(sessionStorage.getItem(AD_LOADED_KEY) || '[]');
        if (!loadedScripts.includes(scriptUrl)) {
            loadedScripts.push(scriptUrl);
            sessionStorage.setItem(AD_LOADED_KEY, JSON.stringify(loadedScripts));
        }
    }
    
    // Check if script was already loaded
    function isScriptLoaded(scriptUrl) {
        const loadedScripts = JSON.parse(sessionStorage.getItem(AD_LOADED_KEY) || '[]');
        return loadedScripts.includes(scriptUrl);
    }
    
    // Load ad script conditionally
    function loadAdScript(src, attributes = {}) {
        // Check if we can load more ads
        if (!canLoadAds()) {
            console.log('Ad limit reached (7 ads per session). No more ads will be loaded.');
            return false;
        }
        
        // Check if script was already loaded
        if (isScriptLoaded(src)) {
            return false; // Already loaded
        }
        
        // Increment counter before loading
        if (!incrementAdCount()) {
            return false;
        }
        
        // Track this script
        trackAdScript(src);
        
        // Create and load script
        const script = document.createElement('script');
        script.src = src;
        // Only set async if explicitly specified
        if (attributes.async !== undefined) {
            script.async = attributes.async === true || attributes.async === 'true';
        } else {
            script.async = true; // Default to async for better performance
        }
        
        // Add all other attributes
        Object.keys(attributes).forEach(key => {
            if (key !== 'async' && key !== 'src') {
                if (key === 'data-cfasync' && attributes[key] === 'false') {
                    script.setAttribute('data-cfasync', 'false');
                } else {
                    script.setAttribute(key, attributes[key]);
                }
            }
        });
        
        // Add error handler
        script.onerror = function() {
            // If script fails to load, decrement counter
            const currentCount = getAdCount();
            if (currentCount > 0) {
                sessionStorage.setItem(STORAGE_KEY, (currentCount - 1).toString());
            }
            const loadedScripts = JSON.parse(sessionStorage.getItem(AD_LOADED_KEY) || '[]');
            const index = loadedScripts.indexOf(src);
            if (index > -1) {
                loadedScripts.splice(index, 1);
                sessionStorage.setItem(AD_LOADED_KEY, JSON.stringify(loadedScripts));
            }
        };
        
        document.head.appendChild(script);
        console.log(`Ad script loaded: ${src} (${getAdCount()}/${MAX_ADS_PER_SESSION} ads this session)`);
        return true;
    }
    
    // Initialize ad loading on page load
    function initAds() {
        // Find and track ad scripts (don't remove/re-add, just track)
        document.querySelectorAll('script[data-ad-script="true"], script[src*="quge5.com"]').forEach(quge5Script => {
            if (quge5Script.src && !isScriptLoaded(quge5Script.src)) {
                const src = quge5Script.src;
                
                // Only track if we haven't reached the limit
                if (canLoadAds()) {
                    if (incrementAdCount()) {
                        trackAdScript(src);
                        console.log(`Ad script tracked: ${src} (${getAdCount()}/${MAX_ADS_PER_SESSION} ads this session)`);
                    }
                } else {
                    // Limit reached, remove script to prevent loading
                    console.log('Ad limit reached. Removing ad script:', src);
                    quge5Script.remove();
                }
            }
        });
    }
    
    // Expose API
    window.AdManager = {
        getAdCount: getAdCount,
        canLoadAds: canLoadAds,
        loadAdScript: loadAdScript,
        MAX_ADS: MAX_ADS_PER_SESSION
    };
    
    // Initialize immediately (runs as soon as script loads)
    // This ensures we intercept ad scripts before they load
    // But we need to be careful not to break scripts that are already loading
    if (document.readyState === 'loading') {
        // If DOM is still loading, wait for it
        document.addEventListener('DOMContentLoaded', initAds);
    } else {
        // DOM already loaded, run immediately
        initAds();
    }
    
    // Also run after a short delay to catch any scripts that might load later
    setTimeout(initAds, 50);
    
    // Monitor for dynamically added ad scripts (but don't interfere with initial load)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeName === 'SCRIPT' && node.src) {
                    // Check if it's an ad script
                    if (node.src.includes('quge5.com') || 
                        node.src.includes('5gvci.com') ||
                        (node.src.includes('googletagmanager.com') && node.src.includes('pubads'))) {
                        // Only handle if limit not reached
                        if (!canLoadAds()) {
                            node.remove();
                        } else if (!isScriptLoaded(node.src)) {
                            // Track it if not already tracked
                            if (incrementAdCount()) {
                                trackAdScript(node.src);
                                console.log(`Ad script tracked: ${node.src} (${getAdCount()}/${MAX_ADS_PER_SESSION} ads this session)`);
                            } else {
                                node.remove();
                            }
                        }
                    }
                }
            });
        });
    });
    
    // Start observing after a delay to avoid interfering with initial script loads
    setTimeout(() => {
        observer.observe(document.head, {
            childList: true,
            subtree: true
        });
    }, 200);
})();

