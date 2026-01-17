/**
 * NeuroGain - Brain Training Logic
 */

/* --- Audio Manager --- */
class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
        this.speechRate = 1.0;
    }

    playTone(frequency, type, duration) {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playDigitSound() {
        // Soft blip
        this.playTone(600, 'sine', 0.1);
    }

    playCorrect() {
        // High pleasant chime
        this.playTone(880, 'sine', 0.1);
        setTimeout(() => this.playTone(1760, 'sine', 0.2), 100);
    }

    playWrong() {
        // Low buzzer
        this.playTone(150, 'sawtooth', 0.3);
    }

    playConfirm() {
        this.playTone(440, 'triangle', 0.1);
    }

    speak(text) {
        if (!this.enabled) return new Promise(r => setTimeout(r, 1000));

        return new Promise((resolve) => {
            const uttr = new SpeechSynthesisUtterance(text);
            uttr.lang = 'ja-JP';
            uttr.rate = this.speechRate;
            uttr.onend = resolve;
            window.speechSynthesis.speak(uttr);
        });
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

/* --- Ranking Manager --- */
class RankingManager {
    constructor() {
        this.STORAGE_KEY = 'neurogain_ranking';
        this.rankings = this.load();
    }

    load() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : { visual: [], auditory: [], scattered: [] };
    }

    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.rankings));
    }

    addScore(gameType, score, name) {
        if (!this.rankings[gameType]) this.rankings[gameType] = [];

        const entry = {
            name: name || "No Name",
            score: score,
            date: new Date().toLocaleDateString()
        };

        this.rankings[gameType].push(entry);

        // Sort descending
        this.rankings[gameType].sort((a, b) => b.score - a.score);

        // Keep top 100
        this.rankings[gameType] = this.rankings[gameType].slice(0, 100);

        this.save();
    }

    getTopScores(gameType, limit = 5) {
        return (this.rankings[gameType] || []).slice(0, limit);
    }

    isHighScore(gameType, score) {
        const list = this.rankings[gameType] || [];
        if (list.length < 5) return true; // Less than top 5, definitely in
        return score > list[list.length - 1].score;
    }
}

/* --- Base Game Class --- */
class BrainGame {
    constructor(manager, config) {
        this.manager = manager;
        this.config = config; // { time: seconds, startDigits: int }
        this.currentDigits = parseInt(config.startDigits);
        this.score = 0;
        this.correctCount = 0;
        this.totalCount = 0;
        this.history = []; // { correct: bool }
        this.timeLeft = parseInt(config.time);
        this.timerInterval = null;
        this.isPlaying = false;
        this.inputBuffer = "";
        this.currentSequence = []; // The answer sequence
        this.isInputMode = false;
        this.streak = 0;
        this.isRoundActive = false;
        this.timeUp = false;
    }

    start() {
        console.log("Game Started", this.config);
        this.isPlaying = true;
        this.updateStats();

        // Start with Countdown
        this.startCountdown().then(() => {
            this.startTimer();
            this.nextProblem();
        });
    }

    startCountdown() {
        return new Promise(resolve => {
            const display = this.manager.elements.game.display;
            let count = 3;

            // Initial State
            display.innerHTML = `<div class="countdown">${count}</div>`;
            this.manager.audio.playDigitSound(); // Beep

            const interval = setInterval(() => {
                count--;
                if (count > 0) {
                    display.innerHTML = `<div class="countdown">${count}</div>`;
                    this.manager.audio.playDigitSound(); // Beep
                } else if (count === 0) {
                    display.innerHTML = `<div class="countdown" style="color:var(--primary)">GO!</div>`;
                    this.manager.audio.playCorrect(); // High chime for GO
                } else {
                    clearInterval(interval);
                    display.innerHTML = ''; // Clear
                    resolve();
                }
            }, 1000);
        });
    }

    startTimer() {
        this.manager.elements.game.timer.textContent = this.formatTime(this.timeLeft);

        // Reset flags
        this.timeUp = false;

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft < 0) this.timeLeft = 0;

            this.manager.elements.game.timer.textContent = this.formatTime(this.timeLeft);

