/**
 * YouTube IFrame API Override Script & Intelligent Memory Culling
 * Desktop: Initializes players normally with API to bypass strict block.
 * Mobile (< 768px): Replaces heavy iframes with native YouTube app links to prevent crashing.
 */

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.isUserInteracted = false;

// Global Touch Unlocker for Desktop (Ensures audio/video context unblocks if we need to force play on Desktop too)
window.addEventListener('touchstart', function unlockVideo() {
    window.isUserInteracted = true;
    document.querySelectorAll('iframe[src*="youtube"]').forEach(iframe => {
        if(iframe.src && iframe.contentWindow) {
           iframe.contentWindow.postMessage(JSON.stringify({ "event": "command", "func": "mute", "args": [] }), "*");
           iframe.contentWindow.postMessage(JSON.stringify({ "event": "command", "func": "playVideo", "args": [] }), "*");
        }
    });
    window.removeEventListener('touchstart', unlockVideo);
}, {once: true});


window.onYouTubeIframeAPIReady = function() {
    const isMobile = window.innerWidth < 768; // standard viewport breakpoint separating tablets/mobile
    const iframes = document.querySelectorAll('iframe[src*="youtube"]');
    
    iframes.forEach((iframe, index) => {
        let currentSrc = iframe.getAttribute('src') || iframe.getAttribute('data-src');
        if (!currentSrc) return;

        if (isMobile) {
            // MOBILE DOM MANIPULATION -> High-Res Thumbnails & Native Links
            
            // Extract Video ID using Regex
            const videoIdMatch = currentSrc.match(/embed\/([^?]+)/);
            if (videoIdMatch && videoIdMatch[1]) {
                const videoId = videoIdMatch[1];
                const wrapper = iframe.parentElement;

                // 1. Inject Cinematic Background Thumbnail
                wrapper.style.backgroundImage = `url('https://img.youtube.com/vi/${videoId}/maxresdefault.jpg')`;
                wrapper.style.backgroundSize = 'cover';
                wrapper.style.backgroundPosition = 'center';
                
                // 2. Remove CSS Pointer blocking on the wrapper container if it exists
                wrapper.classList.remove('pointer-events-none');

                // 3. Destroy <iframe> node instantly to prevent ANY iOS WebKit memory payload parsing
                iframe.remove();
                
                // 4. Create proper Youtube Anchor Wrapper over the entire panel space
                const ytAnchor = document.createElement('a');
                ytAnchor.href = `https://www.youtube.com/watch?v=${videoId}`;
                ytAnchor.target = "_blank";
                ytAnchor.className = "absolute inset-0 z-50 flex items-center justify-center bg-black/30 hover:bg-black/10 transition-colors group cursor-pointer";
                
                // 5. Build sleek animated SVG Youtube Icon
                ytAnchor.innerHTML = `
                    <svg xmlns="http://www.w.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-16 h-16 md:w-20 md:h-20 text-[#ff0000] drop-shadow-[0_0_15px_rgba(255,0,0,0.4)] transition-transform duration-500 group-hover:scale-110">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                `;

                // Link added to DOM
                wrapper.appendChild(ytAnchor);
            }

        } else {
            // DESKTOP / TABLET (`innerWidth >= 768px`) -> Native Embeds & Autoplay overrides
            
            // Apply programmatic parameters
            if (!currentSrc.includes('enablejsapi=1')) {
                currentSrc += currentSrc.includes('?') ? '&enablejsapi=1' : '?enablejsapi=1';
            }
            if (!currentSrc.includes('origin=')) {
                currentSrc += '&origin=' + window.location.origin;
            }
            if (!currentSrc.includes('playsinline=1')) {
                currentSrc += '&playsinline=1';
            }
            
            // Ensure iframe has ID for API hook
            if (!iframe.id) iframe.id = 'yt-player-override-' + index;

            // Bypass strict blocks explicitly through heavy JS API
            iframe.src = currentSrc;
            new YT.Player(iframe.id, {
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        }
    });

};

// Global playback hooks for Desktop elements
function onPlayerReady(event) {
    event.target.mute();          
    event.target.playVideo();     
}

function onPlayerStateChange(event) {
    // Loop
    if (event.data === YT.PlayerState.ENDED) {
        event.target.playVideo(); 
    }
}
