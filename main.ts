/**
 * AI Music Random — procedural music generator for MakeCode Arcade.
 *
 * Generate melodies, chord progressions, drum grooves, basslines, and full
 * songs from a seed. Music stays in key by sampling from real scales, and
 * playback is reproducible for any given seed.
 */
//% weight=100 color=#9b27e6 icon="\uf001"
//% block="AI Music"
//% groups="['Setup', 'Scale & Key', 'Notes', 'Patterns', 'Drums', 'Songs', 'Visualizer', 'Song Code']"
namespace aiMusic {

    // ─── Enums ──────────────────────────────────────────────────────────────

    //% block="scale"
    export enum Scale {
        //% block="major"
        Major,
        //% block="minor"
        Minor,
        //% block="pentatonic"
        Pentatonic,
        //% block="blues"
        Blues,
        //% block="dorian"
        Dorian,
        //% block="mixolydian"
        Mixolydian,
        //% block="lydian"
        Lydian,
        //% block="phrygian"
        Phrygian,
        //% block="harmonic minor"
        HarmonicMinor,
        //% block="whole tone"
        WholeTone,
        //% block="chromatic"
        Chromatic
    }

    //% block="feel"
    export enum Feel {
        //% block="straight"
        Straight,
        //% block="swing"
        Swing,
        //% block="staccato"
        Staccato,
        //% block="legato"
        Legato
    }

    //% block="section"
    export enum Section {
        //% block="intro"
        Intro,
        //% block="verse"
        Verse,
        //% block="chorus"
        Chorus,
        //% block="bridge"
        Bridge,
        //% block="outro"
        Outro
    }

    //% block="mood"
    export enum Mood {
        //% block="happy"
        Happy,
        //% block="sad"
        Sad,
        //% block="epic"
        Epic,
        //% block="calm"
        Calm,
        //% block="spooky"
        Spooky,
        //% block="dreamy"
        Dreamy
    }

    //% block="visualizer"
    export enum Visualizer {
        //% block="off"
        Off,
        //% block="bars"
        Bars,
        //% block="wave"
        Wave,
        //% block="rings"
        Rings,
        //% block="rain"
        Rain
    }

    //% block="drum"
    export enum Drum {
        //% block="kick"
        Kick,
        //% block="snare"
        Snare,
        //% block="hi-hat"
        HiHat,
        //% block="tom"
        Tom,
        //% block="cymbal"
        Cymbal
    }

    // ─── Music data ─────────────────────────────────────────────────────────