            if (this.timeLeft <= 0) {
                // Time Up Logic
                clearInterval(this.timerInterval);
                this.timeUp = true;

                if (this.isRoundActive) {
                    // If currently playing a round, wait until it finishes
                    this.manager.elements.game.timer.textContent = "ラスト問題";
                    this.manager.elements.game.timer.style.color = "var(--accent)";
                } else {
                    // Not active, end immediately
                    this.end();
                }
            }
        }, 1000);
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    end() {
        this.isPlaying = false;
        clearInterval(this.timerInterval);

        // Calculate final stats
        const accuracy = this.totalCount > 0 ? Math.round((this.correctCount / this.totalCount) * 100) : 0;

        // Show result screen
        document.getElementById('result-score').textContent = this.score;
        document.getElementById('result-max-digits').textContent = this.history.length > 0 ? Math.max(...this.history.map(h => h.digits || 3)) : this.config.startDigits;
        document.getElementById('result-accuracy').textContent = `${accuracy}%`;

        this.manager.showScreen('result');

        // Check for high score
        this.manager.checkHighScore(this.score);
    }

    updateStats() {
        this.manager.elements.game.score.textContent = this.score;
        this.manager.elements.game.level.textContent = `${this.currentDigits} 桁`;
    }

    nextProblem() {
        // Reset UI for next problem
        this.inputBuffer = "";
        this.isInputMode = false;
        this.isRoundActive = true; // Round Started

        this.manager.elements.game.input.classList.add('hidden');
        this.manager.elements.game.display.innerHTML = '<div id="stimulus-container"></div>'; // Reset display
        this.updateInputUI(); // Clear slots

        this.generateSequence();
        this.presentStimulus();
    }

    generateSequence() {
        // Default implementation: random digits
        this.currentSequence = [];
        for (let i = 0; i < this.currentDigits; i++) {
            this.currentSequence.push(Math.floor(Math.random() * 10).toString());
        }
    }

    presentStimulus() {
        // Implementation in subclasses
    }

    enableInput() {
        this.isInputMode = true;
        this.manager.elements.game.input.classList.remove('hidden');
        this.updateInputUI(true); // Create slots
    }

    handleInput(key) {
        if (!this.isPlaying || !this.isInputMode) return;

        if (key === 'clear') {
            this.inputBuffer = "";
            this.updateInputUI();
            return;
        }

        if (key === 'enter') {
            if (this.inputBuffer.length === this.currentDigits) {
                this.checkAnswer();
            }
            return;
        }

        if (this.inputBuffer.length < this.currentDigits) {
            this.inputBuffer += key;
            this.updateInputUI();
        }
    }

    updateInputUI(init = false) {
        const slotsContainer = document.getElementById('answer-slots');

        if (init) {
            slotsContainer.innerHTML = '';
            for (let i = 0; i < this.currentDigits; i++) {
                const slot = document.createElement('div');
                slot.className = 'slot';
                slotsContainer.appendChild(slot);
            }
        }

        const slots = slotsContainer.querySelectorAll('.slot');
        slots.forEach((slot, index) => {
            if (index < this.inputBuffer.length) {
                slot.textContent = this.inputBuffer[index];
                slot.classList.add('filled');
            } else {
                slot.textContent = '';
                slot.classList.remove('filled');
            }
            // Clear status classes
            slot.classList.remove('correct', 'incorrect');
        });
    }

    checkAnswer() {
        this.isInputMode = false;
        this.totalCount++;

        // Need to calculate target answer for comparison
        let targetAnswer = "";
        if (this instanceof VisualReversalGame || this instanceof AuditoryReversalGame) {
            targetAnswer = [...this.currentSequence].reverse().join('');
        } else {
            targetAnswer = this.currentSequence.join('');
        }

        const isCorrect = this.inputBuffer === targetAnswer;

        // Detailed Visual Feedback
        let matchCount = 0;
        const slots = document.querySelectorAll('.slot');
        slots.forEach((slot, i) => {
            // Compare each digit
            const inputDigit = this.inputBuffer[i];
            const targetDigit = targetAnswer[i];

            if (inputDigit === targetDigit) {
                slot.classList.add('correct');
                matchCount++;
            } else {
                slot.classList.add('incorrect');
            }
        });

        // --- Score Calculation Logic ---
        const isPerfect = (matchCount === this.currentDigits);

        // 1. Base Score per Digit (Scaling with Level)
        // Level 3: 100pt, Level 4: 150pt, Level 5: 200pt... (+50 per level)
        const scorePerDigit = 100 + (this.currentDigits - 3) * 50;

        // 2. Partial Score
        let rawScore = matchCount * scorePerDigit;

        // 3. Streak & Multipliers
        let multiplier = 1.0;

        if (isPerfect) {
            this.streak = (this.streak || 0) + 1;
            this.manager.audio.playCorrect();
            this.correctCount++;

            // Level Up Check
            this.currentDigits++;
            this.showLevelFeedback('UP');

            // Perfect Bonus: x2
            multiplier *= 2.0;

            // Streak Bonus: 1.0 + (streak * 0.1)
            // 1st perfect: 1.1x, 2nd: 1.2x ...
            const streakBonus = 1.0 + (this.streak * 0.1);
            multiplier *= streakBonus;

        } else {
            this.manager.audio.playWrong();
            this.streak = 0; // Reset streak

            // Show correct answer feedback
            this.showCorrectAnswer(targetAnswer);

            // Level Down Logic (Accuracy < 75%)
            const accuracy = matchCount / this.currentDigits;
            if (this.currentDigits > 3 && accuracy < 0.75) {
                this.currentDigits--;
                this.showLevelFeedback('DOWN');
            }
        }

        // Apply Multiplier and Add to Total
        const addedScore = Math.floor(rawScore * multiplier);
        this.score += addedScore;

        // --- Visual Feedback (Floating Score) ---
        this.showFloatingScore(addedScore, multiplier);

        this.history.push({ correct: isPerfect, digits: this.currentDigits });
        this.updateStats();

        this.isRoundActive = false; // Mark round as finished

        // Delay next problem longer if incorrect to let user see feedback
        const delay = isPerfect ? 1500 : 3500;

        setTimeout(() => {
            if (!this.isPlaying) return;

            // Graceful exit: if time is up, end game now
            if (this.timeLeft <= 0 || this.timeUp) {
                this.end();
            } else {
                this.nextProblem();
            }
        }, delay);
    }

    showLevelFeedback(type) {
        const container = document.getElementById('screen-game');
        const el = document.createElement('div');
        el.className = 'level-feedback';

        let text = "";
        let color = "";

        if (type === 'UP') {
            text = "LEVEL UP! ⇧";
            color = "#00ffea";
        } else if (type === 'DOWN') {
            text = "LEVEL DOWN ⇩";
            color = "#ff4d4d";
        } else {
            return;
        }

        el.textContent = text;
        el.style.color = color;

        container.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    }

    showCorrectAnswer(target) {
        const container = document.getElementById('stimulus-container');
        // Re-use stimulus container to show correct answer
        container.innerHTML = `
            <div style="font-size: 1.5rem; color: var(--text-muted); margin-bottom: 0.5rem;">正解</div>
            <div style="font-size: 3rem; color: #4cd964; letter-spacing: 0.5rem;">${target}</div>
        `;
        // Ensure display is visible (it might have been cleared or covered)
        this.manager.elements.game.display.classList.remove('hidden');
    }

    validateAnswer() {
        // Validation moved to checkAnswer to handle per-digit feedback
        return true;
    }

    showFloatingScore(addedScore, multiplier) {
        if (addedScore <= 0) return;

        const container = document.getElementById('screen-game');
        const el = document.createElement('div');
        el.className = 'floating-score';

        // Randomize position slightly around center
        const randomX = Math.random() * 40 - 20;
        const randomY = Math.random() * 40 - 20;
        el.style.left = `calc(50% + ${randomX}px)`;
        el.style.top = `calc(40% + ${randomY}px)`;

        let text = `+${addedScore}`;
        if (multiplier > 1.0) {
            text += `<span class="multiplier-text">x${multiplier.toFixed(1)}!</span>`;
        }
        el.innerHTML = text;

        container.appendChild(el);

        setTimeout(() => el.remove(), 1000);
    }
}

