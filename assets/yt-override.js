/**
 * YouTube IFrame API Override Script
 * This script initializes all YouTube iframes to force autoplay and mute using JS.
 * It is specifically implemented to bypass iOS WebKit blocks on background iframes.
 */

// Load the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var ytPlayers = [];

// This function creates an <iframe> (and YouTube player)
// after the API code downloads.
window.onYouTubeIframeAPIReady = function() {
    const iframes = document.querySelectorAll('iframe[src*="youtube.com"]');
    
    iframes.forEach((iframe, index) => {
        // Enforce essential URL parameters for programmatic API control
        let currentSrc = iframe.getAttribute('src') || iframe.getAttribute('data-src');
        if (currentSrc) {
            if (!currentSrc.includes('enablejsapi=1')) {
                currentSrc += currentSrc.includes('?') ? '&enablejsapi=1' : '?enablejsapi=1';
            }
            if (!currentSrc.includes('origin=')) {
                currentSrc += '&origin=' + window.location.origin;
            }
            if (!currentSrc.includes('playsinline=1')) {
                currentSrc += '&playsinline=1';
            }
            iframe.src = currentSrc;
            
            // Assign a unique ID if it doesn't have one
            if (!iframe.id) {
                iframe.id = 'yt-player-override-' + index;
            }
            
            // Initialize Player
            let player = new YT.Player(iframe.id, {
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
            ytPlayers.push(player);
        }
    });
};

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.mute();          // Explicit JS mute to satisfy iOS
    event.target.playVideo();     // Force Play 
}

// Ensure the video loops if it's the hero background
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        event.target.playVideo(); 
    }
}
