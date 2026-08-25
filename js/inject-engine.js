/**
 * Kairos Global Layout Ingestion Engine
 */
async function loadLayoutComponents() {
    try {
        // 1. Resolve relative path based on script location
        const scriptTag = document.currentScript || document.querySelector('script[src*="inject-engine.js"]');
        const scriptSrc = scriptTag ? scriptTag.getAttribute('src') : 'js/inject-engine.js';
        const basePath = scriptSrc.replace('js/inject-engine.js', '');

        // 2. Fetch header and footer partials
        const [headerRes, footerRes] = await Promise.all([
            fetch(basePath + 'components/header.html'),
            fetch(basePath + 'components/footer.html')
        ]);

        if (!headerRes.ok) throw new Error(`Header error: ${headerRes.status}`);
        if (!footerRes.ok) throw new Error(`Footer error: ${footerRes.status}`);

        const headerTarget = document.getElementById('global-header');
        const footerTarget = document.getElementById('global-footer');

        if (headerTarget) headerTarget.innerHTML = await headerRes.text();
        if (footerTarget) footerTarget.innerHTML = await footerRes.text();

        // 3. Normalize internal link paths for nested subfolders
        document.querySelectorAll('#global-header a, #global-footer a').forEach(link => {
            let href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
                if (href.startsWith('/')) href = href.slice(1);
                link.setAttribute('href', basePath + href);
            }
        });

        // 4. Highlight active navigation tab
        const currentFileName = window.location.pathname.split("/").pop() || "index.html";
        document.querySelectorAll('[data-page]').forEach(link => {
            if (link.getAttribute('data-page') === currentFileName) {
                link.classList.add('text-white', 'border-b-2', 'border-cyan-400');
                link.classList.remove('text-zinc-400');
            }
        });

        // 5. Initialize live clocks
        initClockEngine();

    } catch (error) {
        console.error("Layout engine error:", error);
    }
}

function initClockEngine() {
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    
    setInterval(() => {
        try {
            const date = new Date();
            const ny = new Intl.DateTimeFormat('en-US', { ...timeOptions, timeZone: 'America/New_York' }).format(date);
            const lon = new Intl.DateTimeFormat('en-GB', { ...timeOptions, timeZone: 'Europe/London' }).format(date);
            const tyo = new Intl.DateTimeFormat('ja-JP', { ...timeOptions, timeZone: 'Asia/Tokyo' }).format(date);
            const utc = new Intl.DateTimeFormat('en-GB', { ...timeOptions, timeZone: 'UTC' }).format(date);

            const nyEl = document.getElementById('clock-ny');
            const lonEl = document.getElementById('clock-lon');
            const tyoEl = document.getElementById('clock-tyo');
            const utcEl = document.getElementById('clock-utc');
            const mobEl = document.getElementById('live-time-mobile');

            if (nyEl) nyEl.textContent = ny;
            if (lonEl) lonEl.textContent = lon;
            if (tyoEl) tyoEl.textContent = tyo;
            if (utcEl) utcEl.textContent = utc;
            if (mobEl) mobEl.textContent = utc + ' UTC';
        } catch (e) {
            // Ignore missing clock elements
        }
    }, 1000);
}

window.addEventListener('DOMContentLoaded', loadLayoutComponents);