/* --- Game 1: Visual Reversal --- */
class VisualReversalGame extends BrainGame {
    constructor(manager, config) {
        super(manager, config);
    }

    async presentStimulus() {
        const container = document.getElementById('stimulus-container');
        container.innerHTML = ''; // Start clean

        // Wait a bit before starting sequence
        await new Promise(r => setTimeout(r, 1000));

        for (const digit of this.currentSequence) {
            if (!this.isPlaying) return;

            // Create element for digit
            const span = document.createElement('span');
            span.textContent = digit;
            span.className = 'fade-enter';
            container.appendChild(span);

            this.manager.audio.playDigitSound();

            // Display duration
            await new Promise(r => setTimeout(r, 800)); // Show for 800ms

            // Remove/Fade out
            span.className = 'fade-exit';
            await new Promise(r => setTimeout(r, 200)); // Exit anim 200ms
            container.innerHTML = ''; // Clear for next
            await new Promise(r => setTimeout(r, 200)); // Gap
        }

        if (this.isPlaying) {
            this.enableInput();
        }
    }

    validateAnswer() {
        // Reverse check
        const reversedBuffer = this.inputBuffer.split('').reverse().join('');
        const target = this.currentSequence.join('');
        // User inputs in reverse, so we compare input (as is) with reversed target? 
        // Or user intends to type the numbers in reverse order.
        // E.g. Display: 1, 2, 3. Target Answer: 3, 2, 1.
        // If user types '3', '2', '1', inputBuffer is "321".
        // currentSequence is ["1", "2", "3"].
        // So we reverse currentSequence and compare.
        const reversedTarget = [...this.currentSequence].reverse().join('');
        return this.inputBuffer === reversedTarget;
    }
}

