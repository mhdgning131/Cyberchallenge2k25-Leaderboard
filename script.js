// Embedded GlitchText Library
class GlitchText {
    constructor(element, options = {}) {
        this.el = element;
        this.options = {
            charset: 'tech2',
            speed: 6,
            changeFrequency: 0.28,
            color: '#00ff88',
            glowIntensity: 8,
            activeGlowIntensity: 12,
            responsive: true,
            ...options
        };

        // Character sets for different effects
        this.charSets = {
            tech1: '!<>-_\\/[]{}—=+*^?#________',
            tech2: '!<>-_\\/[]{}—=+*^?#$%&()~',
            math: '01︎10︎101︎01︎+=-×÷',
            cryptic: '¥¤§Ω∑∆√∞≈≠≤≥',
            mixed: 'あ㐀明る日¥£€$¢₽₹₿',
            alphabet: 'abcdefghijklmnopqrstuvwxyz',
            matrix1: 'ラドクリフマラソンわたしワタシんょンョたばこタバコとうきょうトウキョウ',
            matrix2: '日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ',
            matrix3: '字型大小女巧偉周年',
            matrix4: '九七二人入八力十下三千上口土夕大女子小山川五天中六円手文日月木水火犬王正出本右四左玉生田白目石立百年休先名字早気竹糸耳虫村男町花見貝赤足車学林空金雨青草音',
            binary: '01',
            hex: '0123456789ABCDEF',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
            glitch: '█▉▊▋▌▍▎▏▐░▒▓',
            minimal: '.-_',
            cyberpunk: '◊◈◉●○◦•‣⁃∙∘∴∵∶∷',
        };

        this.chars = this.charSets[this.options.charset] || this.charSets.tech2;
        this.update = this.update.bind(this);
        this.isAnimating = false;
        this.queue = [];
        this.originalText = element.textContent;

        // Responsive settings
        if (this.options.responsive) {
            this.setupResponsive();
        }
    }

    setupResponsive() {
        const updateSettings = () => {
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                this.options.speed = Math.min(this.options.speed * 1.5, 10);
                this.options.changeFrequency = Math.min(this.options.changeFrequency * 1.2, 0.6);
                this.options.glowIntensity = Math.max(this.options.glowIntensity * 0.7, 4);
            }
        };

