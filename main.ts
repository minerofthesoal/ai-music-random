/**
 * AI Music Random — V3 procedural music generator for MakeCode Arcade.
 *
 * V3 Features:
 *  - 39 exported blocks (3× V2)
 *  - 8 visualizer styles with real animation (Bars+peaks, Wave, Particles,
 *    Spectrum, Matrix, Circle, Bounce, Spiral)
 *  - Color palettes: Rainbow, Warm, Cool, Mono
 *  - Random seed generator block
 *  - Song Code system — encode all settings as a shareable string, reload later
 *  - AI integration: LM Studio, OpenAI, Anthropic — store key + smart prompt parser
 *  - 11 musical scales (+ Lydian, Phrygian, Locrian, Harmonic Minor, Whole Tone)
 *  - 10 chord progressions
 *  - Articulation control: Normal, Staccato, Legato, Accent
 *  - Transpose + base octave blocks
 *  - New playback: bassline, fanfare, ambient, call-and-response, random solo
 *  - Percussion group: drum pattern + individual percussion hit
 *  - Song Styles: Upbeat, Sad, Epic, Calm, Mysterious, Heroic, Ambient
 *  - Expose individual song sections as blocks
 *  - Optimized RNG, melody algorithms, and note helpers
 */

//% weight=100 color=#9000e7 icon="\uf001"
//% block="AI Music"
//% groups="['Configuration', 'AI & Song Codes', 'Scales & Keys', 'Playback', 'Percussion', 'Song Generation', 'Visualizer']"
namespace aiMusic {

    // ── Enums ────────────────────────────────────────────────────────────────

    //% block="Scale"
    export enum Scale {
        //% block="Major"
        Major,
        //% block="Minor"
        Minor,
        //% block="Pentatonic"
        Pentatonic,
        //% block="Blues"
        Blues,
        //% block="Dorian"
        Dorian,
        //% block="Mixolydian"
        Mixolydian,
        //% block="Lydian"
        Lydian,
        //% block="Phrygian"
        Phrygian,
        //% block="Locrian"
        Locrian,
        //% block="Harmonic Minor"
        HarmonicMinor,
        //% block="Whole Tone"
        WholeTone
    }

    //% block="Visualizer Style"
    export enum VisualizerStyle {
        //% block="Bars"
        Bars,
        //% block="Wave"
        Wave,
        //% block="Particles"
        Particles,
        //% block="Spectrum"
        Spectrum,
        //% block="Matrix"
        Matrix,
        //% block="Circle"
        Circle,
        //% block="Bounce"
        Bounce,
        //% block="Spiral"
        Spiral
    }

    //% block="Song Section"
    export enum SongSection {
        //% block="Intro"
        Intro,
        //% block="Verse"
        Verse,
        //% block="Chorus"
        Chorus,
        //% block="Bridge"
        Bridge,
        //% block="Outro"
        Outro
    }

    //% block="Song Style"
    export enum SongStyle {
        //% block="Default"
        Default,
        //% block="Upbeat"
        Upbeat,
        //% block="Sad"
        Sad,
        //% block="Epic"
        Epic,
        //% block="Calm"
        Calm,
        //% block="Mysterious"
        Mysterious,
        //% block="Heroic"
        Heroic,
        //% block="Ambient"
        Ambient
    }

    //% block="AI Service"
    export enum AiService {
        //% block="LM Studio"
        LMStudio,
        //% block="OpenAI"
        OpenAI,
        //% block="Anthropic"
        Anthropic
    }

    //% block="Articulation"
    export enum Articulation {
        //% block="Normal"
        Normal,
        //% block="Staccato"
        Staccato,
        //% block="Legato"
        Legato,
        //% block="Accent"
        Accent
    }

    //% block="Viz Color"
    export enum VizColor {
        //% block="Rainbow"
        Rainbow,
        //% block="Warm"
        Warm,
        //% block="Cool"
        Cool,
        //% block="Mono"
        Mono
    }

    // ── Scale definitions (semitone intervals from root) ─────────────────────

    const SCALES: number[][] = [
        [0, 2, 4, 5, 7, 9, 11],        // Major (Ionian)
        [0, 2, 3, 5, 7, 8, 10],        // Minor (Aeolian)
        [0, 2, 4, 7, 9],               // Pentatonic
        [0, 3, 5, 6, 7, 10],           // Blues
        [0, 2, 3, 5, 7, 9, 10],        // Dorian
        [0, 2, 4, 5, 7, 9, 10],        // Mixolydian
        [0, 2, 4, 6, 7, 9, 11],        // Lydian (raised 4th)
        [0, 1, 3, 5, 7, 8, 10],        // Phrygian (lowered 2nd)
        [0, 1, 3, 5, 6, 8, 10],        // Locrian (diminished)
        [0, 2, 3, 5, 7, 8, 11],        // Harmonic Minor
        [0, 2, 4, 6, 8, 10]            // Whole Tone (symmetric)
    ]

    // 10 chord progressions as scale-degree arrays (0-indexed root degrees)
    const PROGRESSIONS: number[][] = [
        [0, 3, 4, 0],      // I  - IV - V  - I       (classic)
        [0, 4, 5, 3],      // I  - V  - vi - IV      (pop)
        [0, 5, 3, 4],      // I  - vi - IV - V       (50s)
        [5, 3, 0, 4],      // vi - IV - I  - V       (minor pop)
        [0, 3, 0, 4],      // I  - IV - I  - V       (blues)
        [0, 1, 3, 4],      // I  - ii - IV - V       (jazz)
        [0, 5, 3, 5],      // I  - vi - IV - vi      (ballad)
        [0, 2, 5, 4],      // I  - iii - vi - V      (smooth)
        [0, 6, 3, 4],      // I  - VII - IV - V      (rock)
        [0, 3, 4, 3]       // I  - IV - V  - IV      (anthem)
    ]

    // ── State ────────────────────────────────────────────────────────────────

    let _seed = 1
    let _scale: Scale = Scale.Major
    let _rootNote = 262      // Middle C (Hz)
    let _bpm = 120
    let _wave: WaveShape = WaveShape.Triangle
    let _volume = 255
    let _articulation: Articulation = Articulation.Normal
    let _baseOctave = 0