    // Scale intervals in semitones from the root.
    const SCALES: number[][] = [
        [0, 2, 4, 5, 7, 9, 11],         // Major
        [0, 2, 3, 5, 7, 8, 10],         // Minor
        [0, 2, 4, 7, 9],                // Pentatonic
        [0, 3, 5, 6, 7, 10],            // Blues
        [0, 2, 3, 5, 7, 9, 10],         // Dorian
        [0, 2, 4, 5, 7, 9, 10],         // Mixolydian
        [0, 2, 4, 6, 7, 9, 11],         // Lydian
        [0, 1, 3, 5, 7, 8, 10],         // Phrygian
        [0, 2, 3, 5, 7, 8, 11],         // Harmonic Minor
        [0, 2, 4, 6, 8, 10],            // Whole Tone
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]  // Chromatic
    ]

    // Common chord progressions as scale-degree indices.
    const PROGRESSIONS: number[][] = [
        [0, 3, 4, 0],   // I-IV-V-I
        [0, 4, 5, 3],   // I-V-vi-IV
        [0, 5, 3, 4],   // I-vi-IV-V
        [5, 3, 0, 4],   // vi-IV-I-V
        [0, 3, 0, 4],   // I-IV-I-V
        [0, 1, 3, 4],   // I-ii-IV-V
        [0, 2, 5, 4],   // I-iii-vi-V
        [0, 6, 3, 4]    // I-VII-IV-V
    ]

    // ─── State ──────────────────────────────────────────────────────────────

    let seed = 1
    let scale: Scale = Scale.Major
    let rootHz = 262          // ~C4
    let bpm = 120
    let waveform: WaveShape = WaveShape.Triangle
    let volume = 200
    let feel: Feel = Feel.Straight
    let octaveShift = 0

    let viz: Visualizer = Visualizer.Off
    let vizFrame = 0

    // ─── Seeded RNG (Lehmer / Park-Miller) ──────────────────────────────────

    function randInt(lo: number, hi: number): number {
        seed = (seed * 48271) % 2147483647
        if (seed <= 0) seed += 2147483646
        return lo + (seed % (hi - lo + 1))
    }

    function randFloat(): number {
        seed = (seed * 48271) % 2147483647
        if (seed <= 0) seed += 2147483646
        return seed / 2147483647
    }

    function pickN(items: number[]): number {
        return items[randInt(0, items.length - 1)]
    }

    function pickWave(items: WaveShape[]): WaveShape {
        return items[randInt(0, items.length - 1)]
    }

    function pickProg(): number[] {
        return PROGRESSIONS[randInt(0, PROGRESSIONS.length - 1)]
    }

    function chance(p: number): boolean {
        return randFloat() < p
    }

    // ─── Pitch helpers ──────────────────────────────────────────────────────

    function intervals(): number[] {
        return SCALES[scale]
    }

    /** Convert a (degree, octave) coordinate into a frequency in Hz. */
    function pitch(degree: number, octave: number): number {
        const ivs = intervals()
        const wrapped = ((degree % ivs.length) + ivs.length) % ivs.length
        const carry = Math.floor(degree / ivs.length)
        const semis = ivs[wrapped] + (octave + carry + octaveShift) * 12
        return rootHz * Math.pow(2, semis / 12)
    }

    function randomDegree(): number {
        return randInt(0, intervals().length - 1)
    }

    // ─── Timing ─────────────────────────────────────────────────────────────

    /** Length of one quarter note in milliseconds. */
    function beatMs(): number {
        return Math.idiv(60000, bpm)
    }

    /**
     * Apply feel to a base duration multiplier (e.g. 1 = quarter).
     * Returns ms. Swing handles in alternate-eighth pairs at the call site;
     * here we only adjust staccato/legato.
     */
    function noteMs(mul: number): number {
        let ms = Math.round(beatMs() * mul)
        if (feel === Feel.Staccato) ms = Math.round(ms * 0.45)
        else if (feel === Feel.Legato) ms = Math.round(ms * 1.15)
        return Math.max(1, ms)
    }

    // ─── Audio primitives ───────────────────────────────────────────────────

    function tone(freq: number, ms: number, vol: number, wave: WaveShape, mode: number): void {
        showViz(freq)
        music.play(music.createSoundEffect(
            wave, freq, freq, vol, Math.max(0, vol - 60), ms,
            SoundExpressionEffect.None, InterpolationCurve.Linear
        ), mode)
    }

    function playPitch(freq: number, ms: number, vol: number): void {
        tone(freq, ms, vol, waveform, music.PlaybackMode.UntilDone)
    }

    function layerPitch(freq: number, ms: number, vol: number): void {
        tone(freq, ms, vol, waveform, music.PlaybackMode.InBackground)
    }

    /** Play a chord built on the given scale degree. Last voice waits. */
    function playChord(degree: number, octave: number, ms: number): void {
        const r = pitch(degree, octave)
        const t = pitch(degree + 2, octave)
        const f = pitch(degree + 4, octave)
        layerPitch(r, ms, volume)
        layerPitch(t, ms, Math.idiv(volume * 4, 5))
        playPitch(f, ms, Math.idiv(volume * 7, 10))
    }

    // ─── Setup blocks ───────────────────────────────────────────────────────

    //% block="set seed to $value"
    //% group="Setup" value.defl=1
    export function setSeed(value: number): void {
        seed = value === 0 ? 1 : Math.abs(value)
    }

    /** Generate a fresh seed from the system clock and apply it. Returns the seed. */
    //% block="random seed"
    //% group="Setup"
    export function randomSeed(): number {
        const s = Math.max(1, Math.floor(Math.random() * 2147483646))
        seed = s
        return s
    }

    //% block="set tempo to $value bpm"
    //% group="Setup" value.min=40 value.max=240 value.defl=120
    export function setTempo(value: number): void {
        bpm = Math.constrain(value, 40, 240)
    }

    //% block="set volume to $value"
    //% group="Setup" value.min=0 value.max=255 value.defl=200
    export function setVolume(value: number): void {
        volume = Math.constrain(value, 0, 255)
    }

    //% block="set instrument to $wave"
    //% group="Setup"
    export function setInstrument(wave: WaveShape): void {
        waveform = wave
    }

    //% block="set feel to $value"
    //% group="Setup"
    export function setFeel(value: Feel): void {
        feel = value
    }

    // ─── Scale & Key blocks ─────────────────────────────────────────────────

    //% block="set scale to $value"
    //% group="Scale & Key"
    export function setScale(value: Scale): void {
        scale = value
    }

    //% block="set root note to $hz Hz"
    //% group="Scale & Key" hz.defl=262
    export function setRoot(hz: number): void {
        rootHz = Math.max(20, hz)
    }

    //% block="transpose by $semitones semitones"
    //% group="Scale & Key" semitones.min=-12 semitones.max=12 semitones.defl=0
    export function transpose(semitones: number): void {
        rootHz = rootHz * Math.pow(2, semitones / 12)
    }

    //% block="set octave shift to $value"
    //% group="Scale & Key" value.min=-3 value.max=3 value.defl=0
    export function setOctave(value: number): void {
        octaveShift = Math.constrain(value, -3, 3)
    }

    //% block="apply mood $value"
    //% group="Scale & Key"
    export function applyMood(value: Mood): void {
        switch (value) {
            case Mood.Happy:
                scale = Scale.Major; bpm = randInt(120, 160); waveform = WaveShape.Square; feel = Feel.Straight; break
            case Mood.Sad:
                scale = Scale.Minor; bpm = randInt(60, 90); waveform = WaveShape.Sine; feel = Feel.Legato; break
            case Mood.Epic:
                scale = Scale.Lydian; bpm = randInt(110, 140); waveform = WaveShape.Sawtooth; feel = Feel.Straight; break
            case Mood.Calm:
                scale = Scale.Pentatonic; bpm = randInt(70, 95); waveform = WaveShape.Triangle; feel = Feel.Legato; break
            case Mood.Spooky:
                scale = Scale.Phrygian; bpm = randInt(70, 100); waveform = WaveShape.Sine; feel = Feel.Legato; break
            case Mood.Dreamy:
                scale = Scale.WholeTone; bpm = randInt(55, 80); waveform = WaveShape.Sine; feel = Feel.Legato; break
        }
    }

    // ─── Note / pattern blocks ──────────────────────────────────────────────

    //% block="play random note"
    //% group="Notes"
    export function playNote(): void {
        const d = randomDegree()
        const o = randInt(-1, 1)
        playPitch(pitch(d, o), noteMs(1), volume)
    }

    //% block="play melody of $length notes"
    //% group="Notes" length.min=2 length.max=64 length.defl=8
    export function playMelody(length: number): void {
        const ivs = intervals()
        let deg = randomDegree()
        const top = ivs.length * 2 - 1
        for (let i = 0; i < length; i++) {
            // Mostly stepwise motion with occasional leaps.
            const step = chance(0.7) ? randInt(-2, 2) : randInt(-5, 5)
            deg = Math.constrain(deg + step, 0, top)
            const dur = noteMs(pickN([1, 0.5, 0.5, 0.25, 2]))
            playPitch(pitch(deg, 0), dur, volume)
        }
    }

    //% block="play chord"
    //% group="Patterns"
    export function playRandomChord(): void {
        playChord(randomDegree(), 0, beatMs() * 2)
    }

    //% block="play arpeggio of $notes notes"
    //% group="Patterns" notes.min=3 notes.max=32 notes.defl=8
    export function playArpeggio(notes: number): void {
        const root = randomDegree()
        const tones = [root, root + 2, root + 4]
        const dur = noteMs(0.5)
        for (let i = 0; i < notes; i++) {
            const t = tones[i % tones.length]
            playPitch(pitch(t, Math.idiv(i, tones.length)), dur, volume)
        }
    }

    //% block="play chord progression"
    //% group="Patterns"
    export function playProgression(): void {
        const prog = pickProg()
        for (let i = 0; i < prog.length; i++) {
            playChord(prog[i], -1, beatMs() * 2)
        }
    }

    //% block="play bassline of $length notes"
    //% group="Patterns" length.min=2 length.max=32 length.defl=8
    export function playBassline(length: number): void {
        const prog = pickProg()
        const saved = waveform
        waveform = WaveShape.Sine
        for (let i = 0; i < length; i++) {
            const d = prog[i % prog.length]
            const dur = noteMs(pickN([1, 1, 0.5, 2]))
            playPitch(pitch(d, -2), Math.idiv(dur * 17, 20), Math.idiv(volume * 17, 20))
        }
        waveform = saved
    }

    //% block="play rhythm of $beats beats"
    //% group="Patterns" beats.min=2 beats.max=32 beats.defl=8
    export function playRhythm(beats: number): void {
        for (let i = 0; i < beats; i++) {
            if (chance(0.15)) { pause(beatMs()); continue }
            const d = randomDegree()
            const o = randInt(-1, 1)
            const dur = noteMs(pickN([1, 0.5, 0.5, 0.25]))
            const v = (i % 4 === 0) ? volume : Math.idiv(volume * 7, 10)
            playPitch(pitch(d, o), dur, v)
            if (dur < beatMs()) pause(beatMs() - dur)
        }
    }

    /**
     * Play an "AABA"-style call and response: a short call phrase up high,
     * then a response down low that resolves to the root.
     */
    //% block="play call and response"
    //% group="Patterns"
    export function playCallResponse(): void {
        for (let i = 0; i < 4; i++) {
            playPitch(pitch(randomDegree(), 1), noteMs(0.5), volume)
        }
        pause(Math.idiv(beatMs(), 2))
        for (let i = 0; i < 3; i++) {
            playPitch(pitch(randomDegree(), -1), noteMs(0.5), Math.idiv(volume * 9, 10))
        }
        playPitch(pitch(0, 0), noteMs(2), volume)
    }

    // ─── Drums ──────────────────────────────────────────────────────────────

    //% block="hit drum $kind"
    //% group="Drums"
    export function hitDrum(kind: Drum): void {
        switch (kind) {
            case Drum.Kick:
                showViz(80)
                music.play(music.createSoundEffect(
                    WaveShape.Sine, 160, 40, volume, 0,
                    Math.idiv(beatMs(), 4),
                    SoundExpressionEffect.None, InterpolationCurve.Curve
                ), music.PlaybackMode.UntilDone)
                break
            case Drum.Snare:
                showViz(400)
                music.play(music.createSoundEffect(
                    WaveShape.Noise, 400, 200, Math.idiv(volume * 9, 10), 0,
                    Math.idiv(beatMs() * 3, 20),
                    SoundExpressionEffect.None, InterpolationCurve.Linear
                ), music.PlaybackMode.UntilDone)
                break
            case Drum.HiHat:
                showViz(2400)
                music.play(music.createSoundEffect(
                    WaveShape.Noise, 2400, 3000, Math.idiv(volume * 4, 10), 0,
                    Math.idiv(beatMs(), 14),
                    SoundExpressionEffect.None, InterpolationCurve.Linear
                ), music.PlaybackMode.UntilDone)
                break
            case Drum.Tom:
                showViz(220)
                music.play(music.createSoundEffect(
                    WaveShape.Sine, 260, 100, Math.idiv(volume * 17, 20), 0,
                    Math.idiv(beatMs(), 5),
                    SoundExpressionEffect.None, InterpolationCurve.Curve
                ), music.PlaybackMode.UntilDone)
                break
            case Drum.Cymbal:
                showViz(3000)
                music.play(music.createSoundEffect(
                    WaveShape.Noise, 3200, 4000, Math.idiv(volume, 2), 0,
                    Math.idiv(beatMs(), 2),
                    SoundExpressionEffect.None, InterpolationCurve.Logarithmic
                ), music.PlaybackMode.UntilDone)
                break
        }
    }

    /**
     * Play a generated drum groove: kick on 1 & 3, snare on 2 & 4,
     * probabilistic hats on offbeats.
     */
    //% block="play drum groove of $beats beats"
    //% group="Drums" beats.min=2 beats.max=32 beats.defl=8
    export function playGroove(beats: number): void {
        const step = beatMs()
        for (let i = 0; i < beats; i++) {
            const m4 = i % 4
            if (m4 === 0) {
                music.play(music.createSoundEffect(
                    WaveShape.Sine, 160, 45, volume, 0,
                    Math.idiv(step, 4),
                    SoundExpressionEffect.None, InterpolationCurve.Curve
                ), music.PlaybackMode.InBackground)
            }
            if (m4 === 2) {
                music.play(music.createSoundEffect(
                    WaveShape.Noise, 400, 200, Math.idiv(volume * 4, 5), 0,
                    Math.idiv(step * 3, 20),
                    SoundExpressionEffect.None, InterpolationCurve.Linear
                ), music.PlaybackMode.InBackground)
            }
            if (m4 !== 0 && m4 !== 2 && chance(0.55)) {
                music.play(music.createSoundEffect(
                    WaveShape.Noise, 2400, 3000, Math.idiv(volume * 35, 100), 0,
                    Math.idiv(step, 14),
                    SoundExpressionEffect.None, InterpolationCurve.Linear
                ), music.PlaybackMode.InBackground)
            }
            pause(step)
        }
    }

    // ─── Songs ──────────────────────────────────────────────────────────────

    function buildSection(s: Section): void {
        switch (s) {
            case Section.Intro: {
                for (let i = 0; i < 4; i++) {
                    playPitch(pitch(randomDegree(), 0), noteMs(1), Math.idiv(volume, 2))
                }
                break
            }
            case Section.Verse: {
                playMelody(8)
                break
            }
            case Section.Chorus: {
                const prog = pickProg()
                for (let i = 0; i < prog.length; i++) {
                    layerPitch(pitch(prog[i], -2), beatMs() * 2, Math.idiv(volume, 3))
                    playMelody(4)
                }
                break
            }
            case Section.Bridge: {
                const saved = waveform
                waveform = pickWave([WaveShape.Triangle, WaveShape.Sawtooth, WaveShape.Square, WaveShape.Sine])
                playMelody(6)
                waveform = saved
                break
            }
            case Section.Outro: {
                for (let i = 4; i > 0; i--) {
                    playPitch(pitch(randomDegree(), 0), beatMs() * 2, Math.idiv(volume * i, 8))
                }
                break
            }
        }
    }

    //% block="play section $s"
    //% group="Songs"
    export function playSection(s: Section): void {
        buildSection(s)
    }

    //% block="play full song"
    //% group="Songs"
    export function playFullSong(): void {
        if (viz !== Visualizer.Off) screen.fill(0)
        const order: Section[] = [
            Section.Intro, Section.Verse, Section.Chorus,
            Section.Verse, Section.Bridge, Section.Chorus, Section.Outro
        ]
        for (let i = 0; i < order.length; i++) {
            buildSection(order[i])
            pause(beatMs())
        }
        if (viz !== Visualizer.Off) { pause(300); screen.fill(0) }
    }

    //% block="play loop for $bars bars"
    //% group="Songs" bars.min=1 bars.max=16 bars.defl=4
    export function playLoop(bars: number): void {
        const ivs = intervals()
        const len = randInt(4, 8)
        const degs: number[] = []
        const durs: number[] = []
        let d = randomDegree()
        for (let i = 0; i < len; i++) {
            degs.push(d)
            durs.push(pickN([1, 0.5, 0.5]))
            d = Math.constrain(d + randInt(-3, 3), 0, ivs.length * 2 - 1)
        }
        const total = bars * 4
        let beat = 0
        while (beat < total) {
            for (let i = 0; i < len && beat < total; i++) {
                const dur = noteMs(durs[i])
                playPitch(pitch(degs[i], 0), dur, volume)
                if (dur < beatMs()) pause(beatMs() - dur)
                beat++
            }
        }
    }

    // ─── Visualizer ─────────────────────────────────────────────────────────

    //% block="set visualizer $value"
    //% group="Visualizer"
    export function setVisualizer(value: Visualizer): void {
        viz = value
        vizFrame = 0
        screen.fill(0)
    }

    function showViz(freq: number): void {
        if (viz === Visualizer.Off) return
        vizFrame++
        const h = Math.constrain(Math.idiv(Math.round(freq), 40), 4, 56)
        const c = 1 + (vizFrame % 14)
        switch (viz) {
            case Visualizer.Bars: {
                const bw = 5
                const x = (vizFrame * (bw + 1)) % 160
                screen.fillRect(x, 60, bw, 60, 0)
                screen.fillRect(x, 120 - h, bw, h, c)
                break
            }
            case Visualizer.Wave: {
                const amp = Math.idiv(h, 2)
                const y0 = 60
                for (let dx = 0; dx < 8; dx++) {
                    const x = (vizFrame * 8 + dx) % 160
                    const phase = (x + vizFrame) * 0.18
                    const y = Math.constrain(y0 + Math.round(amp * Math.sin(phase)), 0, 119)
                    screen.setPixel((x + 16) % 160, y0, 0)
                    screen.setPixel(x, y, c)
                }
                break
            }
            case Visualizer.Rings: {
                const cx = 80, cy = 60
                const r = 4 + (vizFrame % 50)
                for (let a = 0; a < 32; a++) {
                    const ang = (a / 32) * Math.PI * 2
                    const x = Math.round(cx + r * Math.cos(ang))
                    const y = Math.round(cy + r * Math.sin(ang) * 0.6)
                    if (x >= 0 && x < 160 && y >= 0 && y < 120) screen.setPixel(x, y, c)
                }
                if (vizFrame % 50 === 0) screen.fill(0)
                break
            }
            case Visualizer.Rain: {
                for (let i = 0; i < 6; i++) {
                    const x = Math.round(Math.random() * 159)
                    const y = Math.round(Math.random() * 119)
                    screen.setPixel(x, y, c)
                }
                if (vizFrame % 30 === 0) {
                    for (let fx = 0; fx < 160; fx += 4) {
                        for (let fy = 0; fy < 120; fy += 4) screen.setPixel(fx, fy, 0)
                    }
                }
                break
            }
        }
    }

    // ─── Song Code (compact, shareable, restorable) ─────────────────────────

    /**
     * Encode all current settings into a string you can save and reload.
     * Format is versioned so future updates can stay backwards compatible.
     */
    //% block="get song code"
    //% group="Song Code"
    export function getSongCode(): string {
        return "AIM4:" + seed
            + ":" + bpm
            + ":" + volume
            + ":" + scale
            + ":" + Math.round(rootHz)
            + ":" + waveform
            + ":" + feel
            + ":" + octaveShift
            + ":" + viz
    }

    /** Restore settings from a song code. Invalid codes are ignored. */
    //% block="load song code $code"
    //% group="Song Code" code.defl=""
    export function loadSongCode(code: string): void {
        if (!code || code.indexOf("AIM4:") !== 0) return
        const parts = code.split(":")
        if (parts.length < 10) return
        const s = parseInt(parts[1])
        const t = parseInt(parts[2])
        const v = parseInt(parts[3])
        const sc = parseInt(parts[4])
        const r = parseInt(parts[5])
        const w = parseInt(parts[6])
        const f = parseInt(parts[7])
        const o = parseInt(parts[8])
        const vz = parseInt(parts[9])
        if (s > 0) seed = s
        if (t >= 40 && t <= 240) bpm = t
        if (v >= 0 && v <= 255) volume = v
        if (sc >= 0 && sc <= 10) scale = sc as Scale
        if (r > 0) rootHz = r
        if (w >= 0 && w <= 4) waveform = w as WaveShape
        if (f >= 0 && f <= 3) feel = f as Feel
        if (o >= -3 && o <= 3) octaveShift = o
        if (vz >= 0 && vz <= 4) viz = vz as Visualizer
    }
}
