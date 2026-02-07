// Bailes del Mundo - JavaScript

let currentSlide = 1;
const totalSlides = 10;
const maps = {};
let modalMap = null;
let worldMap = null;
let youtubePlayers = {};
let currentPlayer = null;

// Video configurations with start and end times (in seconds)
const videoConfigs = {
    'video-es': { videoId: 'Fcc9Uw3elgs', start: 8, end: 52, country: 'España' },
    'video-ie': { videoId: 'cyhsg--fHWU', start: 0, end: 53, country: 'Irlanda' },
    'video-ke': { videoId: 'L5zAuifvbKA', start: 0, end: null, country: 'Kenia' },
    'video-us': { videoId: '9gLNvK0Tk5o', start: 20, end: 82, country: 'Hawái' },
    'video-nz': { videoId: 'KFx66XutcX4', start: 20, end: null, country: 'Nueva Zelanda' },
    'video-br': { videoId: 'Bq-6gXrZ84s', start: 29, end: 56, country: 'Brasil' },
    'video-mx': { videoId: '-x0vKSO29N4', start: 0, end: 60, country: 'México' },
    'video-id': { videoId: 'M3munTEqO24', start: 0, end: 70, country: 'Indonesia' },
    'video-kr': { videoId: 'ofliFqi5oNc', start: 231, end: 322, country: 'Corea del Sur' }
};

// Country to slide mapping for world map
const countrySlideMap = {
    'ES': 2,  // España
    'IE': 3,  // Irlanda
    'KE': 4,  // Kenia
    'US': 5,  // Hawái
    'NZ': 6,  // Nueva Zelanda
    'BR': 7,  // Brasil
    'MX': 8,  // México
    'ID': 9,  // Indonesia
    'KR': 10  // Corea del Sur
};

// Called automatically by YouTube API when ready
function onYouTubeIframeAPIReady() {
    // Initialize all video players
    Object.keys(videoConfigs).forEach(playerId => {
        const config = videoConfigs[playerId];
        youtubePlayers[playerId] = new YT.Player(playerId, {
            videoId: config.videoId,
            playerVars: {
                start: config.start,
                rel: 0,
                modestbranding: 1,
                enablejsapi: 1,
                playsinline: 1
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange
            }
        });
    });
}

function onPlayerReady(event) {
    // Player is ready
}

function onPlayerStateChange(event) {
    // If video is playing, check for end time
    if (event.data === YT.PlayerState.PLAYING) {
        const playerId = event.target.getIframe().id;
        const config = videoConfigs[playerId];
        
        if (config && config.end) {
            checkVideoEnd(event.target, config.end);
        }
    }
}

function checkVideoEnd(player, endTime) {
    const interval = setInterval(() => {
        if (player.getCurrentTime() >= endTime) {
            player.pauseVideo();
            clearInterval(interval);
        }
        // Stop checking if video is paused or ended
        if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
            clearInterval(interval);
        }
    }, 100); // Check every 100ms
}

// Country configurations
const countryConfigs = {
    'ES': { name: 'España', color: '#B22222' },
    'IE': { name: 'Irlanda', color: '#169B62' },
    'KE': { name: 'Kenia', color: '#DC143C' },
    'KR': { name: 'Corea del Sur', color: '#C60C30' },
    'US': { name: 'Estados Unidos', color: '#006994' },
    'NZ': { name: 'Nueva Zelanda', color: '#000080' },
    'BR': { name: 'Brasil', color: '#009c3b' },
    'MX': { name: 'México', color: '#006847' },
    'ID': { name: 'Indonesia', color: '#DC143C' }
};

