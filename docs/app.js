// Control Panel App
// This is the SHA-256 hash of your password.
const ADMIN_PASSWORD_HASH = "cd2af27eedfe9ffdd7cdca12ee4da4fb07da4bea6939c9ed5cce44d1a076b210"; 

// State
let currentSection = 'dashboard';
let pluginData = null;
let hierarchyData = null;

// Initialize
function init() {
    loadData();
    setInterval(refreshData, 5000); // Refresh every 5 seconds
}

// Login/Logout
async function login() {
    const passwordInput = document.getElementById('password').value;
    
    // Convert input text to a hash [cite: 217]
    const msgUint8 = new TextEncoder().encode(passwordInput);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Compare hashes against the constant at the top [cite: 219, 241]
    if (hashHex === ADMIN_PASSWORD_HASH) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-screen').classList.remove('hidden');
        refreshData();
    } else {
        document.getElementById('login-error').textContent = 'Invalid password';
    }
}

function logout() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('password').value = '';
}

// Section Navigation
function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    
    document.getElementById(section).classList.remove('hidden');
    if (event && event.target) {
        event.target.classList.add('active');
    }
    currentSection = section;
    
    if (section === 'plugins') renderPlugins();
    if (section === 'hierarchy') renderHierarchy();
    if (section === 'api') renderAPIStats();
}

// Data Management
function loadData() {
    const saved = localStorage.getItem('controlPanelData');
    if (saved) {
        const data = JSON.parse(saved);
        pluginData = data.plugins || [];
        hierarchyData = data.hierarchy || {};
    } else {
        pluginData = [
            { name: 'Accountability', version: '1.2', author: 'Warecario', active: true },
            { name: 'CarioPerms', version: '1.0', author: 'Warecario', active: true },
            { name: 'Plugin Manager', version: '1.0', author: 'Warecario', active: true }
        ];
        hierarchyData = {
            primary: ['Veshorned'],
            secondary: ['Warecario', 'Chromium', 'Raihan', 'Taekoda', 'SuperGr8Nate']
        };
        saveData();
    }
}

function saveData() {
    const data = {
        plugins: pluginData,
        hierarchy: hierarchyData,
        lastUpdate: new Date().toISOString()
    };
    localStorage.setItem('controlPanelData', JSON.stringify(data));
}

function refreshData() {
    if (document.getElementById('plugin-count')) {
        document.getElementById('plugin-count').textContent = pluginData.filter(p => p.active).length;
    }
    if (document.getElementById('api-calls')) {
        document.getElementById('api-calls').textContent = Math.floor(Math.random() * 100);
    }
    fetchCurrentTrack();
}

function fetchCurrentTrack() {
    const trackElem = document.getElementById('current-track');
    const spotifyElem = document.getElementById('spotify-track');
    if (trackElem) trackElem.textContent = 'Where Do I Go - Neptunica Remix';
    if (spotifyElem) spotifyElem.textContent = 'Where Do I Go - Neptunica Remix by DJ Antoine';
}

// Plugin Management
function renderPlugins() {
    const container = document.getElementById('plugin-list');
    if (!container) return;
    container.innerHTML = pluginData.map(plugin => `
        <div class="plugin-item ${plugin.active ? 'active' : ''}">
            <div class="plugin-info">
                <h4>${plugin.name} v${plugin.version}</h4>
                <p>by ${plugin.author} | ${plugin.active ? 'Active' : 'Inactive'}</p>
            </div>
            <div class="plugin-actions">
                <button onclick="togglePlugin('${plugin.name}')">
                    ${plugin.active ? 'Disable' : 'Enable'}
                </button>
                <button class="danger" onclick="removePlugin('${plugin.name}')">Remove</button>
            </div>
        </div>
    `).join('');
}

// Hierarchy, Spotify, and Command functions remain the same as your logic
function togglePlugin(name) {
    const plugin = pluginData.find(p => p.name === name);
    if (plugin) {
        plugin.active = !plugin.active;
        saveData();
        renderPlugins();
    }
}

function removePlugin(name) {
    if (confirm(`Remove ${name}?`)) {
        pluginData = pluginData.filter(p => p.name !== name);
        saveData();
        renderPlugins();
    }
}

function renderHierarchy() {
    const container = document.getElementById('hierarchy-list');
    if (!container) return;
    container.innerHTML = `
        <div class="hierarchy-tier">
            <h3>Primary</h3>
            <div class="user-list">
                ${hierarchyData.primary.map(u => `<span class="user-tag">${u}</span>`).join('')}
            </div>
        </div>
        <div class="hierarchy-tier">
            <h3>Secondary</h3>
            <div class="user-list">
                ${hierarchyData.secondary.map(u => `<span class="user-tag">${u}</span>`).join('')}
            </div>
        </div>
    `;
}

function queueCommand(cmd) {
    const commands = JSON.parse(localStorage.getItem('pendingCommands') || '[]');
    commands.push({
        command: cmd,
        timestamp: new Date().toISOString(),
        executed: false
    });
    localStorage.setItem('pendingCommands', JSON.stringify(commands));
}

function renderAPIStats() {
    const container = document.getElementById('api-stats');
    if (!container) return;
    const apis = [
        { name: 'Spotify API', calls: 47, limit: 100 },
        { name: 'Web Search', calls: 12, limit: 50 },
        { name: 'GitHub API', calls: 3, limit: 60 },
        { name: 'OpenClaw Exec', calls: 89, limit: 'Unlimited' }
    ];
    container.innerHTML = apis.map(api => `
        <div class="api-stat">
            <span>${api.name}</span>
            <span>${api.calls} / ${api.limit}</span>
        </div>
    `).join('');
}

// Event Listeners
window.onload = init;

// Use 'async' for the password listener so it can 'await' the login function 
document.getElementById('password')?.addEventListener('keypress', async function(e) {
    if (e.key === 'Enter') await login();
});

document.getElementById('command-input')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const cmd = e.target.value;
        if (cmd) {
            queueCommand(cmd);
            document.getElementById('command-output').textContent = `Sent command: ${cmd}`;
            e.target.value = '';
        }
    }
});

// Modern way to attach the login button logic [cite: 272]
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-button') || document.querySelector('button[onclick="login()"]');
    if (loginBtn) {
        // If it's the specific Access button, we ensure it calls the async version properly [cite: 265]
        loginBtn.onclick = null; // Remove the old inline handler if it exists
        loginBtn.addEventListener('click', async () => {
            await login();
        });
    }
});
