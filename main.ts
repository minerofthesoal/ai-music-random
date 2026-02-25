/**
 * AI Music Random — procedural music generator for MakeCode Arcade.
 *
 * Generates melodies, chord progressions, rhythms, and full songs
 * using seeded randomness constrained to musical scales.
 */

//% weight=100 color=#9000e7 icon="\uf001"
//% block="AI Music"
//% groups="['Configuration', 'Scales & Keys', 'Playback', 'Song Generation', 'Visualizer']"
namespace aiMusic {

    // ── Scale definitions (semitone intervals from root) ────────────────

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
        Mixolydian
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
        Spectrum
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

    // ── Internal scale data ─────────────────────────────────────────────

    const SCALES: number[][] = [
        [0, 2, 4, 5, 7, 9, 11],        // Major
        [0, 2, 3, 5, 7, 8, 10],        // Minor
        [0, 2, 4, 7, 9],               // Pentatonic
        [0, 3, 5, 6, 7, 10],           // Blues
        [0, 2, 3, 5, 7, 9, 10],        // Dorian
        [0, 2, 4, 5, 7, 9, 10]         // Mixolydian
    ]

    // Common chord progressions as scale-degree arrays (0-indexed).
    // Each sub-array is one chord: [root degree, quality offset pattern].
    // We store them as root degrees; chord quality derived from scale.
    const PROGRESSIONS: number[][] = [
        [0, 3, 4, 0],      // I  - IV - V  - I
        [0, 4, 5, 3],      // I  - V  - vi - IV
        [0, 5, 3, 4],      // I  - vi - IV - V
        [5, 3, 0, 4],      // vi - IV - I  - V
        [0, 3, 0, 4],      // I  - IV - I  - V
        [0, 1, 3, 4]       // I  - ii - IV - V
    ]

    // ── State ───────────────────────────────────────────────────────────

    let _seed = 1
    let _scale: Scale = Scale.Major
    let _rootNote = 262  // Middle C (Hz)
    let _bpm = 120
    let _wave: WaveShape = WaveShape.Triangle
    let _volume = 255
    let _vizEnabled = false
    let _vizStyle: VisualizerStyle = VisualizerStyle.Bars
    let _vizX = 0

    // ── Seeded RNG ──────────────────────────────────────────────────────

    function rng(min: number, max: number): number {
        _seed = (_seed * 16807) % 2147483647
        return min + (Math.abs(_seed) % (max - min + 1))
    }

    function rngFloat(): number {
        _seed = (_seed * 16807) % 2147483647
        return Math.abs(_seed) / 2147483647
    }

