/**
 * yt-override.js — Mobile Video Hero + Thumbnails / Desktop Autoplay
 * 
 * MOBILE  (< 1024px):
 *   - Hero (.animate-slow-pan): Replaces 8 panels with ONE cycling YouTube iframe + vignette blur
 *   - Other pages: Replaces iframes with HD thumbnails + YouTube link buttons
 * DESKTOP (>= 1024px):
 *   - Full YouTube IFrame API autoplay, no changes
 */

(function() {
    var isMobile = window.innerWidth < 1024;

    if (isMobile) {
        // ======== MOBILE PATH ========
        document.addEventListener('DOMContentLoaded', function() {

            // --- HERO SECTION: Cinematic loading + cycling live video ---
            var heroTrack = document.querySelector('.animate-slow-pan');
            if (heroTrack) {
                var heroVideoIds = ['sDfixts3h4o', 'cbFiwFXRqn0', 'EEgggVtn1B0', 'icHxNil5dvg'];
                var currentIdx = 0;

                // Navigate to the correct container: track → skew wrapper → bg container
                var skewWrapper = heroTrack.parentElement;
                var bgContainer = skewWrapper.parentElement; // div.absolute.inset-0.bg-[#030303]

                // Remove the entire skew wrapper (contains all 8 panel iframes)
                skewWrapper.remove();

                // Reset bgContainer to be a clean full-bleed container
                bgContainer.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden;z-index:0;';

                // ── LAYER 1: INSTANT THUMBNAIL (loads in <100ms) ──
                var thumb = document.createElement('div');
                thumb.id = 'hero-thumb';
                thumb.style.cssText = [
                    'position:absolute;inset:0;z-index:1',
                    'background:url(https://img.youtube.com/vi/' + heroVideoIds[0] + '/maxresdefault.jpg) center/cover no-repeat',
                    'filter:brightness(0.35) saturate(0.7) contrast(1.1)',
                    'transition:opacity 2.5s ease'
                ].join(';');
                bgContainer.appendChild(thumb);

                // ── LAYER 2: CINEMATIC GLASS OVERLAY ──
                // Animated shimmer + film grain + breathing orbs
                var glass = document.createElement('div');
                glass.id = 'hero-glass';
                glass.style.cssText = 'position:absolute;inset:0;z-index:2;pointer-events:none;';
                glass.innerHTML =
                    // Shifting gradient wash
                    '<div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(10,10,30,0.7),rgba(20,14,40,0.5) 50%,rgba(10,10,30,0.7));background-size:300% 300%;animation:glassWash 6s ease infinite"></div>' +
                    // Breathing purple orb
                    '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 35% 45%,rgba(144,147,255,0.12),transparent 65%);animation:orbPulse 4s ease-in-out infinite alternate"></div>' +
                    // Breathing blue orb (offset)
                    '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 65% 55%,rgba(80,100,220,0.08),transparent 55%);animation:orbPulse 5s ease-in-out infinite alternate-reverse"></div>' +
                    // Subtle noise/grain texture
                    '<div style="position:absolute;inset:0;opacity:0.04;background:url(data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E);background-size:128px 128px"></div>' +
                    // Bottom vignette
                    '<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(3,3,3,0.5) 0%,transparent 50%)"></div>';
                bgContainer.appendChild(glass);

                // Inject animation keyframes
                var style = document.createElement('style');
                style.textContent =
                    '@keyframes glassWash{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}' +
                    '@keyframes orbPulse{0%{opacity:0.3;transform:scale(1)}100%{opacity:1;transform:scale(1.15)}}';
                document.head.appendChild(style);

                // ── LAYER 3: VIDEO IFRAME ──
                var iframe = document.createElement('iframe');
                iframe.id = 'mobile-hero-video';
                iframe.style.cssText = [
                    'position:absolute;top:50%;left:50%',
                    'width:177.78vh;height:100vh',   // 16:9 ratio
                    'min-width:100vw;min-height:100vh',
                    'max-width:none',
                    'transform:translate(-50%,-50%)',
                    'pointer-events:none;border:0',
                    'z-index:3;opacity:0',
                    'transition:opacity 2.5s ease'
                ].join(';');
                iframe.allow = 'autoplay; fullscreen; picture-in-picture';
                iframe.src = 'https://www.youtube-nocookie.com/embed/' + heroVideoIds[0] +
                    '?autoplay=1&mute=1&playsinline=1&loop=1&playlist=' + heroVideoIds[0] +
                    '&controls=0&showinfo=0&rel=0&enablejsapi=1&modestbranding=1';

                // Once video loads, crossfade from thumbnail to live video
                iframe.onload = function() {
                    setTimeout(function() {
                        iframe.style.opacity = '0.85';
                        // Fade down the glass shimmer (thumbnail stays as fallback)
                        glass.style.transition = 'opacity 3s ease';
                        glass.style.opacity = '0.15';
                    }, 1200);
                };
                bgContainer.appendChild(iframe);

                // ── LAYER 4: TOP VIGNETTE (always on, for text readability) ──
                var vignette = document.createElement('div');
                vignette.style.cssText = 'position:absolute;inset:0;z-index:4;pointer-events:none;' +
                    'background:radial-gradient(ellipse at center,transparent 15%,rgba(3,3,3,0.45) 55%,rgba(3,3,3,0.85) 100%);';
                bgContainer.appendChild(vignette);

                // ── CYCLE VIDEOS ──
                setInterval(function() {
                    currentIdx = (currentIdx + 1) % heroVideoIds.length;
                    var vid = heroVideoIds[currentIdx];

                    // Fade out current video
                    iframe.style.opacity = '0';
                    // Bring shimmer back during transition
                    glass.style.opacity = '1';
                    // Swap thumbnail behind
                    thumb.style.backgroundImage = 'url(https://img.youtube.com/vi/' + vid + '/maxresdefault.jpg)';

                    setTimeout(function() {
                        iframe.src = 'https://www.youtube-nocookie.com/embed/' + vid +
                            '?autoplay=1&mute=1&playsinline=1&loop=1&playlist=' + vid +
                            '&controls=0&showinfo=0&rel=0&enablejsapi=1&modestbranding=1';
                        iframe.onload = function() {
                            setTimeout(function() {
                                iframe.style.opacity = '0.85';
                                glass.style.opacity = '0.15';
                            }, 1000);
                        };
                    }, 1800);
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