/* --- Game 2: Auditory Reversal --- */
class AuditoryReversalGame extends BrainGame {
    constructor(manager, config) {
        super(manager, config);
    }

    async presentStimulus() {
        const container = document.getElementById('stimulus-container');
        container.innerHTML = '<span style="font-size: 3rem; color: var(--secondary);">🔊 聞いてください...</span>';

        await new Promise(r => setTimeout(r, 1000));

        for (const digit of this.currentSequence) {
            if (!this.isPlaying) return;

            // Visual hint (optional, user requested "listening version", so maybe hide visual?)
            // Request said: "1つ目のゲームの聞き取り版です... 視覚情報に頼らないことで"
            // So we do NOT show the number. Just an indicator that sound is playing.
            container.innerHTML = '<span style="font-size: 4rem;">🔊</span>';
            container.classList.add('pulse'); // Add some CSS pulsing if possible, or just static

            await this.manager.audio.speak(digit);

            // Small gap between numbers
            container.innerHTML = '<span>...</span>';
            await new Promise(r => setTimeout(r, 500));
        }

        if (this.isPlaying) {
            container.innerHTML = '';
            this.enableInput();
        }
    }

    validateAnswer() {
        const reversedTarget = [...this.currentSequence].reverse().join('');
        return this.inputBuffer === reversedTarget;
    }
}

/* --- Game 3: Scattered Recall --- */
class ScatteredGame extends BrainGame {
    constructor(manager, config) {
        super(manager, config);
    }

    async presentStimulus() {
        const container = document.getElementById('stimulus-container');
        container.innerHTML = '';

        // 1. Setup Grid/Boxes
        const grid = document.createElement('div');
        grid.className = 'scatter-grid';
        const boxes = [];

        for (let i = 0; i < this.currentDigits; i++) {
            const box = document.createElement('div');
            box.className = 'scatter-box';
            box.dataset.index = i;
            grid.appendChild(box);
            boxes.push(box);
        }
        container.appendChild(grid);

        await new Promise(r => setTimeout(r, 1000));

        // 2. Prepare Display Order (Random)
        // currentSequence contains the values for box 0, box 1, etc.
        // We show them in a random temporal order.
        let indices = Array.from({ length: this.currentDigits }, (_, i) => i);
        // Shuffle indices
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        // 3. Show them one by one
        for (const index of indices) {
            if (!this.isPlaying) return;

            const box = boxes[index];
            const digit = this.currentSequence[index];

            box.textContent = digit;
            this.manager.audio.playDigitSound();

            await new Promise(r => setTimeout(r, 600)); // Show for short time

            box.textContent = ''; // Hide
            await new Promise(r => setTimeout(r, 200)); // Interval
        }

        if (this.isPlaying) {
            this.enableInput();
        }
    }

    validateAnswer() {
        // Validate against original sequence (Left to Right)
        return this.inputBuffer === this.currentSequence.join('');
    }
}

