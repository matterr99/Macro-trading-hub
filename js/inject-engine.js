/**
 * Kairos Global Layout Ingestion Core Engine
 * Processes isolated header/footer markup and syncs active navigational classes.
 */
async function loadLayoutComponents() {
    try {
        // 1. SMART PATH RESOLVER: Dynamically determine relative root path
        const scriptTag = document.currentScript || document.querySelector('script[src*="inject-engine.js"]');
        const scriptSrc = scriptTag ? scriptTag.getAttribute('src') : 'js/inject-engine.js';
        const basePath = scriptSrc.replace('js/inject-engine.js', '');

        // 2. Fetch and inject global header (with status check guard)
        const headerResponse = await fetch(basePath + 'components/header.html');
        if (!headerResponse.ok) throw new Error(`Header fetch failed: HTTP ${headerResponse.status}`);
        document.getElementById('global-header').innerHTML = await headerResponse.text();

        // 3. Fetch and inject global footer (with status check guard)
        const footerResponse = await fetch(basePath + 'components/footer.html');
        if (!footerResponse.ok) throw new Error(`Footer fetch failed: HTTP ${footerResponse.status}`);
        document.getElementById('global-footer').innerHTML = await footerResponse.text();

        // 4. Fix relative paths for all links in the injected layout
        document.querySelectorAll('#global-header a, #global-footer a').forEach(link => {
            let href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
                // Remove leading slash if accidentally left in component markup
                if (href.startsWith('/')) href = href.slice(1);
                link.setAttribute('href', basePath + href);
            }
        });

        // 5. Extract terminal page name for navigation highlighting
        const currentFileName = window.location.pathname.split("/").pop() || "index.html";
        
        // 6. Apply active tab styling
        document.querySelectorAll('[data-page]').forEach(link => {
            if (link.getAttribute('data-page') === currentFileName) {
                link.classList.add('active-tab');
                link.classList.remove('text-zinc-400');
            }
        });

        // 7. Initialize system clocks
        initClockEngine();

    } catch (error) {
        console.error("Layout engine execution error:", error);
    }
}

function initClockEngine() {
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    
    setInterval(() => {
        try {
            const nyTime = new Intl.DateTimeFormat('en-US', { ...timeOptions, timeZone: 'America/New_York' }).format(new Date());
            const lonTime = new Intl.DateTimeFormat('en-GB', { ...timeOptions, timeZone: 'Europe/London' }).format(new Date());
            const tyoTime = new Intl.DateTimeFormat('ja-JP', { ...timeOptions, timeZone: 'Asia/Tokyo' }).format(new Date());
            const utcTime = new Intl.DateTimeFormat('en-GB', { ...timeOptions, timeZone: 'UTC' }).format(new Date());

            if(document.getElementById('clock-ny')) document.getElementById('clock-ny').textContent = nyTime;
            if(document.getElementById('clock-lon')) document.getElementById('clock-lon').textContent = lonTime;
            if(document.getElementById('clock-tyo')) document.getElementById('clock-tyo').textContent = tyoTime;
            if(document.getElementById('clock-utc')) document.getElementById('clock-utc').textContent = utcTime;
            if(document.getElementById('live-time-mobile')) document.getElementById('live-time-mobile').textContent = utcTime + ' UTC';
        } catch (e) {
            // Suppress clock rendering errors if fields are missing
        }
    }, 1000);
}

window.addEventListener('DOMContentLoaded', loadLayoutComponents);/**
 * Kairos Global Layout Ingestion Core Engine
 * Processes isolated header/footer markup and syncs active navigational classes.
 */
async function loadLayoutComponents() {
    try {
        // 1. SMART PATH RESOLVER: Dynamically determine the root path
        const scriptTag = document.currentScript || document.querySelector('script[src*="inject-engine.js"]');
        const scriptSrc = scriptTag.getAttribute('src');
        const basePath = scriptSrc.replace('js/inject-engine.js', '');

        // 2. Fetch and inject global header from the components folder
        const headerResponse = await fetch(basePath + 'components/header.html');
        document.getElementById('global-header').innerHTML = await headerResponse.text();

        // 3. Fetch and inject global footer from the components folder
        const footerResponse = await fetch(basePath + 'components/footer.html');
        document.getElementById('global-footer').innerHTML = await footerResponse.text();

        // 4. Fix relative paths for all links in the injected layout so they work on nested pages
        document.querySelectorAll('#global-header a, #global-footer a').forEach(link => {
            const href = link.getAttribute('href');
            // Only modify internal relative links (ignore external links or anchor tags)
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
                link.setAttribute('href', basePath + href);
            }
        });

        // 5. Extract the terminal namespace of the current location pointer
        const currentFileName = window.location.pathname.split("/").pop() || "index.html";
        
        // 6. Trace across active navigation attributes and highlight matched pages
        document.querySelectorAll('[data-page]').forEach(link => {
            if (link.getAttribute('data-page') === currentFileName) {
                link.classList.add('active-tab');
                link.classList.remove('text-zinc-400');
            }
        });

        // 7. Initialize the high-performance 4-clock engine sequence loop
        initClockEngine();

    } catch (error) {
        console.error("Layout engine allocation synchronization execution error:", error);
    }
}