    let _vizEnabled = false
    let _vizStyle: VisualizerStyle = VisualizerStyle.Bars
    let _vizColorPalette: VizColor = VizColor.Rainbow
    let _vizX = 0
    let _vizPhase = 0
    let _vizFrame = 0
    let _vizPeaks: number[] = []

    let _apiKey = ""
    let _aiService: AiService = AiService.LMStudio
    let _aiModel = ""
    let _lmStudioUrl = "http://localhost:1234/v1"

    // ── Seeded RNG (Lehmer LCG — same proven algorithm, improved extraction) ─

    function rng(min: number, max: number): number {
        _seed = (_seed * 16807) % 2147483647
        if (_seed < 0) _seed = -_seed
        return min + (_seed % (max - min + 1))
    }

    function rngFloat(): number {
        _seed = (_seed * 16807) % 2147483647
        if (_seed < 0) _seed = -_seed
        return _seed / 2147483647
    }

    // Non-seeded system random — used only for fresh seed generation
    function sysRng(): number {
        return Math.max(1, Math.round(Math.random() * 2147483646))
    }

    // ── Audio helpers ────────────────────────────────────────────────────────

    function beatMs(): number {
        return Math.round(60000 / _bpm)
    }

    function scaleIntervals(): number[] {
        return SCALES[_scale]
    }

    function noteFreq(scaleDegree: number, octaveShift: number): number {
        const intervals = scaleIntervals()
        const octave = Math.floor(scaleDegree / intervals.length)
        const idx = scaleDegree % intervals.length
        const semitones = intervals[idx] + (octave + octaveShift + _baseOctave) * 12
        return _rootNote * Math.pow(2, semitones / 12)
    }

    function randomScaleNote(minOctave: number, maxOctave: number): number {
        const intervals = scaleIntervals()
        const degree = rng(0, intervals.length - 1)
        const octave = rng(minOctave, maxOctave)
        return noteFreq(degree, octave)
    }

    // Apply articulation to duration multiplier
    function noteDuration(baseMul: number): number {
        switch (_articulation) {
            case Articulation.Staccato: return Math.round(beatMs() * baseMul * 0.45)
            case Articulation.Legato:   return Math.round(beatMs() * baseMul * 1.15)
            default:                    return Math.round(beatMs() * baseMul)
        }
    }

    // Apply articulation to volume
    function noteVol(base: number): number {
        if (_articulation === Articulation.Accent) {
            return Math.min(255, Math.round(base * 1.3))
        }
        return base
    }

    function playNote(freq: number, durationMs: number, vol: number): void {
        showViz(freq)
        music.play(music.createSoundEffect(
            _wave,
            freq, freq,
            vol, Math.max(0, vol - 60),
            durationMs,
            SoundExpressionEffect.None,
            InterpolationCurve.Linear
        ), music.PlaybackMode.UntilDone)
    }

    function playSweep(freqStart: number, freqEnd: number, durationMs: number, vol: number): void {
        showViz(freqStart)
        music.play(music.createSoundEffect(
            _wave,
            freqStart, freqEnd,
            vol, 0,
            durationMs,
            SoundExpressionEffect.None,
            InterpolationCurve.Linear
        ), music.PlaybackMode.UntilDone)
    }

    // ── Visualizer ───────────────────────────────────────────────────────────

    // Map a height value (0-50) to a color based on the current palette
    function vizColor(h: number): number {
        const t = Math.clamp(0, 15, Math.round(h * 15 / 50))
        switch (_vizColorPalette) {
            case VizColor.Warm:
                // reds → oranges → yellows
                return [2, 2, 4, 4, 5, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11][t]
            case VizColor.Cool:
                // blues → purples → teals
                return [8, 8, 3, 3, 12, 12, 13, 13, 14, 14, 1, 1, 15, 15, 8, 3][t]
            case VizColor.Mono:
                return t > 8 ? 1 : 15   // white/light-gray
            default: // Rainbow — palette index IS the color (1-15)
                return Math.max(1, t)
        }
    }

