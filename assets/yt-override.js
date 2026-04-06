/**
 * YouTube IFrame API Override Script & Intelligent Memory Culling
 * Desktop: Initializes players normally with API to bypass strict block.
 * Mobile (< 768px): Uses IntersectionObserver to cull off-screen iframes and stop iOS WebKit crashes.
 */

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.onYouTubeIframeAPIReady = function() {
    const isMobile = window.innerWidth < 768;
    const iframes = document.querySelectorAll('iframe[src*="youtube"]');
    
    // Intersection Observer for Mobile Devices ONLY
    let observer;
    if (isMobile) {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const iframe = entry.target;
                
                if (entry.isIntersecting) {
                    // Activate iframe (mount video into RAM)
                    if (!iframe.src || iframe.src === '') {
                        iframe.src = iframe.dataset.src;
                        
                        // Boot up a fresh JS engine hook to explicitly force the Play command upon Safari
                        setTimeout(() => {
                            if (window.YT && window.YT.Player) {
                                new YT.Player(iframe.id, {
                                    events: {
                                        'onReady': onPlayerReady,
                                        'onStateChange': onPlayerStateChange
                                    }
                                });
                            }
                        }, 500); // Allow iOS DOM to paint the iframe node first
                    }
                } else {
                    // Cull iframe memory when off-screen (dull to save VRAM)
                    if (iframe.src && iframe.src !== '') {
                        if (!iframe.dataset.src) iframe.dataset.src = iframe.src;
                        iframe.src = '';
                    }
                }
            });
        }, { rootMargin: '200px 0px' });
    }

    iframes.forEach((iframe, index) => {
        let currentSrc = iframe.getAttribute('src') || iframe.getAttribute('data-src');
        if (!currentSrc) return;

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
        
        // Ensure iframe has ID
        if (!iframe.id) iframe.id = 'yt-player-override-' + index;

        if (isMobile) {
            // MOBILE: Switch to nocookie to save RAM parsing Google tracking logic
            currentSrc = currentSrc.replace('youtube.com', 'youtube-nocookie.com');
            
            // Generate seamless static thumbnail behind the iframe
            const wrapper = iframe.parentElement;
            const videoIdMatch = currentSrc.match(/embed\/([^?]+)/);
            if (videoIdMatch && videoIdMatch[1]) {
                const videoId = videoIdMatch[1];
                wrapper.style.backgroundImage = `url('https://img.youtube.com/vi/${videoId}/maxresdefault.jpg')`;
                wrapper.style.backgroundSize = 'cover';
                wrapper.style.backgroundPosition = 'center';
            }

            // Immediately halt processing and hand it off to the IntersectionObserver!
            iframe.dataset.src = currentSrc;
            iframe.src = ''; 
            observer.observe(iframe);

        } else {
            // DESKTOP: Bypass WebKit strict blocks explicitly through JS API
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

function onPlayerReady(event) {
    event.target.mute();          
    event.target.playVideo();     
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        event.target.playVideo(); 
    }
}