function createMap(elementId, countryCodes, highlightColor, isClickable = false, zoomOptions = {}) {
    const countryData = {};
    countryCodes.forEach(code => {
        countryData[code] = { color: highlightColor };
    });

    const config = {
        targetElementID: elementId,
        colorMax: highlightColor,
        colorMin: '#e2e2e2',
        colorNoData: '#e2e2e2',
        initialZoom: zoomOptions.initialZoom || 1.2,
        initialPan: zoomOptions.initialPan || { x: 0, y: 0 },
        minZoom: 1,
        maxZoom: 25,
        mouseWheelZoomEnabled: true,
        mouseWheelZoomWithKey: false,
        hideFlag: true,
        data: {
            data: {
                info: {
                    name: 'País',
                    format: '{0}'
                }
            },
            applyData: 'info',
            values: countryData
        },
        countryNames: {
            'ES': 'España',
            'IE': 'Irlanda',
            'KE': 'Kenia',
            'KR': 'Corea del Sur',
            'US': 'Hawái',
            'NZ': 'Nueva Zelanda',
            'BR': 'Brasil',
            'MX': 'México',
            'ID': 'Indonesia'
        },
        onGetTooltip: function(tooltipDiv, countryID) {
            const countryName = this.countryNames[countryID] || countryID;
            const isHighlighted = countryCodes.includes(countryID);
            const bgColor = isHighlighted ? highlightColor : '#666';
            return `<div style="background: ${bgColor}; color: white; padding: 8px 12px; border-radius: 6px; font-weight: 600;">${countryName}</div>`;
        }
    };

    // Add click handler for world map
    if (isClickable) {
        config.onClick = function(countryID) {
            if (countrySlideMap[countryID]) {
                currentSlide = countrySlideMap[countryID];
                showSlide(currentSlide);
            }
        };
    }

    return new svgMap(config);
}

function initWorldMap() {
    if (!worldMap) {
        const allCountries = Object.keys(countrySlideMap);
        worldMap = createMap('world-map', allCountries, '#667eea', true);
    }
}

function initMap(slideNum) {
    const mapConfigs = {
        2: { id: 'map-es', countries: ['ES'], color: '#B22222' },
        3: { id: 'map-ie', countries: ['IE'], color: '#169B62' },
        4: { id: 'map-ke', countries: ['KE'], color: '#DC143C' },
        5: { 
            id: 'map-us', 
            countries: ['US'], 
            color: '#006994'
        },
        6: { id: 'map-nz', countries: ['NZ'], color: '#000080' },
        7: { id: 'map-br', countries: ['BR'], color: '#009c3b' },
        8: { id: 'map-mx', countries: ['MX'], color: '#006847' },
        9: { id: 'map-id', countries: ['ID'], color: '#DC143C' },
        10: { id: 'map-kr', countries: ['KR'], color: '#C60C30' }
    };

    const config = mapConfigs[slideNum];
    if (config && !maps[slideNum]) {
        maps[slideNum] = createMap(
            config.id, 
            config.countries, 
            config.color, 
            false,
            config.zoomOptions || {}
        );
    }
}

function openMapModal(countryCode, countryName, color) {
    const modal = document.getElementById('mapModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMapContainer = document.getElementById('modalMap');
    
    modalMapContainer.innerHTML = '';
    modalTitle.textContent = `Mapa de ${countryName}`;
    modal.classList.add('active');
    
    setTimeout(() => {
        modalMap = createMap('modalMap', [countryCode], color);
    }, 100);
}

function closeMapModal() {
    const modal = document.getElementById('mapModal');
    modal.classList.remove('active');
    if (modalMap) {
        modalMap = null;
    }
}

function showSlide(n) {
    const slides = document.querySelectorAll('.slide-content');
    
    if (n > totalSlides) currentSlide = totalSlides;
    if (n < 1) currentSlide = 1;
    
    // Pause current video when changing slides
    if (currentPlayer) {
        currentPlayer.pauseVideo();
    }
    
    slides.forEach(slide => slide.classList.remove('active'));
    document.querySelector(`.slide-content[data-slide="${currentSlide}"]`).classList.add('active');
    
    document.getElementById('current-slide').textContent = currentSlide;
    
    const progress = (currentSlide / totalSlides) * 100;
    document.getElementById('progress').style.width = progress + '%';
    
    document.getElementById('prevBtn').disabled = currentSlide === 1;
    document.getElementById('nextBtn').disabled = currentSlide === totalSlides;
    
    document.querySelector('.slide-content.active').scrollTop = 0;

    // Initialize maps
    if (currentSlide === 1) {
        setTimeout(() => initWorldMap(), 100);
    } else if (currentSlide > 1) {
        setTimeout(() => initMap(currentSlide), 100);
    }
}

function nextSlide() {
    if (currentSlide < totalSlides) {
        currentSlide++;
        showSlide(currentSlide);
    }
}

function prevSlide() {
    if (currentSlide > 1) {
        currentSlide--;
        showSlide(currentSlide);
    }
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
    } else if (e.key === 'Escape') {
        closeMapModal();
    }
});

document.getElementById('mapModal').addEventListener('click', (e) => {
    if (e.target.id === 'mapModal') {
        closeMapModal();
    }
});

let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, false);

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, false);

function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
        nextSlide();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
        prevSlide();
    }
}

// Initialize on page load
showSlide(currentSlide);