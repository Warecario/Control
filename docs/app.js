// Control Panel App
const ADMIN_PASSWORD = "cd2af27eedfe9ffdd7cdca12ee4da4fb07da4bea6939c9ed5cce44d1a076b210"; // Change this to your actual password

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
    
    // Convert your input into a hash
    const msgUint8 = new TextEncoder().encode(passwordInput);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Compare the two hashes
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
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    
    // Show selected
    document.getElementById(section).classList.remove('hidden');
    event.target.classList.add('active');
    currentSection = section;
    
    // Refresh specific data
    if (section === 'plugins') renderPlugins();
    if (section === 'hierarchy') renderHierarchy();
    if (section === 'api') renderAPIStats();
}

// Data Management
function loadData() {
    // Load from localStorage (simulated - in production this would read from the JSON file)
    const saved = localStorage.getItem('controlPanelData');
    if (saved) {
        const data = JSON.parse(saved);
        pluginData = data.plugins || [];
        hierarchyData = data.hierarchy || {};
    } else {
        // Default data
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
    
    // In a real implementation, this would also write to the data.json file
    // that the bot reads from
}

function refreshData() {
    // Update dashboard stats
    document.getElementById('plugin-count').textContent = pluginData.filter(p => p.active).length;
    document.getElementById('api-calls').textContent = Math.floor(Math.random() * 100); // Simulated
    
    // Fetch current track from bot (simulated)
    fetchCurrentTrack();
}

// Simulated API calls (in production these would interface with the bot)
function fetchCurrentTrack() {
    // This would be replaced with actual data from the bot
    document.getElementById('current-track').textContent = 'Where Do I Go - Neptunica Remix';
    document.getElementById('spotify-track').textContent = 'Where Do I Go - Neptunica Remix by DJ Antoine';
}

// Plugin Management
function renderPlugins() {
    const container = document.getElementById('plugin-list');
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

function uploadPlugin() {
    const fileInput = document.getElementById('plugin-file');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a plugin file');
        return;
    }
    
    // Simulate plugin installation
    const reader = new FileReader();
    reader.onload = function(e) {
        const newPlugin = {
            name: file.name.replace(/\.[^/.]+$/, ''),
            version: '1.0',
            author: 'Unknown',
            active: true
        };
        pluginData.push(newPlugin);
        saveData();
        renderPlugins();
        alert('Plugin installed!');
    };
    reader.readAsText(file);
    
    // In production, this would write to a "pending-plugins" folder
    // that the bot monitors
}

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

// Hierarchy Management
function renderHierarchy() {
    const container = document.getElementById('hierarchy-list');
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

// Spotify Controls
function sendCommand(cmd) {
    // This would queue a command for the bot to execute
    const commands = {
        'play': 'spotify:play',
        'pause': 'spotify:pause',
        'skip': 'spotify:skip',
        'prev': 'spotify:previous'
    };
    
    queueCommand(commands[cmd] || cmd);
    document.getElementById('command-output').textContent = `Sent: ${cmd}`;
}

function queueSong() {
    const song = document.getElementById('queue-input').value;
    if (song) {
        queueCommand(`spotify:queue:${song}`);
        document.getElementById('command-output').textContent = `Queued: ${song}`;
        document.getElementById('queue-input').value = '';
    }
}

// Command System
function sendCustomCommand() {
    const cmd = document.getElementById('command-input').value;
    if (cmd) {
        queueCommand(cmd);
        document.getElementById('command-output').textContent = `Sent command: ${cmd}`;
        document.getElementById('command-input').value = '';
    }
}

function queueCommand(cmd) {
    // In production, this would append to a commands.json file
    // that the bot checks periodically
    const commands = JSON.parse(localStorage.getItem('pendingCommands') || '[]');
    commands.push({
        command: cmd,
        timestamp: new Date().toISOString(),
        executed: false
    });
    localStorage.setItem('pendingCommands', JSON.stringify(commands));
}

// API Stats
function renderAPIStats() {
    const container = document.getElementById('api-stats');
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

// Initialize on load
window.onload = init;

// Handle enter key on password field
document.getElementById('password')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') login();
});

document.getElementById('command-input')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') sendCustomCommand();
});

document.getElementById('queue-input')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') queueSong();
});

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-button');
    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            await login();
        });
    }
});