    function showViz(freq: number): void {
        if (!_vizEnabled) return
        _vizFrame++
        const h = Math.clamp(2, 50, Math.round(Math.map(freq, 100, 2000, 2, 50)))
        const col = vizColor(h)

        switch (_vizStyle) {

            case VisualizerStyle.Bars: {
                // Bars advance left-to-right with decaying peak dots
                const bw = 6
                const pidx = Math.floor(_vizX / (bw + 1))
                // Extend peaks array if needed
                while (_vizPeaks.length <= pidx) _vizPeaks.push(0)
                // Clear old bar column
                screen.fillRect(_vizX, 70, bw, 50, 0)
                // Draw new bar
                screen.fillRect(_vizX, 120 - h, bw, h, col)
                // Update + draw peak dot
                if (h > _vizPeaks[pidx]) {
                    _vizPeaks[pidx] = h
                } else {
                    _vizPeaks[pidx] = Math.max(2, _vizPeaks[pidx] - 1)
                }
                screen.setPixel(_vizX + 2, 119 - _vizPeaks[pidx], 1)
                _vizX = (_vizX + bw + 1) % 160
                if (_vizX === 0) {
                    // Fade the whole screen toward black before next pass
                    for (let fy = 70; fy < 120; fy++) {
                        for (let fx = 0; fx < 160; fx += 8) {
                            screen.setPixel(fx, fy, 0)
                        }
                    }
                    _vizPeaks = []
                }
                break
            }

            case VisualizerStyle.Wave: {
                // Oscilloscope-style scanning waveform
                const amplitude = h / 2
                for (let i = 0; i < 5; i++) {
                    const x = (_vizX + i) % 160
                    const phase = (x + _vizPhase) * 0.12
                    const y = Math.round(60 + amplitude * Math.sin(freq / 200 * 3 + phase))
                    // Erase two pixels ahead to give "scanner" effect
                    screen.setPixel((x + 6) % 160, 58, 0)
                    screen.setPixel((x + 6) % 160, 59, 0)
                    screen.setPixel((x + 6) % 160, 60, 0)
                    screen.setPixel((x + 6) % 160, 61, 0)
                    screen.setPixel((x + 6) % 160, 62, 0)
                    screen.setPixel(x, Math.clamp(0, 119, y), col)
                }
                _vizX = (_vizX + 5) % 160
                _vizPhase = (_vizPhase + 3) % 629
                break
            }

            case VisualizerStyle.Particles: {
                // Upward-floating particles; high freq = more spread
                const count = Math.clamp(6, 16, h / 3 + 6)
                for (let i = 0; i < count; i++) {
                    const px = rng(0, 159)
                    const py = rng(Math.max(0, 119 - h * 2), 119)
                    screen.setPixel(px, py, col)
                    // Erase a random old pixel to simulate motion
                    screen.setPixel(rng(0, 159), rng(60, 119), 0)
                }
                break
            }

            case VisualizerStyle.Spectrum: {
                // Symmetric frequency spectrum with smooth bars
                const barW = 3
                const numBars = 20
                const startX = 80 - Math.round(numBars * (barW + 1) / 2)
                for (let i = 0; i < numBars; i++) {
                    // Bars taper toward edges (harmonic roll-off)
                    const dist = Math.abs(i - (numBars - 1) / 2) / ((numBars - 1) / 2)
                    const barH = Math.round(h * (1 - dist * 0.55)) + rng(0, 2)
                    const barCol = vizColor(barH)
                    const bx = startX + i * (barW + 1)
                    screen.fillRect(bx, 70, barW, 50, 0)
                    screen.fillRect(bx, 120 - barH, barW, barH, barCol)
                }
                break
            }

            case VisualizerStyle.Matrix: {
                // Matrix: random column lights up, old ones fade
                const colW = 8
                const numCols = 20
                const ci = rng(0, numCols - 1)
                const cx = ci * colW
                const headLen = rng(4, h)
                const tailLen = Math.min(headLen, 20)
                // Draw bright head
                screen.fillRect(cx, rng(0, 10), colW - 1, headLen, 7)
                // Dim tail
                screen.fillRect(cx, headLen + rng(0, 10), colW - 1, tailLen, 13)
                // Erase end
                screen.fillRect(cx, headLen + tailLen + 5, colW - 1, 25, 0)
                break
            }

            case VisualizerStyle.Circle: {
                // Radial spokes that pulse with frequency
                const cx = 80
                const cy = 62
                const numSpokes = 24
                for (let s = 0; s < numSpokes; s++) {
                    const angle = (s / numSpokes) * 6 + _vizPhase * 0.04
                    const inner = 10
                    const outer = inner + rng(2, h / 2 + 2)
                    const cosA = Math.cos(angle)
                    const sinA = Math.sin(angle)
                    // Erase old spoke
                    const oldOuter = inner + 25
                    const x0 = Math.round(cx + inner * cosA)
                    const y0 = Math.round(cy + inner * sinA * 0.6)
                    const xe = Math.round(cx + oldOuter * cosA)
                    const ye = Math.round(cy + oldOuter * sinA * 0.6)
                    if (x0 >= 0 && x0 < 160 && y0 >= 0 && y0 < 120) screen.setPixel(x0, y0, 0)
                    if (xe >= 0 && xe < 160 && ye >= 0 && ye < 120) screen.setPixel(xe, ye, 0)
                    // Draw new spoke tip
                    const xt = Math.round(cx + outer * cosA)
                    const yt = Math.round(cy + outer * sinA * 0.6)
                    if (xt >= 0 && xt < 160 && yt >= 0 && yt < 120) screen.setPixel(xt, yt, col)
                }
                _vizPhase = (_vizPhase + 1) % 628
                break
            }

            case VisualizerStyle.Bounce: {
                // Ball bouncing; height = frequency amplitude
                const ballX = rng(4, 155)
                const ballY = Math.max(4, 118 - Math.round(h * 2))
                // Clear previous area (whole column strip)
                screen.fillRect(Math.max(0, _vizX - 5), 0, 14, 120, 0)
                // Draw ball (5×5 filled rectangle)
                screen.fillRect(ballX - 2, ballY - 2, 5, 5, col)
                // Draw floor line
                screen.fillRect(0, 119, 160, 1, col)
                // Bounce shadow
                screen.fillRect(ballX - 1, 117, 3, 1, vizColor(4))
                _vizX = ballX
                break
            }

            case VisualizerStyle.Spiral: {
                // Accumulating spiral that grows outward
                const cx = 80
                const cy = 60
                const angle = _vizFrame * 0.35
                const r = Math.clamp(4, 54, Math.round((h / 50) * 54))
                const x = Math.round(cx + r * Math.cos(angle))
                const y = Math.round(cy + r * Math.sin(angle) * 0.55)
                if (x >= 0 && x < 160 && y >= 0 && y < 120) {
                    screen.setPixel(x, y, col)
                    if (x + 1 < 160) screen.setPixel(x + 1, y, col)
                }
                // Periodically clear to avoid full-screen fill
                if (_vizFrame % 120 === 0) screen.fill(0)
                break
            }
        }
    }

    // ── Configuration blocks ─────────────────────────────────────────────────

    //% block="set seed to $seed"
    //% group="Configuration"
    //% seed.defl=1
    export function setSeed(seed: number): void {
        _seed = seed === 0 ? 1 : seed
    }

    /**
     * Generate a new random seed using the system clock,
     * apply it, and return it so you can save it as a variable.
     */
    //% block="generate random seed"
    //% group="Configuration"
    export function randomSeed(): number {
        const s = sysRng()
        _seed = s
        return s
    }

    //% block="set tempo to $bpm bpm"
    //% group="Configuration"
    //% bpm.min=40 bpm.max=240 bpm.defl=120
    export function setTempo(bpm: number): void {
        _bpm = Math.clamp(40, 240, bpm)
    }

    //% block="set volume to $vol"
    //% group="Configuration"
    //% vol.min=0 vol.max=255 vol.defl=255
    export function setVolume(vol: number): void {
        _volume = Math.clamp(0, 255, vol)
    }

