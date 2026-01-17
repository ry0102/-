/* 
  NeuroGain - Design System 
  Theme: Modern Dark, Neon, Glassmorphism
*/

:root {
    /* Colors */
    --bg-dark: #0a0b1e;
    --bg-panel: rgba(20, 22, 45, 0.6);
    --primary: #5effc9;
    /* Neon Mint */
    --secondary: #a37dfc;
    /* Soft Neon Purple */
    --accent: #ff7eb6;
    /* Neon Pink */
    --text-main: #ffffff;
    --text-muted: #8b9bb4;
    --glass-border: rgba(255, 255, 255, 0.1);

    /* Effects */
    --glow-primary: 0 0 20px rgba(94, 255, 201, 0.4);
    --glow-text: 0 0 10px rgba(255, 255, 255, 0.5);

    /* Fonts */
    --font-heading: 'Outfit', sans-serif;
    --font-body: 'Zen Maru Gothic', sans-serif;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
}

body {
    background-color: var(--bg-dark);
    color: var(--text-main);
    font-family: var(--font-body);
    /* Allow scrolling on mobile, hidden on desktop only if needed */
    overflow-y: auto;
    height: 100vh;
    height: 100dvh;
    /* Use dynamic viewport height */
}

/* Background Animation */
.app-container {
    position: relative;
    width: 100%;
    min-height: 100%;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
}

/* ... (Existing orbs/grid lines remain same) ... */

/* Main Content */
#main-content {
    position: relative;
    z-index: 10;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    /* Changed from center to allow scrolling top-aligned content */
    padding: 1rem;
    overflow-y: auto;
    /* Ensure content handles its own scroll if needed, but usually body handles it */
}

/* Screen general styles */
.screen {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: opacity 0.4s ease, transform 0.4s ease;
    padding-bottom: 2rem;
    /* Add breathing room at bottom */
    margin-top: 2rem;
    /* Add margin top to not be covered by header on scroll */
}

/* ... */

/* Mobile Optimizations for Game Area */
@media (max-width: 600px) {
    body {
        height: auto;
        /* Let body grow */
        min-height: 100dvh;
    }

    .main-header {
        padding: 1rem;
    }

    .logo {
        font-size: 1.2rem;
    }

    /* Game Screen Compactness */
    #screen-game {
        margin-top: 0;
        justify-content: flex-start;
        height: 100%;
    }

    .game-header {
        margin-bottom: 1rem;
        padding: 0.5rem;
    }

    .stat-box .value {
        font-size: 1.2rem;
    }

    .display-area {
        min-height: 150px;
        /* Reduce height */
        margin-bottom: 1rem;
    }

    #stimulus-container {
        font-size: 4rem;
        /* Smaller numbers */
    }

    .answer-slots {
        margin-bottom: 1rem;
    }

    .slot {
        width: 30px;
        height: 40px;
        font-size: 1.2rem;
    }

    /* Compact Numpad */
    .numpad {
        gap: 8px;
    }

    .num-btn {
        padding: 0.8rem;
        /* Smaller padding */
        font-size: 1.2rem;
        border-radius: 12px;
    }

    /* Ensure ranking list is scrollable within screen if huge */
    .ranking-list {
        max-height: 50vh;
        overflow-y: auto;
    }
}

.bg-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
    z-index: 0;
    animation: float 20s infinite ease-in-out;
}

.orb-1 {
    width: 300px;
    height: 300px;
    background: var(--primary);
    top: -50px;
    left: -50px;
}

.orb-2 {
    width: 400px;
    height: 400px;
    background: var(--secondary);
    bottom: -100px;
    right: -100px;
    animation-delay: -10s;
}

.grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    z-index: 0;
    pointer-events: none;
}

@keyframes float {

    0%,
    100% {
        transform: translate(0, 0);
    }

    50% {
        transform: translate(30px, 50px);
    }
}

/* Header */
.main-header {
    position: relative;
    z-index: 10;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 1.5rem;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.icon-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--glass-border);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    color: var(--text-main);
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.2s;
}

.icon-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

/* Main Content */
#main-content {
    position: relative;
    z-index: 10;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
}

.screen {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: opacity 0.4s ease, transform 0.4s ease;
}

.screen.hidden {
    display: none;
    opacity: 0;
    transform: scale(0.95);
}