        updateSettings();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(updateSettings, 150);
        });
    }

    // Main scramble method
    scrambleTo(newText) {
        if (this.isAnimating) {
            return Promise.resolve();
        }

        this.isAnimating = true;
        const oldText = this.el.textContent;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise(resolve => this.resolve = resolve);
        this.queue = [];

        // Calculate animation range based on speed
        const animationRange = 40 / this.options.speed;

        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * animationRange);
            const end = start + Math.floor(Math.random() * animationRange);
            this.queue.push({ from, to, start, end });
        }

        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    update() {
        let output = '';
        let complete = 0;

        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];

            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < this.options.changeFrequency) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="glitch-char" style="color: ${this.options.color}; text-shadow: 0 0 ${this.options.activeGlowIntensity}px currentColor;">${char}</span>`;
            } else {
                output += from;
            }
        }

        this.el.innerHTML = output;

        if (complete === this.queue.length) {
            this.isAnimating = false;
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }

    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }

    // Utility methods
    setCharset(charsetName) {
        if (this.charSets[charsetName]) {
            this.chars = this.charSets[charsetName];
            return true;
        }
        return false;
    }

    setColor(color) {
        this.options.color = color;
    }

    setSpeed(speed) {
        this.options.speed = Math.max(1, Math.min(10, speed));
    }

    reset() {
        this.scrambleTo(this.originalText);
    }

    static autoHover(selector, hoverText = null, options = {}) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(el => {
            const glitch = new GlitchText(el, options);
            const originalText = el.textContent;
            const targetText = hoverText || originalText;

            el.addEventListener('mouseenter', () => {
                glitch.scrambleTo(targetText);
            });

            if (hoverText) {
                el.addEventListener('mouseleave', () => {
                    glitch.scrambleTo(originalText);
                });
            }
        });
    }

    static quickScramble(selector, text, options = {}) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(el => {
            const glitch = new GlitchText(el, options);
            glitch.scrambleTo(text);
        });
    }
}

class GlitchCycle {
    constructor(element, textArray, options = {}) {
        this.element = element;
        this.texts = textArray;
        this.currentIndex = 0;
        this.isRunning = false;
        this.options = {
            interval: 3000,
            pauseOnLast: 10000,
            ...options
        };

        this.glitch = new GlitchText(element, options);
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.cycle();
    }

    stop() {
        this.isRunning = false;
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    cycle() {
        if (!this.isRunning) return;

        const currentText = this.texts[this.currentIndex];
        const isLast = this.currentIndex === this.texts.length - 1;
        const delay = isLast ? this.options.pauseOnLast : this.options.interval;

        this.glitch.scrambleTo(currentText).then(() => {
            this.timeout = setTimeout(() => {
                this.currentIndex = (this.currentIndex + 1) % this.texts.length;
                this.cycle();
            }, delay);
        });
    }
}

class GlitchPresets {
    static logo(selector, expandedText, options = {}) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(el => {
            const glitch = new GlitchText(el, {
                charset: 'tech2',
                speed: 6,
                color: '#00ff88',
                ...options
            });

            const originalText = el.textContent;
            let isExpanded = false;

            el.addEventListener('mouseenter', () => {
                isExpanded = true;
                glitch.scrambleTo(expandedText).then(() => {
                    if (!isExpanded) {
                        glitch.scrambleTo(originalText);
                    }
                });
            });

            el.addEventListener('mouseleave', () => {
                isExpanded = false;
                if (!glitch.isAnimating) {
                    glitch.scrambleTo(originalText);
                }
            });
        });
    }

    static navbar(selector, options = {}) {
        GlitchText.autoHover(selector, null, {
            charset: 'tech2',
            speed: 8,
            color: '#00ff88',
            glowIntensity: 6,
            ...options
        });
    }

    static matrix(selector, options = {}) {
        GlitchText.autoHover(selector, null, {
            charset: 'matrix1',
            speed: 4,
            color: '#00ff41',
            glowIntensity: 10,
            ...options
        });
    }

    static cyberpunk(selector, options = {}) {
        GlitchText.autoHover(selector, null, {
            charset: 'cyberpunk',
            speed: 7,
            color: '#ff0080',
            glowIntensity: 12,
            ...options
        });
    }

    static typing(selector, textArray, options = {}) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(el => {
            const cycle = new GlitchCycle(el, textArray, {
                charset: 'tech2',
                speed: 5,
                color: '#00ff88',
                interval: 2500,
                pauseOnLast: 8000,
                ...options
            });

            cycle.start();
        });
    }
}

if (!document.getElementById('glitch-effect-css')) {
    const style = document.createElement('style');
    style.id = 'glitch-effect-css';
    style.textContent = `
        .glitch-char {
            display: inline;
            animation: glitchFlicker 0.1s ease-in-out infinite alternate;
        }
        
        @keyframes glitchFlicker {
            0% { opacity: 1; }
            50% { opacity: 0.8; }
            100% { opacity: 1; }
        }
        
        .reduced-motion .glitch-char {
            animation: none !important;
            text-shadow: none !important;
        }
    `;
    document.head.appendChild(style);
}

// Make classes globally available
window.GlitchText = GlitchText;
window.GlitchCycle = GlitchCycle;
window.GlitchPresets = GlitchPresets;

function initSignature() {
    const signature = document.getElementById('signature');

    if (signature) {
        const glitch = new GlitchText(signature, {
            charset: 'tech2',
            speed: 3,
            color: '#00ff88',
            glowIntensity: 8,
            activeGlowIntensity: 12
        });

        signature.addEventListener('mouseenter', () => {
            glitch.scrambleTo('Mohamed G.');
        });

        signature.addEventListener('mouseleave', () => {
            glitch.scrambleTo('M');
        });
    }
}

function createParticles() {
    const animatedBg = document.getElementById('animatedBg');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        particle.style.left = Math.random() * 100 + '%';

        const duration = 20 + Math.random() * 20;
        particle.style.animationDuration = duration + 's';

        const delay = Math.random() * 10;
        particle.style.animationDelay = delay + 's';

        animatedBg.appendChild(particle);
    }
}

const REFRESH_INTERVAL = 2000;
const CTF_FEED_URL = 'https://ccs-unchk.games/scoreboard/ajax/feed';
const CORS_PROXY = 'https://api.allorigins.win/get?url=';

const teamMembersData = {
    "Bruteforce": [
        { fullName: "Malick Mbengue", pseudo: "x5GIGAx", promo: "P12" },
        { fullName: "Hawa Hann", pseudo: "~¶¡sc3s", promo: "P12" }
    ],
    "Zero Day Minds": [
        { fullName: "Assane Kane", pseudo: "Shinobicode", promo: "P12" },
        { fullName: "Fatoumata Ka", pseudo: "kunoichi shiro", promo: "P12" },
        { fullName: "Mariama Sow", pseudo: "Deborah", promo: "P11" },
        { fullName: "Serigne Saliou Gningue", pseudo: "Ghost_gn", promo: "P12" }
    ],
    "THE FLAG HUNTERS": [
        { fullName: "Khalifa Ababacar Fall", pseudo: "GREEN_MBAMBA_0X", promo: "P12" },
        { fullName: "Abdou Latif Badji", pseudo: "TFHOTT 00", promo: "P12" },
        { fullName: "Pape Salif Diop", pseudo: "Papii167", promo: "P12" },
        { fullName: "Abibou Nokho", pseudo: "Firewallx", promo: "P12" }
    ],
    "THE FIERCE": [
        { fullName: "Esther Annette Saizonou", pseudo: "Mysterious girl🌒🪙", promo: "P12" },
        { fullName: "Fatou Camara Diop", pseudo: "Mata", promo: "P12" },
        { fullName: "Mamy Coumba Ndiaye", pseudo: "MAMY", promo: "P12" },
        { fullName: "Mamadou Aliou Mballo", pseudo: "Aliou", promo: "P12" }
    ],
    "Hacking-beginners": [
        { fullName: "Sadibou Sar", pseudo: "Whyman", promo: "P12" },
        { fullName: "Hawa Kane", pseudo: "hk083", promo: "P12" },
        { fullName: "Ndeye Bougoumar Sall Diop", pseudo: "Bougou", promo: "P12" },
        { fullName: "Mouhamadou Kane", pseudo: "Momo", promo: "P12" }
    ],
    "Small hacker": [
        { fullName: "Assane Gueye", pseudo: "Jeune mouride", promo: "P12" },
        { fullName: "Pape Dramé", pseudo: "L'enfant noire", promo: "P12" }
    ],
    "PhamtomCore": [
        { fullName: "Babacar Toure", pseudo: "Darkman", promo: "P12" },
        { fullName: "Fatou Thiaw", pseudo: "Une fadilate", promo: "P12" }
    ],
    "MUGUIWARA": [
        { fullName: "Marie Camara Sarr", pseudo: "Robin", promo: "P11" },
        { fullName: "Ibrahima Thiam", pseudo: "Ibou075", promo: "P11" },
        { fullName: "Abdoulaye Aw", pseudo: "MonkeyDLuffy212", promo: "P10" },
        { fullName: "Rokhaya Niang", pseudo: "Kya", promo: "P11" }
    ],
    "Cyberteam": [
        { fullName: "Diodio Khouma", pseudo: "Deucalion", promo: "P12" },
        { fullName: "Adjia Boury Diop", pseudo: "BLB", promo: "P12" },
        { fullName: "Seydina Mandione Gueye", pseudo: "CBT", promo: "P12" },
        { fullName: "Sette Cissé", pseudo: "7/6", promo: "P12" }
    ],
    "Next Security": [
        { fullName: "Amadou Tely Diallo", pseudo: "GHOST", promo: "P12" },
        { fullName: "Khalifa Ababacar Thiaw", pseudo: "ARCHIMED", promo: "P12" }
    ],
    "Cyber Guard": [
        { fullName: "Awa Cheikh Ndiaye", pseudo: "Pegaz03", promo: "P12" },
        { fullName: "Khadidjatou Bayo", pseudo: "Techna", promo: "P12" },
        { fullName: "Mohamed Mbaye Ndiaye", pseudo: "Shadow_byte", promo: "P12" }
    ],
    "Darklayer": [
        { fullName: "Serigne Saliou Sarr", pseudo: "Seugn", promo: "P12" },
        { fullName: "Ange Ndong", pseudo: "RootSpecteur", promo: "P12" },
        { fullName: "Youssou Sall", pseudo: "Ichigo69", promo: "P10" }
    ],
    "Cipherstorm": [
        { fullName: "Gora Guisse", pseudo: "Godzé", promo: "P12" },
        { fullName: "Sadio Diarra", pseudo: "Le Villageois", promo: "P12" }
    ],
    "Hacked": [
        { fullName: "Amadou Sall Bousso", pseudo: "Hacked", promo: "P11" }
    ],
    "C.2I.R": [
        { fullName: "Marie Berthine Badji", pseudo: "Kalicit@_MBB", promo: "P11" },
        { fullName: "Pape Babacar Mbodj", pseudo: "Lobo_solit@rio", promo: "P11" },
        { fullName: "Mame Arame Ndao", pseudo: "Arame", promo: "P11" },
        { fullName: "Zeynabou Diouf", pseudo: "Nassri", promo: "P11" }
    ],
    "AnonTeam": [
        { fullName: "Yacine Diagne", pseudo: "Ghost girl", promo: "P11" },
        { fullName: "Yaya Diao", pseudo: "0x6rss", promo: "P11" },
        { fullName: "Mademba Niang", pseudo: "Ndiolmi", promo: "P11" }
    ],
    "THE BLACK PAYLOAD": [
        { fullName: "Boubacar Fall", pseudo: "ShotoX", promo: "P10" },
        { fullName: "Ibrahima Lo", pseudo: "Isaac", promo: "P10" },
        { fullName: "Ouleye Kane", pseudo: "Ouleyyyyy", promo: "P10" },
        { fullName: "Abdoul Aziz Ndir", pseudo: "AZID_X", promo: "P10" }
    ],
    "Moby Dick": [
        { fullName: "Mouhamed Moustapha Faye", pseudo: "Marshall-D-Teach", promo: "P11" },
        { fullName: "Coumba Seck", pseudo: "Coumba", promo: "P11" },
        { fullName: "Souleymane Soula Badji", pseudo: "S²B ETHIC", promo: "P11" }
    ],

    "Shadow_byte": [
        { fullName: "Ramatoulaye Faye", pseudo: "Shadow_byte", promo: "N/A" }
    ],
    "loufa": [
        { fullName: "Fallou Seck", pseudo: "loufa", promo: "P11" }
    ],
    "Diagne": [
        { fullName: "Dieynaba Diagne", pseudo: "Diagne", promo: "P11" }
    ],
    "Askia_Wannacry": [
        { fullName: "Mouhammed Lamine Toure", pseudo: "Askia_Wannacry", promo: "P11" }
    ],
    "Ꮆ卄ㄖ丂ㄒ-鬼 👻": [
        { fullName: "Mamadou Fati", pseudo: "Ꮆ卄ㄖ丂ㄒ-鬼 👻", promo: "P11" }
    ],
    "crack": [
        { fullName: "Mariama kesso Diallo", pseudo: "Battante", promo: "P11" }
    ],
    "tamsir3335": [
        { fullName: "Tamsir Diarra", pseudo: "tamsir3335", promo: "P11" }
    ],
    "BL4CKSH4D0W": [
        { fullName: "Maoloud Seye", pseudo: "BL4CKSH4D0W", promo: "P12" }
    ],
    "Baye_Guinarr": [
        { fullName: "Mouhamed El Malick Idrissa Diop", pseudo: "Baye Guinarr", promo: "P10" }
    ],
    "ju5tu5": [
        { fullName: "Mandiaye", pseudo: "ju5tu5", promo: "P10" }
    ],
    "AlexSkyTop": [
        { fullName: "Baba Top", pseudo: "AlexSkyTop", promo: "P12" }
    ],
    "Bb fa": [
        { fullName: "Fatou kiné Seck", pseudo: "Bb fa", promo: "P11" }
    ],
    "Ameenah": [
        { fullName: "Aminata Fall", pseudo: "Ameenah", promo: "P10" }
    ],
    "yassine": [
        { fullName: "Yassine Ndao", pseudo: "yassine", promo: "P11" }
    ],
    "Black_Gojo": [
        { fullName: "Saleh Sané", pseudo: "Black_Gojo", promo: "P11" }
    ],
    "NinjaFurtif": [
        { fullName: "Mouhamed Bachir Gningue", pseudo: "NinjaFurtif", promo: "P11" }
    ],
    "Pegasus": [
        { fullName: "Mamadou woury Ba", pseudo: "Pegasus", promo: "P11" }
    ],
    "Mame": [
        { fullName: "Mame Khalifa Gueye", pseudo: "Mame", promo: "P11" }
    ],
    "Z3in3b0u": [
        { fullName: "Zeinebou Mohamed H'meida", pseudo: "Z3in3b0u", promo: "P11" }
    ],
    "j.doe12": [
        { fullName: "Soukeye SAMBE", pseudo: "j.doe12", promo: "P12" }
    ],
    "Amina": [
        { fullName: "Aminata Diagne", pseudo: "Amina", promo: "P11" }
    ],
    "Les alchimistes": [
        { fullName: "Mohamed fadel Ndiaye", pseudo: "Les alchimistes", promo: "P12" }
    ],
    "bunybugs03": [
        { fullName: "Ndiouga Gueye", pseudo: "bunybugs03", promo: "P11" }
    ],
    "Rifou maker": [
        { fullName: "Cherif Seck", pseudo: "Rifou maker", promo: "P8" }
    ],
    "Ladywhistledown": [
        { fullName: "Fary Fall", pseudo: "Ladywhistledown", promo: "P9" }
    ],
    "Ibou075": [
        { fullName: "Ibrahima Thiam", pseudo: "Ibou075", promo: "P11" }
    ],
    "Sokhna Maty saliou": [
        { fullName: "Maty Gning", pseudo: "Sokhna Maty saliou", promo: "P12" }
    ],
    "Belzebuth": [
        { fullName: "Omar Pane", pseudo: "Belzebuth", promo: "P12" }
    ],
    "Club7": [
        { fullName: "Martin GAILLARD", pseudo: "Club7", promo: "P10" }
    ],
    "MITOMA": [
        { fullName: "Mamadou l Diédhiou", pseudo: "MITOMA", promo: "P12" }
    ],
    "Chatnwarr": [
        { fullName: "Mouhamadou Moustapha FALL", pseudo: "Chatnwarr", promo: "P11" }
    ],
    "Sock": [
        { fullName: "Balla SOCK", pseudo: "sock", promo: "P9" }
    ],
    "baba": [
        { fullName: "Ousseynou Ndiaye", pseudo: "baba", promo: "Ecole Iprosi" }
    ],
    "Darkman": [
        { fullName: "Mouhamadou Mokhtar Thiam", pseudo: "Darkman", promo: "P11" }
    ],
    "someone": [
        { fullName: "Fatou Boye Ba", pseudo: "someone", promo: "P11" }
    ],
    "Aicha": [
        { fullName: "AIssata Ndiaye", pseudo: "Aicha", promo: "P12" }
    ],
    "Danie": [
        { fullName: "Angela Moduba", pseudo: "Danie", promo: "P12" }
    ],
    "Marie": [
        { fullName: "Mariétou Talla", pseudo: "Marie", promo: "P12" }
    ],
    "Beuleup": [
        { fullName: "Abdou NDAO", pseudo: "Beuleup", promo: "P11" }
    ]
};

const group1Teams = [
    "BruteForce", "Zero Day Minds", "THE FLAG HUNTERS", "THE FIERCE",
    "Hacking-beginners", "Small hacker", "PhamtomCore", "MUGUIWARA",
    "Cyberteam", "Next Security", "Cyber Guard", "Darklayer", "Cipherstorm",
    "Diagne", "Askia_Wannacry", "Ꮆ卄ㄖ丂ㄒ-鬼 👻", "crack", "Baye_Guinarr", "ju5tu5",
    "Bb fa", "Ameenah", "yassine", "Black_Gojo", "NinjaFurtif", "Pegasus", "Mame",
    "Z3in3b0u", "j.doe12", "Amina", "Les alchimistes", "Rifou maker", "Ladywhistledown",
    "Ibou075", "Sokhna Maty saliou", "Belzebuth", "MITOMA", "Chatnwarr", "sock",
    "baba", "Darkman", "someone", "Aicha", "Danie", "Marie", "Beuleup"
];

const group2Teams = [
    "C.2I.R", "AnonTeam", "THE BLACK PAYLOAD", "Moby Dick",
    "loufa", "tamsir3335", "BL4CKSH4D0W", "AlexSkyTop", "bunybugs03", "Club7"
];

let allTeams = [];
let filteredTeams = [];
let currentFilter = 'all';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', function () {
    createParticles();
    setupEventListeners();
    setupModalListeners();
    loadData();
    startAutoRefresh();
    initSignature();
});

function setupEventListeners() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            applyFilters();
        });
    });

    document.getElementById('searchInput').addEventListener('input', function () {
        currentSearch = this.value.toLowerCase();
        applyFilters();
    });
}

async function loadData() {
    try {
        updateStatus('Terminé');
        const feedData = await fetchCTFFeed();
        processTeamData(feedData);
        updateStatus('Terminé');
    } catch (error) {
        console.error('Error loading data:', error);
        updateStatus('Erreur de connexion');
        processFallbackData();
    }
}

async function fetchCTFFeed() {
    console.log('Using CORS proxy...');
    const proxyResponse = await fetch(`${CORS_PROXY}${encodeURIComponent(CTF_FEED_URL)}`);
    if (!proxyResponse.ok) {
        throw new Error('CORS proxy fetch failed');
    }
    const data = await proxyResponse.json();
    return JSON.parse(data.contents);
}

function processTeamData(feedData) {
    if (!feedData || !feedData.standings) {
        throw new Error('Invalid feed data format');
    }

    allTeams = feedData.standings.map(standing => {
        const teamName = standing.team;
        const members = teamMembersData[teamName] || [
            { fullName: "Membre inconnu", pseudo: "unknown", promo: "N/A" }
        ];

        let group = '1';
        if (group2Teams.includes(teamName)) {
            group = '2';
        }

        return {
            name: teamName,
            score: standing.score || 0,
            rank: standing.pos || 0,
            group: group,
            members: members
        };
    });

    allTeams.sort((a, b) => b.score - a.score);
    allTeams = allTeams.map((team, index) => ({
        ...team,
        rank: index + 1
    }));

    applyFilters();
}

function processFallbackData() {
    allTeams = [];

    group1Teams.forEach((teamName, index) => {
        if (teamMembersData[teamName]) {
            allTeams.push({
                name: teamName,
                score: 0,
                rank: index + 1,
                group: '1',
                members: teamMembersData[teamName]
            });
        }
    });


    group2Teams.forEach((teamName, index) => {
        if (teamMembersData[teamName]) {
            allTeams.push({
                name: teamName,
                score: 0,
                rank: group1Teams.length + index + 1,
                group: '2',
                members: teamMembersData[teamName]
            });
        }
    });

    applyFilters();
}

function applyFilters() {
    filteredTeams = allTeams.filter(team => {
        if (currentFilter === 'group1' && team.group !== '1') return false;
        if (currentFilter === 'group2' && team.group !== '2') return false;
        if (currentSearch && !team.name.toLowerCase().includes(currentSearch)) return false;
        return true;
    });

    filteredTeams = filteredTeams.map((team, index) => ({
        ...team,
        filteredRank: index + 1
    }));

    updateHeroStats();
    renderPodium();
    renderLeaderboard();
}

function updateHeroStats() {
    const totalTeams = allTeams.length;
    const activeTeams = allTeams.filter(team => team.score > 0).length;
    const totalPoints = allTeams.reduce((sum, team) => sum + team.score, 0);

    document.getElementById('totalTeams').textContent = totalTeams.toLocaleString();
    document.getElementById('onlineTeams').textContent = activeTeams.toLocaleString();
    document.getElementById('totalPoints').textContent = totalPoints.toLocaleString();
}

function renderPodium() {
    const podiumContainer = document.getElementById('podiumContainer');
    const topThree = filteredTeams.slice(0, 3);

    if (topThree.length === 0) {
        podiumContainer.innerHTML = '';
        return;
    }

    const podiumHTML = topThree.map((team, index) => {
        const rank = index + 1;
        const groupBadge = team.group === '1' ? 'group-1-badge' : 'group-2-badge';

        let specialTitle = '';
        if (rank === 1) {
            specialTitle = 'IMPERIALS';
        } else if (rank === 2) {
            specialTitle = 'KINGS';
        } else if (rank === 3) {
            specialTitle = 'WIZARDS';
        }

        let fireParticles = '';
        if (rank === 1) {
            fireParticles = `
                <div class="fire-particle" style="--i:0;"></div>
                <div class="fire-particle" style="--i:1;"></div>
                <div class="fire-particle" style="--i:2;"></div>
            `;
        }

        return `
            <div class="podium-position podium-${rank}">
                <div class="podium-card" data-team-name="${team.name}">
                    <div class="podium-rank">${rank}e</div>
                    <div class="podium-team-name ${rank === 1 ? 'fire-text' : ''}">${team.name}</div>
                    <div class="podium-score">${team.score.toLocaleString()}</div>
                    <div class="podium-group ${groupBadge}">${specialTitle}</div>
                    ${fireParticles}
                </div>
                <div class="podium-base"></div>
            </div>
        `;
    }).join('');

    podiumContainer.innerHTML = podiumHTML;

    document.querySelectorAll('.podium-card').forEach(card => {
        card.addEventListener('click', function () {
            const teamName = this.dataset.teamName;
            openModal(teamName);
        });
    });
}

function renderLeaderboard() {
    const leaderboardContent = document.getElementById('leaderboardContent');
    const remainingTeams = filteredTeams.slice(3);

    if (remainingTeams.length === 0 && filteredTeams.length <= 3) {
        leaderboardContent.innerHTML = filteredTeams.length === 0 ? `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <p>Aucune équipe trouvée</p>
            </div>
        ` : '';
        return;
    }

    const leaderboardHTML = remainingTeams.map((team, index) => {
        const groupBadge = team.group === '1' ? 'group-1-badge' : 'group-2-badge';
        const teamId = team.name.replace(/[^a-zA-Z0-9]/g, '_');
        const displayRank = index + 4;

        return `
            <div class="team-row" data-team="${team.name}">
                <div class="rank-display">${displayRank}e</div>
                <div class="team-info-grid">
                    <div class="team-name-display">${team.name}</div>
                    <div class="team-meta">
                        <span class="group-indicator ${groupBadge}">G${team.group}</span>
                        <span>${team.members.length} membre${team.members.length > 1 ? 's' : ''}</span>
                    </div>
                </div>
                <div class="score-display">${team.score.toLocaleString()}</div>
                <div class="expand-indicator"> pts</div>
            </div>
            <div class="team-details" id="details-${teamId}">
                <div class="members-grid">
                    ${team.members.map(member => `
                        <div class="member-card">
                            <div class="member-name">${member.fullName}</div>
                            <div class="member-pseudo">${member.pseudo}</div>
                            <div class="member-promo">Promo ${member.promo}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');

    leaderboardContent.innerHTML = leaderboardHTML;

    document.querySelectorAll('.team-row').forEach(row => {
        row.addEventListener('click', function (e) {
            const teamName = this.dataset.team;

            if (e.target.classList.contains('expand-indicator')) {
                const teamId = teamName.replace(/[^a-zA-Z0-9]/g, '_');
                const detailsDiv = document.getElementById(`details-${teamId}`);

                this.classList.toggle('expanded');
                detailsDiv.classList.toggle('show');
            } else {
                openModal(teamName);
            }
        });
    });
}

function updateStatus(message) {
    const status = document.getElementById('statusCompact');
    status.querySelector('span').textContent = message;
}

function startAutoRefresh() {
    // Auto-refresh disabled - marked as terminated
    updateStatus('Terminé');
    console.log('Auto-refresh disabled');
}



document.addEventListener('DOMContentLoaded', function () {
    createParticles();
    setupEventListeners();
    setupModalListeners();
    loadData();
    startAutoRefresh();
    initSignature();
});

function setupModalListeners() {
    const modal = document.querySelector('.modal-overlay');
    const modalClose = document.querySelector('.modal-close');

    modalClose.addEventListener('click', closeModal);

    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
}

function openModal(teamName) {
    const team = allTeams.find(t => t.name === teamName);
    if (!team) return;

    const modal = document.querySelector('.modal-overlay');
    const modalTitle = document.querySelector('.modal-title');
    const modalTeamInfo = document.querySelector('.modal-team-info');
    const modalMembersGrid = document.querySelector('.modal-members-grid');

    modal.className = 'modal-overlay show';

    if (team.rank <= 3) {
        modal.classList.add(`modal-rank-${team.rank}`);
    }

    modalTitle.innerHTML = `
        <span>${team.name}</span>
    `;

    const groupBadge = team.group === '1' ? 'group-1-badge' : 'group-2-badge';
    modalTeamInfo.innerHTML = `
        <div>
            <div class="modal-score">${team.score.toLocaleString()} pts</div>
            <div style="font-size: 14px; color: var(--text-muted); margin-top: 4px;">Position ${team.rank}e</div>
        </div>
        <div class="modal-group-badge ${groupBadge}">Groupe ${team.group}</div>
    `;

    modalMembersGrid.innerHTML = team.members.map((member, index) => {
        const crownHtml = (team.rank === 1 && index === 777) ? `
            <div class="modal-member-crown">
                <svg class="crown-icon" viewBox="0 0 14 14">
                    <path d="M5 16L3 5l3.5 2.5L12 4l5.5 3.5L21 5l-2 11H5zm2.7-2h8.6l.9-5.4-2.1 1.5L12  8l-3.1 2.1-2.1-1.5L7.7 14z"/>
                </svg>
            </div>
        ` : '';

        const memberCardClass = (team.rank === 1 && index === 888) ? 'modal-member-card crown-member' : 'modal-member-card';

        return `
            <div class="${memberCardClass}">
                ${crownHtml}
                <div class="modal-member-name">${member.fullName}</div>
                <div class="modal-member-pseudo">${member.pseudo}</div>
                <div class="modal-member-promo">Promo ${member.promo}</div>
            </div>
        `;
    }).join('');

    modal.style.display = 'flex';
    modal.offsetHeight;
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    modal.classList.remove('show');
    modal.classList.remove('modal-rank-1', 'modal-rank-2', 'modal-rank-3');

    setTimeout(() => {
        if (!modal.classList.contains('show')) {
            modal.style.display = 'none';
        }
    }, 300);
}

document.addEventListener('DOMContentLoaded', function () {
    const signature = document.getElementById('signature');

    if (signature && window.GlitchText) {
        const glitch = new GlitchText(signature, {
            charset: 'tech2',
            speed: 3,
            color: '#00ff88',
            glowIntensity: 8,
            activeGlowIntensity: 12
        });

        signature.addEventListener('mouseenter', () => {
            glitch.scrambleTo('Mohamed ‎  ‎ G.');
        });

        signature.addEventListener('mouseleave', () => {
            glitch.scrambleTo('M');
        });
    }

    //setTimeout(initFireEffect, 2000);
});