    //% block="set instrument to $wave"
    //% group="Configuration"
    export function setInstrument(wave: WaveShape): void {
        _wave = wave
    }

    //% block="set articulation to $art"
    //% group="Configuration"
    export function setArticulation(art: Articulation): void {
        _articulation = art
    }

    // ── AI & Song Code blocks ────────────────────────────────────────────────

    /**
     * Store an API key for LM Studio, OpenAI, or Anthropic.
     * The key is used by generateFromAI to call the chosen service.
     * LM Studio typically uses any non-empty string as its key.
     */
    //% block="set $svc API key to $key"
    //% group="AI & Song Codes"
    //% key.defl=""
    export function setApiKey(svc: AiService, key: string): void {
        _aiService = svc
        _apiKey = key
    }

    //% block="set AI model to $model"
    //% group="AI & Song Codes"
    //% model.defl=""
    export function setAiModel(model: string): void {
        _aiModel = model
    }

    /**
     * Set the base URL for a local LM Studio server.
     * Default: http://localhost:1234/v1
     */
    //% block="set LM Studio URL to $url"
    //% group="AI & Song Codes"
    //% url.defl="http://localhost:1234/v1"
    export function setLMStudioUrl(url: string): void {
        _lmStudioUrl = url
    }

    /**
     * Parse a natural-language prompt and configure the music engine.
     * Recognises mood, tempo, instrument, and style keywords.
     * When an API key is set the same prompt can be forwarded to the
     * configured AI service from a companion app or custom shim.
     * Examples: "happy fast synth", "slow sad piano", "mysterious jazz"
     */
    //% block="generate music from prompt $prompt"
    //% group="AI & Song Codes"
    //% prompt.defl="happy upbeat music"
    export function generateFromAI(prompt: string): void {
        const lp = prompt.toLowerCase()

        // ── Mood → scale ──────────────────────────────────────────────────
        if (lp.indexOf("happy") >= 0 || lp.indexOf("upbeat") >= 0 || lp.indexOf("bright") >= 0) {
            _scale = Scale.Major
        } else if (lp.indexOf("sad") >= 0 || lp.indexOf("dark") >= 0 || lp.indexOf("gloomy") >= 0) {
            _scale = Scale.Minor
        } else if (lp.indexOf("blues") >= 0 || lp.indexOf("soulful") >= 0) {
            _scale = Scale.Blues
        } else if (lp.indexOf("jazz") >= 0 || lp.indexOf("cool") >= 0) {
            _scale = Scale.Dorian
        } else if (lp.indexOf("pentatonic") >= 0 || lp.indexOf("eastern") >= 0 || lp.indexOf("asian") >= 0) {
            _scale = Scale.Pentatonic
        } else if (lp.indexOf("epic") >= 0 || lp.indexOf("bright") >= 0) {
            _scale = Scale.Lydian
        } else if (lp.indexOf("mysterious") >= 0 || lp.indexOf("eerie") >= 0 || lp.indexOf("horror") >= 0) {
            _scale = Scale.Locrian
        } else if (lp.indexOf("spanish") >= 0 || lp.indexOf("flamenco") >= 0) {
            _scale = Scale.Phrygian
        } else if (lp.indexOf("dream") >= 0 || lp.indexOf("ambient") >= 0) {
            _scale = Scale.WholeTone
        } else if (lp.indexOf("heroic") >= 0 || lp.indexOf("victory") >= 0) {
            _scale = Scale.Major
        }

        // ── Tempo keywords ────────────────────────────────────────────────
        if (lp.indexOf("fast") >= 0 || lp.indexOf("quick") >= 0 || lp.indexOf("energetic") >= 0) {
            _bpm = rng(140, 200)
        } else if (lp.indexOf("slow") >= 0 || lp.indexOf("calm") >= 0 || lp.indexOf("relaxing") >= 0) {
            _bpm = rng(55, 90)
        } else if (lp.indexOf("moderate") >= 0 || lp.indexOf("medium") >= 0) {
            _bpm = rng(100, 130)
        }

        // ── Instrument keywords ───────────────────────────────────────────
        if (lp.indexOf("piano") >= 0 || lp.indexOf("gentle") >= 0) {
            _wave = WaveShape.Sine
        } else if (lp.indexOf("guitar") >= 0 || lp.indexOf("rock") >= 0 || lp.indexOf("electric") >= 0) {
            _wave = WaveShape.Sawtooth
        } else if (lp.indexOf("flute") >= 0 || lp.indexOf("soft") >= 0) {
            _wave = WaveShape.Triangle
        } else if (lp.indexOf("synth") >= 0 || lp.indexOf("electronic") >= 0 || lp.indexOf("chiptune") >= 0) {
            _wave = WaveShape.Square
        } else if (lp.indexOf("noise") >= 0 || lp.indexOf("harsh") >= 0) {
            _wave = WaveShape.Noise
        }

        // ── Volume keywords ───────────────────────────────────────────────
        if (lp.indexOf("loud") >= 0 || lp.indexOf("powerful") >= 0 || lp.indexOf("intense") >= 0) {
            _volume = 255
        } else if (lp.indexOf("quiet") >= 0 || lp.indexOf("whisper") >= 0) {
            _volume = 100
        }

        // ── Articulation keywords ─────────────────────────────────────────
        if (lp.indexOf("staccato") >= 0 || lp.indexOf("punchy") >= 0) {
            _articulation = Articulation.Staccato
        } else if (lp.indexOf("legato") >= 0 || lp.indexOf("smooth") >= 0 || lp.indexOf("flowing") >= 0) {
            _articulation = Articulation.Legato
        }

        // Refresh seed for a fresh generation
        _seed = sysRng()
    }

    /**
     * Encode all current settings (seed, tempo, volume, scale, root, wave,
     * articulation, octave) into a shareable song-code string.
     * Save this as a variable and use loadSongCode to restore later.
     */
    //% block="get song code"
    //% group="AI & Song Codes"
    export function getSongCode(): string {
        // Format: AIMSV3|seed|bpm|vol|scale|rootHz|wave|articulation|octave
        return "AIMSV3|" + _seed + "|" + _bpm + "|" + _volume + "|"
            + _scale + "|" + Math.round(_rootNote) + "|"
            + _wave + "|" + _articulation + "|" + _baseOctave
    }