function initClockEngine() {
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    
    setInterval(() => {
        try {
            const nyTime = new Intl.DateTimeFormat('en-US', { ...timeOptions, timeZone: 'America/New_York' }).format(new Date());
            const lonTime = new Intl.DateTimeFormat('en-GB', { ...timeOptions, timeZone: 'Europe/London' }).format(new Date());
            const tyoTime = new Intl.DateTimeFormat('ja-JP', { ...timeOptions, timeZone: 'Asia/Tokyo' }).format(new Date());
            const utcTime = new Intl.DateTimeFormat('en-GB', { ...timeOptions, timeZone: 'UTC' }).format(new Date());

            if(document.getElementById('clock-ny')) document.getElementById('clock-ny').textContent = nyTime;
            if(document.getElementById('clock-lon')) document.getElementById('clock-lon').textContent = lonTime;
            if(document.getElementById('clock-tyo')) document.getElementById('clock-tyo').textContent = tyoTime;
            if(document.getElementById('clock-utc')) document.getElementById('clock-utc').textContent = utcTime;
            if(document.getElementById('live-time-mobile')) document.getElementById('live-time-mobile').textContent = utcTime + ' UTC';
        } catch (e) {
            // Suppress clock rendering anomalies if specific DOM fields are missing
        }
    }, 1000);
}

// Trigger initial composition loops on page loading complete
window.addEventListener('DOMContentLoaded', loadLayoutComponents);/**
 * Kairos Global Layout Ingestion Core Engine
 * Processes isolated header/footer markup and syncs active navigational classes.
 */
async function loadLayoutComponents() {
    try {
        // 1. SMART PATH RESOLVER: Dynamically determine the root path
        // It reads its own script tag to see if it was called via "js/..." or "../js/..."
        const scriptTag = document.currentScript || document.querySelector('script[src*="inject-engine.js"]');
        const scriptSrc = scriptTag.getAttribute('src');
        const basePath = scriptSrc.replace('js/inject-engine.js', '');

        // 2. Fetch and inject global header (adjust path if you moved header.html to a components folder)
        const headerResponse = await fetch(basePath + 'header.html');
        document.getElementById('global-header').innerHTML = await headerResponse.text();

        // 3. Fetch and inject global footer
        const footerResponse = await fetch(basePath + 'footer.html');
        document.getElementById('global-footer').innerHTML = await footerResponse.text();

        // 4. Fix relative paths for all links in the injected layout so they work on nested pages
        document.querySelectorAll('#global-header a, #global-footer a').forEach(link => {
            const href = link.getAttribute('href');
            // Only modify internal relative links (ignore external links or anchor tags)
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
                link.setAttribute('href', basePath + href);
            }
        });

        // 5. Extract the terminal namespace of the current location pointer
        const currentFileName = window.location.pathname.split("/").pop() || "index.html";
        
        // 6. Trace across active navigation attributes and highlight matched pages
        document.querySelectorAll('[data-page]').forEach(link => {
            if (link.getAttribute('data-page') === currentFileName) {
                link.classList.add('active-tab');
                link.classList.remove('text-zinc-400');
            }
        });

        // 7. Initialize the high-performance 4-clock engine sequence loop
        initClockEngine();

    } catch (error) {
        console.error("Layout engine allocation synchronization execution error:", error);
    }
}

function initClockEngine() {
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    
    setInterval(() => {
        try {
            const nyTime = new Intl.DateTimeFormat('en-US', { ...timeOptions, timeZone: 'America/New_York' }).format(new Date());
            const lonTime = new Intl.DateTimeFormat('en-GB', { ...timeOptions, timeZone: 'Europe/London' }).format(new Date());
            const tyoTime = new Intl.DateTimeFormat('ja-JP', { ...timeOptions, timeZone: 'Asia/Tokyo' }).format(new Date());
            const utcTime = new Intl.DateTimeFormat('en-GB', { ...timeOptions, timeZone: 'UTC' }).format(new Date());

            if(document.getElementById('clock-ny')) document.getElementById('clock-ny').textContent = nyTime;
            if(document.getElementById('clock-lon')) document.getElementById('clock-lon').textContent = lonTime;
            if(document.getElementById('clock-tyo')) document.getElementById('clock-tyo').textContent = tyoTime;
            if(document.getElementById('clock-utc')) document.getElementById('clock-utc').textContent = utcTime;
            if(document.getElementById('live-time-mobile')) document.getElementById('live-time-mobile').textContent = utcTime + ' UTC';
        } catch (e) {
            // Suppress clock rendering anomalies if specific DOM fields are missing
        }
    }, 1000);
}

// Trigger initial composition loops on page loading complete
window.addEventListener('DOMContentLoaded', loadLayoutComponents);