/* --- Game Manager --- */
class GameManager {
    constructor() {
        this.audio = new AudioManager();
        this.ranking = new RankingManager(); // Add Ranking Manager
        this.activeGame = null;
        this.gameState = 'MENU'; // MENU, SETTINGS, PLAYING, RESULT, RANKING
        this.selectedGameType = null;
        this.selectedRankingType = 'visual';

        this.elements = {
            screens: {
                menu: document.getElementById('screen-menu'),
                settings: document.getElementById('screen-settings'),
                game: document.getElementById('screen-game'),
                result: document.getElementById('screen-result'),
                ranking: document.getElementById('screen-ranking')
            },
            buttons: {
                sound: document.getElementById('btn-sound'),
                start: document.getElementById('btn-start-game'),
                backToMenu: document.getElementById('btn-back-menu'),
                retry: document.getElementById('btn-retry'),
                home: document.getElementById('btn-home'),
                ranking: document.getElementById('btn-show-ranking'),
                rankingBack: document.getElementById('btn-ranking-back')
            },
            game: {
                timer: document.getElementById('game-timer'),
                score: document.getElementById('game-score'),
                level: document.getElementById('game-level'),
                display: document.getElementById('display-area'),
                input: document.getElementById('input-area')
            },
            rankingList: document.getElementById('ranking-list')
        };

        this.init();
    }

    init() {
        this.bindEvents();
        document.addEventListener('click', () => {
            if (this.audio.ctx.state === 'suspended') {
                this.audio.ctx.resume();
            }
        }, { once: true });
    }