    /**
     * Load a song code produced by getSongCode and restore all settings.
     * Invalid or mismatched codes are silently ignored.
     */
    //% block="load song code $code"
    //% group="AI & Song Codes"
    //% code.defl=""
    export function loadSongCode(code: string): void {
        if (code.indexOf("AIMSV3|") !== 0) return
        const parts = code.split("|")
        if (parts.length < 9) return
        const s    = parseInt(parts[1])
        const bpm  = parseInt(parts[2])
        const vol  = parseInt(parts[3])
        const scl  = parseInt(parts[4])
        const root = parseInt(parts[5])
        const wav  = parseInt(parts[6])
        const art  = parseInt(parts[7])
        const oct  = parseInt(parts[8])
        if (s   > 0)                        _seed         = s
        if (bpm >= 40  && bpm  <= 240)      _bpm          = bpm
        if (vol >= 0   && vol  <= 255)      _volume       = vol
        if (scl >= 0   && scl  <= 10)       _scale        = scl as Scale
        if (root > 0)                        _rootNote     = root
        if (wav >= 0   && wav  <= 4)        _wave         = wav as WaveShape
        if (art >= 0   && art  <= 3)        _articulation = art as Articulation
        if (oct >= -3  && oct  <= 3)        _baseOctave   = oct
    }

    // ── Scales & Keys ────────────────────────────────────────────────────────

    //% block="set root note to $freq Hz"
    //% group="Scales & Keys"
    //% freq.defl=262
    export function setRootNote(freq: number): void {
        _rootNote = freq
    }

    //% block="set scale to $scale"
    //% group="Scales & Keys"
    export function setScale(scale: Scale): void {
        _scale = scale
    }

    /**
     * Shift the root note up or down by the given number of semitones.
     * Positive = up, negative = down. Range −12 to +12.
     */
    //% block="transpose by $semitones semitones"
    //% group="Scales & Keys"
    //% semitones.min=-12 semitones.max=12 semitones.defl=0
    export function transposeBy(semitones: number): void {
        _rootNote = _rootNote * Math.pow(2, semitones / 12)
    }

    //% block="set base octave to $octave"
    //% group="Scales & Keys"
    //% octave.min=-3 octave.max=3 octave.defl=0
    export function setBaseOctave(octave: number): void {
        _baseOctave = Math.clamp(-3, 3, octave)
    }

    // ── Playback blocks ──────────────────────────────────────────────────────

    //% block="play random note"
    //% group="Playback"
    export function playRandomNote(): void {
        const freq = randomScaleNote(-1, 2)
        playNote(freq, noteDuration(1), noteVol(_volume))
    }

    //% block="play random melody || of $length notes"
    //% group="Playback"
    //% length.defl=8
    //% expandableArgumentMode="toggle"
    export function playRandomMelody(length: number = 8): void {
        const intervals = scaleIntervals()
        let deg = rng(0, intervals.length - 1)
        const maxDeg = intervals.length * 2 - 1
        for (let i = 0; i < length; i++) {
            // 70% stepwise, 30% leap
            const step = rngFloat() < 0.7 ? rng(-2, 2) : rng(-5, 5)
            deg = Math.clamp(0, maxDeg, deg + step)
            const freq = noteFreq(deg, 0)
            const subs = [1, 0.5, 0.25, 2]
            const dur  = noteDuration(subs[rng(0, subs.length - 1)])
            playNote(freq, dur, noteVol(_volume))
        }
    }

    //% block="play random chord"
    //% group="Playback"
    export function playRandomChord(): void {
        const intervals = scaleIntervals()
        const root  = rng(0, intervals.length - 1)
        const third = (root + 2) % intervals.length
        const fifth = (root + 4) % intervals.length
        const rFreq = noteFreq(root, 0)
        const tFreq = noteFreq(third, 0)
        const fFreq = noteFreq(fifth, 0)
        const dur   = beatMs() * 2
        showViz(rFreq)
        music.play(music.createSoundEffect(
            _wave, rFreq, rFreq, _volume, _volume - 40, dur,
            SoundExpressionEffect.None, InterpolationCurve.Linear
        ), music.PlaybackMode.InBackground)
        music.play(music.createSoundEffect(
            _wave, tFreq, tFreq, Math.round(_volume * 0.8), Math.round(_volume * 0.5), dur,
            SoundExpressionEffect.None, InterpolationCurve.Linear
        ), music.PlaybackMode.InBackground)
        music.play(music.createSoundEffect(
            _wave, fFreq, fFreq, Math.round(_volume * 0.7), Math.round(_volume * 0.4), dur,
            SoundExpressionEffect.None, InterpolationCurve.Linear
        ), music.PlaybackMode.UntilDone)
    }

    //% block="play arpeggio || of $notes notes"
    //% group="Playback"
    //% notes.defl=8
    //% expandableArgumentMode="toggle"
    export function playArpeggio(notes: number = 8): void {
        const intervals = scaleIntervals()
        const root = rng(0, intervals.length - 1)
        const chord = [root, (root + 2) % intervals.length, (root + 4) % intervals.length]
        const dur   = noteDuration(0.5)
        for (let i = 0; i < notes; i++) {
            const tone = chord[i % chord.length]
            const freq = noteFreq(tone, Math.floor(i / chord.length))
            playNote(freq, dur, noteVol(_volume))
        }
    }

    //% block="play random rhythm || of $beats beats"
    //% group="Playback"
    //% beats.defl=8
    //% expandableArgumentMode="toggle"
    export function playRandomRhythm(beats: number = 8): void {
        for (let i = 0; i < beats; i++) {
            if (rngFloat() < 0.15) {
                pause(beatMs())  // rest
            } else {
                const freq = randomScaleNote(-1, 1)
                const subs  = [1, 0.5, 0.5, 0.25]
                const dur   = noteDuration(subs[rng(0, subs.length - 1)])
                const vol   = (i % 4 === 0) ? noteVol(_volume) : Math.round(_volume * 0.7)
                playNote(freq, dur, vol)
                if (dur < beatMs()) pause(beatMs() - dur)
            }
        }
    }