.screen.active {
    display: flex;
    /* Flex is set specific to screen type usually, but default here */
    opacity: 1;
    transform: scale(1);
    animation: fadeIn 0.4s forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.98);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* Typography */
.hero-title {
    font-family: var(--font-heading);
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(to right, var(--text-main), var(--primary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: var(--glow-primary);
}

.hero-subtitle {
    color: var(--text-muted);
    margin-bottom: 2rem;
}

/* Cards */
.game-cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
}

.game-card {
    background: var(--bg-panel);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(12px);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
    text-align: left;
    width: 100%;
}

.game-card:hover {
    transform: translateY(-2px);
    background: rgba(40, 44, 80, 0.7);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2), 0 0 15px rgba(94, 255, 201, 0.1);
    border-color: var(--primary);
}

.card-icon {
    font-size: 2.5rem;
    background: rgba(255, 255, 255, 0.05);
    width: 70px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
}

.card-content h3 {
    font-family: var(--font-heading);
    font-size: 1.2rem;
    margin-bottom: 0.2rem;
}

.card-content p {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.tag {
    display: inline-block;
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    background: rgba(163, 125, 252, 0.2);
    color: var(--secondary);
    border: 1px solid rgba(163, 125, 252, 0.3);
}

/* Settings Panel */
.settings-panel,
.result-card {
    background: var(--bg-panel);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(16px);
    padding: 2rem;
    border-radius: 24px;
    width: 100%;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    text-align: center;
}

.setting-group {
    margin-bottom: 1.5rem;
    text-align: left;
}

.setting-group label {
    display: block;
    margin-bottom: 0.8rem;
    color: var(--text-muted);
    font-size: 0.9rem;
}

.segmented-control {
    display: flex;
    background: rgba(0, 0, 0, 0.3);
    padding: 4px;
    border-radius: 12px;
}

.segmented-control button {
    flex: 1;
    background: transparent;
    border: none;
    padding: 0.8rem;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
    font-family: var(--font-heading);
}

.segmented-control button.active {
    background: var(--primary);
    color: #000;
    font-weight: 700;
    box-shadow: 0 2px 10px rgba(94, 255, 201, 0.3);
}

.primary-btn {
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, var(--primary), #3bccc4);
    border: none;
    border-radius: 12px;
    color: #000;
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    margin-top: 1rem;
    transition: transform 0.1s, filter 0.2s;
    box-shadow: 0 5px 20px rgba(94, 255, 201, 0.3);
}

.primary-btn:active {
    transform: scale(0.98);
    filter: brightness(0.9);
}

.secondary-btn {
    width: 100%;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    color: var(--text-main);
    font-weight: 500;
    cursor: pointer;
    margin-top: 10px;
}

.text-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    margin-top: 1rem;
    cursor: pointer;
    text-decoration: underline;
}

/* Game Area */
.game-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
    background: rgba(0, 0, 0, 0.2);
    padding: 1rem;
    border-radius: 16px;
    border: 1px solid var(--glass-border);
}

.stat-box {
    text-align: center;
}

.stat-box .label {
    display: block;
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
}

.stat-box .value {
    display: block;
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary);
}

.display-area {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2rem;
}

#stimulus-container {
    font-size: 6rem;
    font-weight: 700;
    font-family: var(--font-heading);
    color: var(--text-main);
    text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
    min-height: 120px;
}

/* Fade in/out for numbers */
.fade-enter {
    animation: zoomIn 0.3s forwards;
}

.fade-exit {
    animation: zoomOut 0.3s forwards;
}

@keyframes zoomIn {
    from {
        opacity: 0;
        transform: scale(0.5);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes zoomOut {
    from {
        opacity: 1;
        transform: scale(1);
    }

    to {
        opacity: 0;
        transform: scale(1.5);
    }
}

.pulse {
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }

    50% {
        transform: scale(1.1);
        opacity: 0.8;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

/* Scattered Game Specifics */
.scatter-grid {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.scatter-box {
    width: 60px;
    height: 80px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid var(--glass-border);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: var(--primary);
}

/* Input Area */
.input-area {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
}

.answer-slots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    min-height: 60px;
}

.slot {
    width: 40px;
    height: 50px;
    border-bottom: 2px solid var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: var(--text-main);
}

.slot.filled {
    border-color: var(--primary);
    color: var(--primary);
}

.slot.correct {
    border-color: #4cd964;
    color: #4cd964;
}

.slot.incorrect {
    border-color: #ff3b30;
    color: #ff3b30;
}

.numpad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
}

.num-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--glass-border);
    color: var(--text-main);
    padding: 1.2rem;
    font-size: 1.5rem;
    border-radius: 16px;
    cursor: pointer;
    transition: background 0.1s;
    font-family: var(--font-heading);
}