    bindEvents() {
        // ... (Existing events) ...

        // Ranking Navigation
        this.elements.buttons.ranking.addEventListener('click', () => {
            this.showScreen('ranking');
            this.updateRankingDisplay(this.selectedRankingType);
        });

        this.elements.buttons.rankingBack.addEventListener('click', () => {
            this.showScreen('menu');
        });

        // Ranking Type Toggle
        document.querySelectorAll('#ranking-type-select button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const parent = e.target.parentElement;
                parent.querySelector('.active').classList.remove('active');
                e.target.classList.add('active');
                this.selectedRankingType = e.target.dataset.value;
                this.updateRankingDisplay(this.selectedRankingType);
            });
        });

        // Menu Navigation
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectedGameType = card.dataset.game;
                this.showScreen('settings');
            });
        });

        // ... (Rest of existing bindEvents) ...

        // Rule Modal Logic
        const modal = document.getElementById('rule-modal');
        const ruleTitle = document.getElementById('rule-title');
        const ruleText = document.getElementById('rule-text');
        const closeRule = document.getElementById('btn-close-rule');

        const rules = {
            visual: {
                title: "鬼逆唱 (Visual Reversal)",
                text: "表示される数字を覚え、後ろから順番に入力してください。\n\n例：1 → 2 → 3 と表示されたら \n[3] [2] [1] と入力。\n\nレベルが上がると桁数が増え、表示が速くなります。"
            },
            auditory: {
                title: "耳逆唱 (Auditory Reversal)",
                text: "読み上げられる数字を聞き取り、後ろから順番に入力してください。\n\n例：「いち、に、さん」と聞こえたら \n[3] [2] [1] と入力。\n\n視覚情報がないため、より高い集中力が必要です。"
            },
            scattered: {
                title: "鬼バラバラ (Scattered)",
                text: "複数の枠に、バラバラな順番で数字が一瞬だけ表示されます。\n\n全ての表示が終わったら、左の枠に入っていた数字から順番に入力してください。\n\n空間的な位置と数字を同時に記憶するトレーニングです。"
            }
        };

        document.querySelectorAll('.rule-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const gameType = btn.dataset.rule;
                ruleTitle.textContent = rules[gameType].title;
                ruleText.textContent = rules[gameType].text;
                modal.classList.add('active');
                modal.classList.remove('hidden');
            });
        });

        closeRule.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => modal.classList.add('hidden'), 300);
        });

        // Settings
        this.elements.buttons.backToMenu.addEventListener('click', () => this.showScreen('menu'));

        document.querySelectorAll('.segmented-control button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.closest('#ranking-type-select')) return; // handled separately

                const parent = e.target.parentElement;
                parent.querySelector('.active').classList.remove('active');
                e.target.classList.add('active');
                this.audio.playConfirm();
            });
        });

        this.elements.buttons.sound.addEventListener('click', (e) => {
            const enabled = this.audio.toggle();
            e.target.textContent = enabled ? '🔊' : '🔇';
            e.target.style.opacity = enabled ? '1' : '0.5';
        });

        // Start Game
        this.elements.buttons.start.addEventListener('click', () => this.startGame());

        // Keypad Interaction
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.activeGame) {
                    this.activeGame.handleInput(btn.dataset.key);
                    this.audio.playConfirm();
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (!this.activeGame) return;
            if (e.key >= '0' && e.key <= '9') this.activeGame.handleInput(e.key);
            if (e.key === 'Backspace') this.activeGame.handleInput('clear');
            if (e.key === 'Enter') this.activeGame.handleInput('enter');
        });

        // Bug Fix: Bind Retry and Home buttons
        this.elements.buttons.retry.addEventListener('click', () => this.startGame());
        this.elements.buttons.home.addEventListener('click', () => this.showScreen('menu'));
    }

    updateRankingDisplay(type) {
        const list = this.elements.rankingList;
        list.innerHTML = '';

        const scores = this.ranking.getTopScores(type);

        if (scores.length === 0) {
            list.innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--text-muted);">データがありません</div>';
            return;
        }

        scores.forEach((entry, index) => {
            const el = document.createElement('div');
            el.className = 'ranking-item';

            const rankClass = index === 0 ? 'top1' : (index === 1 ? 'top2' : (index === 2 ? 'top3' : ''));
            const rankIcon = index === 0 ? '👑' : (index + 1);

            el.innerHTML = `
                <div class="rank-num ${rankClass}">${rankIcon}</div>
                <div class="rank-name">${entry.name}</div>
                <div class="rank-score">${entry.score}</div>
                <div class="rank-date">${entry.date}</div>
            `;
            list.appendChild(el);
        });
    }

    // Check High Score after game
    checkHighScore(score) {
        if (this.ranking.isHighScore(this.selectedGameType, score)) {
            // Show Modal for Name Input
            // We can reuse Rule Modal or inject a new one. Let's make a simple prompt for now
            // Or better, inject input into result screen
            const resultCard = document.querySelector('.result-card');

            // Check if already asked
            if (document.getElementById('highscore-input')) return;

            const div = document.createElement('div');
            div.id = 'highscore-input';
            div.className = 'input-group';
            div.innerHTML = `
                <h3 style="color:#ffd700; margin-bottom:0.5rem;">🎉 High Score! 🎉</h3>
                <input type="text" class="name-input" placeholder="名前を入力" maxlength="8">
                <button id="btn-save-score" class="primary-btn">保存</button>
             `;

            // Insert before buttons
            const ref = document.getElementById('btn-retry');
            resultCard.insertBefore(div, ref);

            document.getElementById('btn-save-score').addEventListener('click', () => {
                const name = div.querySelector('input').value || "名無し";
                this.ranking.addScore(this.selectedGameType, score, name);
                div.remove();
                alert("ランクインしました！");
            });
        }
    }

    showScreen(screenId) {
        Object.values(this.elements.screens).forEach(s => {
            if (!s) return;
            s.classList.add('hidden');
            s.classList.remove('active');
        });
        if (this.elements.screens[screenId]) {
            this.elements.screens[screenId].classList.remove('hidden');
            setTimeout(() => this.elements.screens[screenId].classList.add('active'), 10);
        }
        this.gameState = screenId.toUpperCase();
    }


    startGame() {
        // Get settings
        const digits = document.querySelector('#setting-digits .active').dataset.value;
        const time = document.querySelector('#setting-time .active').dataset.value;
        const config = { startDigits: parseInt(digits), time: parseInt(time) };

        this.showScreen('game');

        // Instantiate specific game
        switch (this.selectedGameType) {
            case 'visual':
                this.activeGame = new VisualReversalGame(this, config);
                break;
            case 'auditory':
                this.activeGame = new AuditoryReversalGame(this, config);
                break;
            case 'scattered':
                this.activeGame = new ScatteredGame(this, config);
                break;
        }

        if (this.activeGame) {
            this.activeGame.start();
        }
    }
}

// Start App
window.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new GameManager();
});