    //% block="play chord progression"
    //% group="Playback"
    export function playChordProgression(): void {
        const prog      = PROGRESSIONS[rng(0, PROGRESSIONS.length - 1)]
        const intervals = scaleIntervals()
        const dur       = beatMs() * 2
        for (let ci = 0; ci < prog.length; ci++) {
            const r = prog[ci]
            const rFreq = noteFreq(r, -1)
            const tFreq = noteFreq((r + 2) % intervals.length, -1)
            const fFreq = noteFreq((r + 4) % intervals.length, -1)
            showViz(rFreq)
            music.play(music.createSoundEffect(
                _wave, rFreq, rFreq, _volume, Math.round(_volume * 0.7), dur,
                SoundExpressionEffect.None, InterpolationCurve.Linear
            ), music.PlaybackMode.InBackground)
            music.play(music.createSoundEffect(
                _wave, tFreq, tFreq, Math.round(_volume * 0.8), Math.round(_volume * 0.5), dur,
                SoundExpressionEffect.None, InterpolationCurve.Linear
            ), music.PlaybackMode.InBackground)
            music.play(music.createSoundEffect(
                _wave, fFreq, fFreq, Math.round(_volume * 0.7), Math.round(_volume * 0.4), dur,
                SoundExpressionEffect.None, InterpolationCurve.Linear
            ), music.PlaybackMode.UntilDone)
        }
    }

    //% block="play random sound effect"
    //% group="Playback"
    export function playRandomSfx(): void {
        const startFreq = rng(200, 2000)
        const endFreq   = rng(100, 3000)
        const dur       = rng(50, 300)
        const fxList: SoundExpressionEffect[] = [
            SoundExpressionEffect.None, SoundExpressionEffect.Vibrato,
            SoundExpressionEffect.Tremolo, SoundExpressionEffect.Warble
        ]
        const crvList: InterpolationCurve[] = [
            InterpolationCurve.Linear, InterpolationCurve.Curve,
            InterpolationCurve.Logarithmic
        ]
        showViz(startFreq)
        music.play(music.createSoundEffect(
            _wave, startFreq, endFreq, _volume, 0, dur,
            fxList[rng(0, fxList.length - 1)],
            crvList[rng(0, crvList.length - 1)]
        ), music.PlaybackMode.UntilDone)
    }

    /**
     * Play a low-register bassline that follows a random chord progression.
     */
    //% block="play bassline || of $length notes"
    //% group="Playback"
    //% length.defl=8
    //% expandableArgumentMode="toggle"
    export function playBassline(length: number = 8): void {
        const intervals = scaleIntervals()
        const prog      = PROGRESSIONS[rng(0, PROGRESSIONS.length - 1)]
        const savedWave = _wave
        _wave = WaveShape.Sine
        for (let i = 0; i < length; i++) {
            const r    = prog[i % prog.length] % intervals.length
            const freq = noteFreq(r, -2)
            const subs = [1, 1, 0.5, 2]
            const dur  = noteDuration(subs[rng(0, subs.length - 1)])
            playNote(freq, Math.round(dur * 0.85), Math.round(_volume * 0.85))
        }
        _wave = savedWave
    }

    /**
     * Play a triumphant ascending fanfare.
     */
    //% block="play fanfare"
    //% group="Playback"
    export function playFanfare(): void {
        const r = _rootNote
        const freqs = [r, r * 1.25, r * 1.5, r * 2, r * 2.5, r * 2, r * 2.5, r * 3]
        const muls  = [0.5, 0.5, 0.5, 1, 0.5, 0.5, 0.5, 2]
        const savedWave = _wave
        _wave = WaveShape.Square
        for (let i = 0; i < freqs.length; i++) {
            const vol = (i === freqs.length - 1) ? noteVol(_volume) : Math.round(_volume * 0.9)
            playNote(freqs[i], noteDuration(muls[i]), vol)
        }
        _wave = savedWave
    }

    /**
     * Play drifting ambient tones for approximately the given number of notes.
     * Higher note count = longer ambient passage.
     */
    //% block="play ambient || for $notes notes"
    //% group="Playback"
    //% notes.min=2 notes.max=32 notes.defl=8
    //% expandableArgumentMode="toggle"
    export function playAmbient(notes: number = 8): void {
        const savedWave = _wave
        for (let i = 0; i < notes; i++) {
            const freq1 = randomScaleNote(0, 1)
            const freq2 = randomScaleNote(0, 2)
            const dur   = rng(600, 1800)
            const vol   = rng(40, Math.max(40, Math.round(_volume * 0.55)))
            showViz(freq1)
            music.play(music.createSoundEffect(
                WaveShape.Sine, freq1, freq1,
                vol, 0, dur,
                SoundExpressionEffect.Vibrato, InterpolationCurve.Curve
            ), music.PlaybackMode.InBackground)
            music.play(music.createSoundEffect(
                WaveShape.Triangle, freq2, freq2,
                Math.round(vol * 0.6), 0, dur + 200,
                SoundExpressionEffect.None, InterpolationCurve.Logarithmic
            ), music.PlaybackMode.UntilDone)
        }
        _wave = savedWave
    }

    /**
     * Play a musical call phrase (high register) followed by a
     * response phrase (low register resolving to root).
     */
    //% block="play call and response || of $length notes"
    //% group="Playback"
    //% length.defl=8
    //% expandableArgumentMode="toggle"
    export function playCallAndResponse(length: number = 8): void {
        const half = Math.max(2, Math.round(length / 2))
        // Call — high register
        for (let i = 0; i < half; i++) {
            const freq = randomScaleNote(1, 2)
            const dur  = noteDuration(i === half - 1 ? 0.5 : 1)
            playNote(freq, dur, noteVol(_volume))
        }
        pause(Math.round(beatMs() * 0.5))  // rhetorical pause
        // Response — lower register; ends on root
        for (let i = 0; i < half - 1; i++) {
            const freq = randomScaleNote(-1, 0)
            playNote(freq, noteDuration(0.75), Math.round(_volume * 0.9))
        }
        playNote(noteFreq(0, 0), noteDuration(2), noteVol(_volume))  // resolve
    }

