/**
 * yt-override.js — Mobile Video Hero + Thumbnails / Desktop Autoplay
 * 
 * MOBILE  (< 768px):
 *   - Hero (.animate-slow-pan): Replaces 8 panels with ONE cycling YouTube iframe + vignette blur
 *   - Other pages: Replaces iframes with HD thumbnails + YouTube link buttons
 * DESKTOP (>= 768px):
 *   - Full YouTube IFrame API autoplay, no changes
 */

(function() {
    var isMobile = window.innerWidth < 768;

    if (isMobile) {
        // ======== MOBILE PATH ========
        document.addEventListener('DOMContentLoaded', function() {

            // --- HERO SECTION: Single cycling live video ---
            var heroTrack = document.querySelector('.animate-slow-pan');
            if (heroTrack) {
                var heroVideoIds = ['sDfixts3h4o', 'cbFiwFXRqn0', 'EEgggVtn1B0', 'icHxNil5dvg'];
                var currentIdx = 0;

                // Get the parent wrapper that contains the panning track
                var heroWrapper = heroTrack.parentElement; // the skew wrapper
                
                // Nuke the entire 8-panel track
                heroTrack.remove();
                
                // Reset the wrapper to be a simple full-bleed container
                heroWrapper.style.cssText = 'position:absolute;inset:0;overflow:hidden;opacity:0.9;';
                heroWrapper.className = '';

                // Create the single iframe
                var heroIframe = document.createElement('iframe');
                heroIframe.id = 'mobile-hero-video';
                heroIframe.style.cssText = 'position:absolute;top:50%;left:50%;width:200%;height:200%;max-width:none;transform:translate(-50%,-50%);pointer-events:none;border:0;';
                heroIframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
                heroIframe.setAttribute('frameborder', '0');
                heroIframe.src = 'https://www.youtube-nocookie.com/embed/' + heroVideoIds[0] + '?autoplay=1&mute=1&playsinline=1&loop=1&playlist=' + heroVideoIds[0] + '&controls=0&showinfo=0&rel=0&enablejsapi=1';
                
                heroWrapper.appendChild(heroIframe);

                // Create vignette blur overlay on top
                var vignetteOverlay = document.createElement('div');
                vignetteOverlay.style.cssText = 'position:absolute;inset:0;z-index:2;pointer-events:none;background:radial-gradient(ellipse at center, transparent 30%, rgba(3,3,3,0.6) 70%, rgba(3,3,3,0.9) 100%);';
                heroWrapper.appendChild(vignetteOverlay);

                // Cycle through videos every 20 seconds
                setInterval(function() {
                    currentIdx = (currentIdx + 1) % heroVideoIds.length;
                    var vid = heroVideoIds[currentIdx];
                    
                    // Fade out
                    heroIframe.style.transition = 'opacity 1.5s ease';
                    heroIframe.style.opacity = '0';
                    
                    setTimeout(function() {
                        heroIframe.src = 'https://www.youtube-nocookie.com/embed/' + vid + '?autoplay=1&mute=1&playsinline=1&loop=1&playlist=' + vid + '&controls=0&showinfo=0&rel=0&enablejsapi=1';
                        // Fade back in after a moment for the iframe to load
                        setTimeout(function() {
                            heroIframe.style.opacity = '1';
                        }, 800);
                    }, 1500);
                }, 20000);
            }

            // --- ALL OTHER IFRAMES: Thumbnail + YouTube button ---
            var iframes = document.querySelectorAll('iframe[data-src*="youtube"]');
            
            iframes.forEach(function(iframe) {
                // Skip if it's our newly created hero iframe
                if (iframe.id === 'mobile-hero-video') return;

                var src = iframe.getAttribute('data-src') || '';
                var videoIdMatch = src.match(/embed\/([^?&#]+)/);
                if (!videoIdMatch) return;
                
                var videoId = videoIdMatch[1];
                var wrapper = iframe.parentElement;
                
                // Set cinematic thumbnail as background
                wrapper.style.backgroundImage = "url('https://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg')";
                wrapper.style.backgroundSize = 'cover';
                wrapper.style.backgroundPosition = 'center';
                
                // Remove pointer-events-none so the link is tappable
                wrapper.classList.remove('pointer-events-none');
                
                // Kill the iframe completely
                iframe.remove();
                
                // Build the "Watch on YouTube" button
                var link = document.createElement('a');
                link.href = 'https://www.youtube.com/watch?v=' + videoId;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.style.cssText = 'position:absolute;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);cursor:pointer;text-decoration:none;';
                
                // Official YouTube play button SVG
                link.innerHTML = '<svg viewBox="0 0 68 48" width="68" height="48" style="filter:drop-shadow(0 2px 8px rgba(0,0,0,0.5));">' +
                    '<path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#FF0000"/>' +
                    '<path d="M45 24L27 14v20" fill="white"/>' +
                    '</svg>';
                
                if (getComputedStyle(wrapper).position === 'static') {
                    wrapper.style.position = 'relative';
                }
                
                wrapper.appendChild(link);
            });
        });

    } else {
        // ======== DESKTOP / TABLET PATH ========
        var tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = function() {
            var iframes = document.querySelectorAll('iframe[src*="youtube"]');
            
            iframes.forEach(function(iframe, index) {
                var currentSrc = iframe.getAttribute('src') || '';
                if (!currentSrc) return;

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
