/**
 * yt-override.js — Mobile Thumbnail + YouTube Button / Desktop Autoplay
 * 
 * This script runs AFTER the <head> inline mobile-intercept script has already
 * stripped iframe src on mobile. It handles two entirely separate paths:
 * 
 * MOBILE  (< 768px): Injects HD thumbnails + "Watch on YouTube" red play button
 * DESKTOP (>= 768px): Loads YouTube IFrame API and forces autoplay via JS
 */

(function() {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
        // ======== MOBILE PATH ========
        // The <head> inline script already moved src -> data-src.
        // Now we replace iframes with thumbnails + YouTube buttons.
        
        document.addEventListener('DOMContentLoaded', function() {
            const iframes = document.querySelectorAll('iframe[data-src*="youtube"]');
            
            iframes.forEach(function(iframe) {
                const src = iframe.getAttribute('data-src') || '';
                const videoIdMatch = src.match(/embed\/([^?&#]+)/);
                if (!videoIdMatch) return;
                
                const videoId = videoIdMatch[1];
                const wrapper = iframe.parentElement;
                
                // Set cinematic thumbnail as background
                wrapper.style.backgroundImage = "url('https://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg')";
                wrapper.style.backgroundSize = 'cover';
                wrapper.style.backgroundPosition = 'center';
                
                // Remove pointer-events-none so the link is tappable
                wrapper.classList.remove('pointer-events-none');
                
                // Kill the iframe completely — no memory cost at all
                iframe.remove();
                
                // Build the "Watch on YouTube" button
                var link = document.createElement('a');
                link.href = 'https://www.youtube.com/watch?v=' + videoId;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.style.cssText = 'position:absolute;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);cursor:pointer;text-decoration:none;';
                
                // Official YouTube play button SVG (red pill shape + white triangle)
                link.innerHTML = '<svg viewBox="0 0 68 48" width="68" height="48" style="filter:drop-shadow(0 2px 8px rgba(0,0,0,0.5));">' +
                    '<path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#FF0000"/>' +
                    '<path d="M45 24L27 14v20" fill="white"/>' +
                    '</svg>';
                
                // Make sure wrapper has position:relative for the absolute link
                if (getComputedStyle(wrapper).position === 'static') {
                    wrapper.style.position = 'relative';
                }
                
                wrapper.appendChild(link);
            });
        });

    } else {
        // ======== DESKTOP / TABLET PATH ========
        // Load the YouTube IFrame Player API and force autoplay
        
        var tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = function() {
            var iframes = document.querySelectorAll('iframe[src*="youtube"]');
            
            iframes.forEach(function(iframe, index) {
                var currentSrc = iframe.getAttribute('src') || '';
                if (!currentSrc) return;

                // Inject API parameters
                if (currentSrc.indexOf('enablejsapi=1') === -1) {
                    currentSrc += (currentSrc.indexOf('?') !== -1 ? '&' : '?') + 'enablejsapi=1';
                }
                if (currentSrc.indexOf('origin=') === -1) {
                    currentSrc += '&origin=' + window.location.origin;
                }
                if (currentSrc.indexOf('playsinline=1') === -1) {
                    currentSrc += '&playsinline=1';
                }
                
                if (!iframe.id) iframe.id = 'yt-player-' + index;
                iframe.src = currentSrc;

                new YT.Player(iframe.id, {
                    events: {
                        'onReady': function(event) {
                            event.target.mute();
                            event.target.playVideo();
                        },
                        'onStateChange': function(event) {
                            if (event.data === YT.PlayerState.ENDED) {
                                event.target.playVideo();
                            }
                        }
                    }
                });
            });
        };
    }
})();