    // ── Helpers ─────────────────────────────────────────────────────────

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
        const semitones = intervals[idx] + (octave + octaveShift) * 12
        return _rootNote * Math.pow(2, semitones / 12)
    }

    function randomScaleNote(minOctave: number, maxOctave: number): number {
        const intervals = scaleIntervals()
        const degree = rng(0, intervals.length - 1)
        const octave = rng(minOctave, maxOctave)
        return noteFreq(degree, octave)
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

    // ── Visualizer ──────────────────────────────────────────────────────

    function showViz(freq: number): void {
        if (!_vizEnabled) return
        const h = Math.clamp(2, 50, Math.round(Math.map(freq, 100, 2000, 2, 50)))
        const col = rng(1, 15)

        switch (_vizStyle) {
            case VisualizerStyle.Bars:
                screen.fillRect(_vizX, 120 - h, 4, h, col)
                _vizX = (_vizX + 5) % 160
                break

            case VisualizerStyle.Wave:
                for (let i = 0; i < 30; i++) {
                    const y = 60 + Math.round(Math.sin((freq / 150) + i * 0.4) * (h / 2))
                    screen.setPixel(_vizX + i, y, col)
                }
                _vizX = (_vizX + 31) % 130
                break

            case VisualizerStyle.Particles:
                for (let i = 0; i < 8; i++) {
                    screen.setPixel(rng(0, 159), rng(120 - h, 119), col)
                }
                break

            case VisualizerStyle.Spectrum:
                const barW = 2
                const numBars = 10
                const startX = 80 - (numBars * (barW + 1)) / 2
                for (let i = 0; i < numBars; i++) {
                    const barH = rng(2, h)
                    screen.fillRect(startX + i * (barW + 1), 120 - barH, barW, barH, col)
                }
                break
        }
    }

    // ── Configuration blocks ────────────────────────────────────────────

    //% block="set seed to $seed"
    //% group="Configuration"
    //% seed.defl=1
    export function setSeed(seed: number): void {
        _seed = seed
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

    //% block="enable visualizer $on"
    //% group="Visualizer"
    //% on.shadow="toggleOnOff"
    export function enableVisualizer(on: boolean): void {
        _vizEnabled = on
        if (on) {
            _vizX = 0
            screen.fill(0)
        }
    }

    //% block="set visualizer style to $style"
    //% group="Visualizer"
    export function setVisualizerStyle(style: VisualizerStyle): void {
        _vizStyle = style
    }

    // ── Playback blocks ─────────────────────────────────────────────────

    //% block="play random note"
    //% group="Playback"
    export function playRandomNote(): void {
        const freq = randomScaleNote(-1, 2)
        const dur = beatMs()
        playNote(freq, dur, _volume)
    }

    //% block="play random melody || of $length notes"
    //% group="Playback"
    //% length.defl=8
    //% expandableArgumentMode="toggle"
    export function playRandomMelody(length: number = 8): void {
        const intervals = scaleIntervals()
        let prevDegree = rng(0, intervals.length - 1)

        for (let i = 0; i < length; i++) {
            // Stepwise motion with occasional leaps
            let step: number
            if (rngFloat() < 0.7) {
                step = rng(-2, 2)
            } else {
                step = rng(-5, 5)
            }
            prevDegree = Math.clamp(0, intervals.length * 2 - 1, prevDegree + step)

            const freq = noteFreq(prevDegree, 0)
            const subdivisions = [1, 0.5, 0.25, 2]
            const durMul = subdivisions[rng(0, subdivisions.length - 1)]
            const dur = Math.round(beatMs() * durMul)
            playNote(freq, dur, _volume)
        }
    }

    //% block="play random chord"
    //% group="Playback"
    export function playRandomChord(): void {
        const intervals = scaleIntervals()
        const root = rng(0, intervals.length - 1)
        const third = (root + 2) % intervals.length
        const fifth = (root + 4) % intervals.length

        const rootFreq = noteFreq(root, 0)
        const thirdFreq = noteFreq(third, 0)
        const fifthFreq = noteFreq(fifth, 0)
        const dur = beatMs() * 2

        showViz(rootFreq)
        music.play(music.createSoundEffect(
            _wave,
            rootFreq, rootFreq,
            _volume, _volume - 40,
            dur,
            SoundExpressionEffect.None,
            InterpolationCurve.Linear
        ), music.PlaybackMode.InBackground)
        music.play(music.createSoundEffect(
            _wave,
            thirdFreq, thirdFreq,
            Math.round(_volume * 0.8), Math.round(_volume * 0.5),
            dur,
            SoundExpressionEffect.None,
            InterpolationCurve.Linear
        ), music.PlaybackMode.InBackground)
        music.play(music.createSoundEffect(
            _wave,
            fifthFreq, fifthFreq,
            Math.round(_volume * 0.7), Math.round(_volume * 0.4),
            dur,
            SoundExpressionEffect.None,
            InterpolationCurve.Linear
        ), music.PlaybackMode.UntilDone)
    }

    //% block="play arpeggio || of $notes notes"
    //% group="Playback"
    //% notes.defl=8
    //% expandableArgumentMode="toggle"
    export function playArpeggio(notes: number = 8): void {
        const intervals = scaleIntervals()
        const root = rng(0, intervals.length - 1)
        const chordTones = [root, (root + 2) % intervals.length, (root + 4) % intervals.length]
        const dur = Math.round(beatMs() / 2)

        for (let i = 0; i < notes; i++) {
            const tone = chordTones[i % chordTones.length]
            const octShift = Math.floor(i / chordTones.length)
            const freq = noteFreq(tone, octShift)
            playNote(freq, dur, _volume)
        }
    }

    //% block="play random rhythm || of $beats beats"
    //% group="Playback"
    //% beats.defl=8
    //% expandableArgumentMode="toggle"
    export function playRandomRhythm(beats: number = 8): void {
        for (let i = 0; i < beats; i++) {
            if (rngFloat() < 0.15) {
                // Rest
                pause(beatMs())
            } else {
                const freq = randomScaleNote(-1, 1)
                const subdivisions = [1, 0.5, 0.5, 0.25]
                const durMul = subdivisions[rng(0, subdivisions.length - 1)]
                const dur = Math.round(beatMs() * durMul)
                const accent = (i % 4 === 0) ? _volume : Math.round(_volume * 0.7)
                playNote(freq, dur, accent)
                if (dur < beatMs()) {
                    pause(beatMs() - dur)
                }
            }
        }
    }

    //% block="play chord progression"
    //% group="Playback"
    export function playChordProgression(): void {
        const prog = PROGRESSIONS[rng(0, PROGRESSIONS.length - 1)]
        const intervals = scaleIntervals()
        const dur = beatMs() * 2

        for (let ci = 0; ci < prog.length; ci++) {
            const root = prog[ci]
            const rootFreq = noteFreq(root, -1)
            const thirdFreq = noteFreq((root + 2) % intervals.length, -1)
            const fifthFreq = noteFreq((root + 4) % intervals.length, -1)

            showViz(rootFreq)

            music.play(music.createSoundEffect(
                _wave,
                rootFreq, rootFreq,
                _volume, Math.round(_volume * 0.7),
                dur,
                SoundExpressionEffect.None,
                InterpolationCurve.Linear
            ), music.PlaybackMode.InBackground)
            music.play(music.createSoundEffect(
                _wave,
                thirdFreq, thirdFreq,
                Math.round(_volume * 0.8), Math.round(_volume * 0.5),
                dur,
                SoundExpressionEffect.None,
                InterpolationCurve.Linear
            ), music.PlaybackMode.InBackground)
            music.play(music.createSoundEffect(
                _wave,
                fifthFreq, fifthFreq,
                Math.round(_volume * 0.7), Math.round(_volume * 0.4),
                dur,
                SoundExpressionEffect.None,
                InterpolationCurve.Linear
            ), music.PlaybackMode.UntilDone)
        }
    }

    // ── Song generation ─────────────────────────────────────────────────

    function playSectionMelody(noteCt: number, octLo: number, octHi: number, volScale: number): void {
        const intervals = scaleIntervals()
        let deg = rng(0, intervals.length - 1)
        for (let i = 0; i < noteCt; i++) {
            if (rngFloat() < 0.12) {
                pause(Math.round(beatMs() * 0.5))
                continue
            }
            const step = rngFloat() < 0.65 ? rng(-2, 2) : rng(-4, 4)
            deg = Math.clamp(0, intervals.length * (octHi - octLo + 1) - 1, deg + step)
            const freq = noteFreq(deg, octLo)
            const subdivisions = [1, 0.5, 0.5, 0.25, 2]
            const durMul = subdivisions[rng(0, subdivisions.length - 1)]
            const dur = Math.round(beatMs() * durMul)
            const vol = Math.round(_volume * volScale)
            playNote(freq, dur, vol)
        }
    }

    function playSection(section: SongSection): void {
        switch (section) {
            case SongSection.Intro:
                // Soft, sparse intro
                playSectionMelody(6, 0, 1, 0.5)
                break
            case SongSection.Verse:
                // Mid-range, moderate energy
                playSectionMelody(12, -1, 1, 0.75)
                break
            case SongSection.Chorus:
                // Higher energy, wider range
                playSectionMelody(16, -1, 2, 1.0)
                break
            case SongSection.Bridge:
                // Change instrument for contrast
                const savedWave = _wave
                const waveOptions: WaveShape[] = [
                    WaveShape.Triangle, WaveShape.Sawtooth,
                    WaveShape.Square, WaveShape.Sine
                ]
                _wave = waveOptions[rng(0, waveOptions.length - 1)]
                playSectionMelody(10, 0, 2, 0.85)
                _wave = savedWave
                break
            case SongSection.Outro:
                // Fade out
                for (let i = 6; i > 0; i--) {
                    const freq = randomScaleNote(0, 1)
                    const dur = beatMs() * 2
                    const vol = Math.round(_volume * (i / 6) * 0.7)
                    playNote(freq, dur, vol)
                }
                break
        }
    }

    //% block="play full random song"
    //% group="Song Generation"
    export function playFullSong(): void {
        if (_vizEnabled) {
            _vizX = 0
            screen.fill(0)
        }

        // Pick a random chord progression for the song
        const progIdx = rng(0, PROGRESSIONS.length - 1)

        // Song structure: Intro → Verse → Chorus → Verse → Bridge → Chorus → Outro
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
            // Play backing chords for non-intro/outro sections
            if (structure[si] !== SongSection.Intro && structure[si] !== SongSection.Outro) {
                const prog = PROGRESSIONS[progIdx]
                const intervals = scaleIntervals()
                for (let ci = 0; ci < prog.length; ci++) {
                    const rootFreq = noteFreq(prog[ci], -2)
                    const dur = beatMs() * 2
                    music.play(music.createSoundEffect(
                        WaveShape.Sine,
                        rootFreq, rootFreq,
                        Math.round(_volume * 0.3), Math.round(_volume * 0.15),
                        dur,
                        SoundExpressionEffect.None,
                        InterpolationCurve.Linear
                    ), music.PlaybackMode.InBackground)
                }
            }
            playSection(structure[si])
            pause(beatMs())
        }

        if (_vizEnabled) {
            pause(500)
            screen.fill(0)
        }
    }

    //% block="play random loop || for $bars bars"
    //% group="Song Generation"
    //% bars.defl=4
    //% expandableArgumentMode="toggle"
    export function playRandomLoop(bars: number = 4): void {
        if (_vizEnabled) {
            _vizX = 0
            screen.fill(0)
        }

        // Generate a short pattern
        const beatsPerBar = 4
        const totalBeats = bars * beatsPerBar
        const intervals = scaleIntervals()
        const patternLen = rng(4, 8)
        const patternDegrees: number[] = []
        const patternDurs: number[] = []

        let deg = rng(0, intervals.length - 1)
        for (let i = 0; i < patternLen; i++) {
            patternDegrees.push(deg)
            const subdivisions = [1, 0.5, 0.5]
            patternDurs.push(subdivisions[rng(0, subdivisions.length - 1)])
            deg = Math.clamp(0, intervals.length * 3 - 1, deg + rng(-3, 3))
        }

        // Play the pattern looping over total beats
        let beatCount = 0
        while (beatCount < totalBeats) {
            for (let pi = 0; pi < patternLen && beatCount < totalBeats; pi++) {
                const freq = noteFreq(patternDegrees[pi], 0)
                const dur = Math.round(beatMs() * patternDurs[pi])
                playNote(freq, dur, _volume)
                if (dur < beatMs()) {
                    pause(beatMs() - dur)
                }
                beatCount++
            }
        }
    }

    //% block="play random sound effect"
    //% group="Playback"
    export function playRandomSfx(): void {
        const startFreq = rng(200, 2000)
        const endFreq = rng(100, 3000)
        const dur = rng(50, 300)
        const effects: SoundExpressionEffect[] = [
            SoundExpressionEffect.None,
            SoundExpressionEffect.Vibrato,
            SoundExpressionEffect.Tremolo,
            SoundExpressionEffect.Warble
        ]
        const fx = effects[rng(0, effects.length - 1)]
        const curves: InterpolationCurve[] = [
            InterpolationCurve.Linear,
            InterpolationCurve.Curve,
            InterpolationCurve.Logarithmic
        ]
        const curve = curves[rng(0, curves.length - 1)]

        showViz(startFreq)
        music.play(music.createSoundEffect(
            _wave,
            startFreq, endFreq,
            _volume, 0,
            dur,
            fx,
            curve
        ), music.PlaybackMode.UntilDone)
    }
}