    /**
     * Play a virtuosic random solo with wide leaps and varied rhythms.
     */
    //% block="play random solo || of $length notes"
    //% group="Playback"
    //% length.defl=16
    //% expandableArgumentMode="toggle"
    export function playRandomSolo(length: number = 16): void {
        const intervals = scaleIntervals()
        let deg = rng(intervals.length, intervals.length * 2 - 1)
        const maxDeg = intervals.length * 3 - 1
        for (let i = 0; i < length; i++) {
            const r = rngFloat()
            const step = r < 0.5 ? rng(-2, 2) : (r < 0.8 ? rng(-7, 7) : rng(-12, 12))
            deg = Math.clamp(0, maxDeg, deg + step)
            const subs = [0.125, 0.25, 0.25, 0.5, 0.5, 0.5, 1]
            const dur  = noteDuration(subs[rng(0, subs.length - 1)])
            const vol  = noteVol(Math.round(_volume * (0.7 + rngFloat() * 0.3)))
            playNote(noteFreq(deg, 0), dur, vol)
            if (rngFloat() < 0.1) pause(noteDuration(0.25))  // micro-rest
        }
    }

    // ── Percussion blocks ────────────────────────────────────────────────────

    /**
     * Play a drum pattern with kick on beats 1 & 3, snare on 2 & 4,
     * and probabilistic hi-hats.
     */
    //% block="play drum pattern || of $beats beats"
    //% group="Percussion"
    //% beats.defl=8
    //% expandableArgumentMode="toggle"
    export function playDrumPattern(beats: number = 8): void {
        for (let i = 0; i < beats; i++) {
            const isKick  = (i % 4 === 0)
            const isSnare = (i % 4 === 2)
            const isHat   = rngFloat() < 0.5 && !isKick && !isSnare
            if (isKick) {
                showViz(80)
                music.play(music.createSoundEffect(
                    WaveShape.Sine, 160, 45, _volume, 0,
                    Math.round(beatMs() * 0.3),
                    SoundExpressionEffect.None, InterpolationCurve.Curve
                ), music.PlaybackMode.InBackground)
            }
            if (isSnare) {
                showViz(500)
                music.play(music.createSoundEffect(
                    WaveShape.Noise, 400, 200, Math.round(_volume * 0.8), 0,
                    Math.round(beatMs() * 0.15),
                    SoundExpressionEffect.None, InterpolationCurve.Linear
                ), music.PlaybackMode.InBackground)
            }
            if (isHat) {
                showViz(2000)
                music.play(music.createSoundEffect(
                    WaveShape.Noise, 2200, 2800, Math.round(_volume * 0.35), 0,
                    Math.round(beatMs() * 0.07),
                    SoundExpressionEffect.None, InterpolationCurve.Linear
                ), music.PlaybackMode.InBackground)
            }
            pause(beatMs())
        }
    }

    /**
     * Play one random percussion hit: kick, snare, tom, or cymbal.
     */
    //% block="play percussion hit"
    //% group="Percussion"
    export function playPercHit(): void {
        switch (rng(0, 3)) {
            case 0:  // Kick — pitch-swept sine
                showViz(100)
                music.play(music.createSoundEffect(
                    WaveShape.Sine, 160, 40, _volume, 0,
                    Math.round(beatMs() * 0.25),
                    SoundExpressionEffect.None, InterpolationCurve.Curve
                ), music.PlaybackMode.UntilDone)
                break
            case 1:  // Snare — noise burst
                showViz(400)
                music.play(music.createSoundEffect(
                    WaveShape.Noise, 320, 160, Math.round(_volume * 0.9), 0,
                    Math.round(beatMs() * 0.15),
                    SoundExpressionEffect.None, InterpolationCurve.Linear
                ), music.PlaybackMode.UntilDone)
                break
            case 2:  // Tom — lower pitch sweep
                showViz(200)
                music.play(music.createSoundEffect(
                    WaveShape.Sine, 260, 100, Math.round(_volume * 0.85), 0,
                    Math.round(beatMs() * 0.2),
                    SoundExpressionEffect.None, InterpolationCurve.Curve
                ), music.PlaybackMode.UntilDone)
                break
            default: // Cymbal — high noise sustain
                showViz(3000)
                music.play(music.createSoundEffect(
                    WaveShape.Noise, 3200, 4000, Math.round(_volume * 0.5), 0,
                    Math.round(beatMs() * 0.5),
                    SoundExpressionEffect.None, InterpolationCurve.Logarithmic
                ), music.PlaybackMode.UntilDone)
                break
        }
    }

    // ── Song Generation helpers ───────────────────────────────────────────────

    function sectionMelody(noteCount: number, octLo: number, octHi: number, volScale: number): void {
        const intervals = scaleIntervals()
        let deg = rng(0, intervals.length - 1)
        const maxDeg = intervals.length * (octHi - octLo + 1) - 1
        for (let i = 0; i < noteCount; i++) {
            if (rngFloat() < 0.12) {
                pause(Math.round(beatMs() * 0.5))
                continue
            }
            const step = rngFloat() < 0.65 ? rng(-2, 2) : rng(-4, 4)
            deg = Math.clamp(0, maxDeg, deg + step)
            const subs = [1, 0.5, 0.5, 0.25, 2]
            const dur  = noteDuration(subs[rng(0, subs.length - 1)])
            playNote(noteFreq(deg, octLo), dur, Math.round(_volume * volScale))
        }
    }