.num-btn:active {
    background: rgba(255, 255, 255, 0.2);
}

.action-btn.bg-red {
    color: #ff7eb6;
    border-color: rgba(255, 126, 182, 0.3);
}

.action-btn.bg-green {
    color: var(--primary);
    border-color: rgba(94, 255, 201, 0.3);
}

/* Results */
.final-score {
    margin: 2rem 0;
}

.score-label {
    display: block;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
}

.score-value {
    display: block;
    font-size: 4rem;
    font-weight: 700;
    color: var(--primary);
    text-shadow: 0 0 30px rgba(94, 255, 201, 0.5);
    line-height: 1;
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
}

.stat-item {
    background: rgba(0, 0, 0, 0.2);
    padding: 1rem;
    border-radius: 12px;
}

@media (min-width: 768px) {
    .game-cards {
        flex-direction: row;
        align-items: flex-start;
    }

    .card-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
    }

    .game-card {
        flex-direction: column;
        text-align: center;
        width: 100%;
    }

    .card-icon {
        margin-bottom: 1rem;
    }
}

/* Fix text color for buttons */
button {
    color: var(--text-main);
}

.game-card {
    color: var(--text-main);
    /* Ensure text is white */
}

/* Rule Button & Modal */
.card-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
}

.rule-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 8px;
    padding: 0.5rem;
    color: var(--text-muted);
    font-size: 0.8rem;
    cursor: pointer;
    transition: background 0.2s;
}

.rule-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: var(--text-main);
}

.modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
}

.modal.active {
    opacity: 1;
    pointer-events: all;
}

.modal-content {
    background: var(--bg-dark);
    border: 1px solid var(--primary);
    padding: 2rem;
    border-radius: 20px;
    max-width: 90%;
    width: 400px;
    text-align: center;
    box-shadow: 0 0 30px rgba(94, 255, 201, 0.2);
}

.modal-content h2 {
    color: var(--primary);
    margin-bottom: 1rem;
    font-family: var(--font-heading);
}

.modal-content p {
    color: var(--text-main);
    line-height: 1.6;
    margin-bottom: 2rem;
    text-align: left;
    white-space: pre-wrap;
    /* Allow newlines */
}

/* Floating Score Animation */
.floating-score {
    position: absolute;
    color: #ffd700;
    font-weight: bold;
    font-size: 1.5rem;
    pointer-events: none;
    animation: floatUp 1s ease-out forwards;
    z-index: 100;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

@keyframes floatUp {
    0% {
        opacity: 0;
        transform: translateY(0) scale(0.5);
    }

    20% {
        opacity: 1;
        transform: translateY(-20px) scale(1.2);
    }

    100% {
        opacity: 0;
        transform: translateY(-100px) scale(1);
    }
}

.multiplier-text {
    font-size: 0.8em;
    color: #ffaa00;
    margin-left: 5px;
}

.streak-counter {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 2rem;
    color: var(--primary);
    font-weight: bold;
    opacity: 0;
    transition: opacity 0.3s;
}

.streak-counter.active {
    opacity: 0.5;
}

.streak-counter.pulse {
    animation: pulse-gold 0.5s ease-out;
}

@keyframes pulse-gold {
    0% {
        transform: scale(1);
        text-shadow: 0 0 0 rgba(255, 215, 0, 0);
    }

    50% {
        transform: scale(1.5);
        text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
    }

    100% {
        transform: scale(1);
        text-shadow: 0 0 0 rgba(255, 215, 0, 0);
    }
}

/* Countdown Animation */
.countdown {
    font-size: 8rem;
    font-weight: 800;
    color: var(--text-main);
    animation: countdownPulse 0.8s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
    text-shadow: 0 0 40px rgba(255, 255, 255, 0.3);
}

@keyframes countdownPulse {
    0% {
        opacity: 0;
        transform: scale(0.5);
    }

    50% {
        opacity: 1;
        transform: scale(1.2);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}