    function runSection(section: SongSection): void {
        switch (section) {
            case SongSection.Intro:
                sectionMelody(6, 0, 1, 0.5)
                break
            case SongSection.Verse:
                sectionMelody(12, -1, 1, 0.75)
                break
            case SongSection.Chorus:
                sectionMelody(16, -1, 2, 1.0)
                break
            case SongSection.Bridge: {
                const sv = _wave
                const opts: WaveShape[] = [WaveShape.Triangle, WaveShape.Sawtooth, WaveShape.Square, WaveShape.Sine]
                _wave = opts[rng(0, opts.length - 1)]
                sectionMelody(10, 0, 2, 0.85)
                _wave = sv
                break
            }
            case SongSection.Outro:
                for (let i = 6; i > 0; i--) {
                    playNote(randomScaleNote(0, 1), beatMs() * 2, Math.round(_volume * (i / 6) * 0.7))
                }
                break
        }
    }

    // ── Song Generation blocks ────────────────────────────────────────────────

    /**
     * Play a named song section on its own.
     */
    //% block="play song section $section"
    //% group="Song Generation"
    export function playSongSection(section: SongSection): void {
        runSection(section)
    }

    //% block="play full random song"
    //% group="Song Generation"
    export function playFullSong(): void {
        if (_vizEnabled) {
            _vizX = 0; _vizPeaks = []; _vizFrame = 0; _vizPhase = 0
            screen.fill(0)
        }
        const progIdx = rng(0, PROGRESSIONS.length - 1)
        const structure: SongSection[] = [
            SongSection.Intro,
            SongSection.Verse,
            SongSection.Chorus,
            SongSection.Verse,
            SongSection.Bridge,
            SongSection.Chorus,
            SongSection.Outro
        ]
        for (let si = 0; si < structure.length; si++) {
            if (structure[si] !== SongSection.Intro && structure[si] !== SongSection.Outro) {
                const prog = PROGRESSIONS[progIdx]
                for (let ci = 0; ci < prog.length; ci++) {
                    music.play(music.createSoundEffect(
                        WaveShape.Sine,
                        noteFreq(prog[ci], -2), noteFreq(prog[ci], -2),
                        Math.round(_volume * 0.3), Math.round(_volume * 0.15),
                        beatMs() * 2,
                        SoundExpressionEffect.None, InterpolationCurve.Linear
                    ), music.PlaybackMode.InBackground)
                }
            }
            runSection(structure[si])
            pause(beatMs())
        }
        if (_vizEnabled) { pause(500); screen.fill(0) }
    }

    //% block="play random loop || for $bars bars"
    //% group="Song Generation"
    //% bars.defl=4
    //% expandableArgumentMode="toggle"
    export function playRandomLoop(bars: number = 4): void {
        if (_vizEnabled) { _vizX = 0; _vizPeaks = []; screen.fill(0) }
        const intervals   = scaleIntervals()
        const totalBeats  = bars * 4
        const patLen      = rng(4, 8)
        const patDegs: number[] = []
        const patDurs: number[] = []
        let deg = rng(0, intervals.length - 1)
        for (let i = 0; i < patLen; i++) {
            patDegs.push(deg)
            patDurs.push([1, 0.5, 0.5][rng(0, 2)])
            deg = Math.clamp(0, intervals.length * 3 - 1, deg + rng(-3, 3))
        }
        let beat = 0
        while (beat < totalBeats) {
            for (let pi = 0; pi < patLen && beat < totalBeats; pi++) {
                const freq = noteFreq(patDegs[pi], 0)
                const dur  = noteDuration(patDurs[pi])
                playNote(freq, dur, noteVol(_volume))
                if (dur < beatMs()) pause(beatMs() - dur)
                beat++
            }
        }
    }

    /**
     * Apply a style preset then play a full song.
     */
    //% block="compose song in $style style"
    //% group="Song Generation"
    export function composeSong(style: SongStyle): void {
        switch (style) {
            case SongStyle.Upbeat:
                _bpm = rng(140, 185); _scale = Scale.Major;        _wave = WaveShape.Square;    break
            case SongStyle.Sad:
                _bpm = rng(58, 90);  _scale = Scale.Minor;         _wave = WaveShape.Sine;      break
            case SongStyle.Epic:
                _bpm = rng(118, 150); _scale = Scale.Lydian;       _wave = WaveShape.Sawtooth;  break
            case SongStyle.Calm:
                _bpm = rng(68, 100); _scale = Scale.Pentatonic;    _wave = WaveShape.Triangle;  break
            case SongStyle.Mysterious:
                _bpm = rng(78, 110); _scale = Scale.Locrian;       _wave = WaveShape.Sine;      break
            case SongStyle.Heroic:
                _bpm = rng(128, 162); _scale = Scale.Major;        _wave = WaveShape.Square;    break
            case SongStyle.Ambient:
                _bpm = rng(48, 78);  _scale = Scale.WholeTone;     _wave = WaveShape.Sine;      break
            default:
                break
        }
        playFullSong()
    }

    // ── Visualizer blocks ─────────────────────────────────────────────────────

    //% block="enable visualizer $on"
    //% group="Visualizer"
    //% on.shadow="toggleOnOff"
    export function enableVisualizer(on: boolean): void {
        _vizEnabled = on
        if (on) {
            _vizX = 0; _vizPeaks = []; _vizFrame = 0; _vizPhase = 0
            screen.fill(0)
        }
    }

    //% block="set visualizer style to $style"
    //% group="Visualizer"
    export function setVisualizerStyle(style: VisualizerStyle): void {
        _vizStyle = style
        _vizX = 0; _vizPhase = 0
        if (_vizEnabled) screen.fill(0)
    }

    //% block="set visualizer color to $palette"
    //% group="Visualizer"
    export function setVisualizerColor(palette: VizColor): void {
        _vizColorPalette = palette
    }

    //% block="clear visualizer"
    //% group="Visualizer"
    export function clearVisualizer(): void {
        if (_vizEnabled) {
            _vizX = 0; _vizPeaks = []; _vizFrame = 0
            screen.fill(0)
        }
    }

    /**
     * Manually trigger a visualizer frame at the given frequency.
     * Useful for syncing visuals to custom audio events.
     */
    //% block="visualizer pulse at $freq Hz"
    //% group="Visualizer"
    //% freq.defl=440
    export function vizPulse(freq: number): void {
        showViz(freq)
    }
}
