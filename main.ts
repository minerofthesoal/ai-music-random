namespace randomMusic {
    let rngSeed = 1
    let currentKeyIsMajor = true
    let noteLog: number[] = []
    let currentWave: WaveShape = WaveShape.Sine
    let visualizerEnabled = false

    //% block="Visualizer Mode"
    export enum VisualizerMode {
        //% block="Bar"
        Bar,
        //% block="Wave"
        Wave,
        //% block="Particle"
        Particle
    }

    let visualizerMode: VisualizerMode = VisualizerMode.Bar

    const majorScale = [0, 2, 4, 5, 7, 9, 11]
    const minorScale = [0, 2, 3, 5, 7, 8, 10]
    const instrumentWaves: WaveShape[] = [
        WaveShape.Triangle,
        WaveShape.Sawtooth,
        WaveShape.Square,
        WaveShape.Sine,
        WaveShape.Noise
    ]

    //% block="set music seed to %seed"
    export function setMusicSeed(seed: number): void {
        rngSeed = seed
    }

    function seededRandom(min: number, max: number): number {
        rngSeed = (rngSeed * 16807) % 2147483647
        return min + (rngSeed % (max - min + 1))
    }

    //% block="set music key to major %isMajor"
    //% isMajor.shadow="toggleOnOff"
    export function setMusicKey(isMajor: boolean): void {
        currentKeyIsMajor = isMajor
    }

    //% block="set instrument to %wave"
    //% wave.shadow="waveShapePicker"
    export function setInstrument(wave: WaveShape): void {
        currentWave = wave
    }

    //% block="enable visualizer %enabled"
    //% enabled.shadow="toggleOnOff"
    export function enableVisualizer(enabled: boolean): void {
        visualizerEnabled = enabled
    }

    //% block="set visualizer mode to %mode"
    //% mode.shadow="randomMusic.VisualizerMode"
    export function setVisualizerMode(mode: VisualizerMode): void {
        visualizerMode = mode
    }

    function randomizeInstrument() {
        currentWave = instrumentWaves[seededRandom(0, instrumentWaves.length - 1)]
    }

    function getScaleNote(): number {
        const scale = currentKeyIsMajor ? majorScale : minorScale
        const base = 110
        const octaveOffset = seededRandom(0, 5)
        const step = scale[seededRandom(0, scale.length - 1)] + 12 * octaveOffset
        return base * Math.pow(2, step / 12)
    }

    function showVisualizer(freq: number) {
        if (!visualizerEnabled) return

        const xOrigin = 110
        const yOrigin = 90
        const color = randint(2, 15)
        const height = Math.clamp(4, 40, Math.map(freq, 110, 2000, 4, 40))

        switch (visualizerMode) {
            case VisualizerMode.Bar:
                screen.fillRect(xOrigin, yOrigin - height, 6, height, color)
                break

            case VisualizerMode.Wave:
                for (let i = 0; i < 20; i++) {
                    let y = Math.sin((freq / 200) + i / 2) * 5
                    screen.setPixel(xOrigin + i, yOrigin - y, color)
                }
                break

            case VisualizerMode.Particle:
                for (let i = 0; i < 6; i++) {
                    let dx = xOrigin + randint(0, 12)
                    let dy = yOrigin - randint(0, height)
                    screen.setPixel(dx, dy, color)
                }
                break
        }
    }

    //% block="play random sound effect"
    export function playRandomSound(): void {
        const freqStart = getScaleNote()
        const freqEnd = getScaleNote()
        const duration = seededRandom(100, 400)
        noteLog.push(freqStart)
        showVisualizer(freqStart)

        music.play(music.createSoundEffect(
            currentWave,
            freqStart,
            freqEnd,
            255,
            0,
            duration,
            SoundExpressionEffect.None,
            InterpolationCurve.Linear
        ), music.PlaybackMode.UntilDone)
    }

    //% block="play random rhythm sequence"
    export function playRandomRhythm(): void {
        const beatDurations = [125, 200, 300, 400]
        for (let i = 0; i < 4; i++) {
            playRandomSound()
            pause(beatDurations[seededRandom(0, beatDurations.length - 1)])
        }
    }

    //% block="play hybrid beat"
    export function playHybridBeat(): void {
        const patterns: string[][] = [
            ["C4", "-", "C4", "-", "C4", "-", "C4", "-"],
            ["C4", "C4", "-", "C4", "-", "C4", "C4", "-"],
            ["C4", "-", "-", "C4", "C4", "-", "-", "C4"]
        ]
        const base = patterns[seededRandom(0, patterns.length - 1)]
        const hybrid = base.map(b => {
            if (seededRandom(0, 99) < 40) {
                return seededRandom(0, 1) === 0 ? "C4" : "-"
            }
            return b
        })

        for (let b of hybrid) {
            if (b == "C4") {
                showVisualizer(261.6)
                music.playTone(Note.C, music.beat(BeatFraction.Eighth))
            } else {
                pause(music.beat(BeatFraction.Eighth))
            }
        }
    }

    //% block="play full random song"
    export function playFullRandomSong(): void {
        noteLog = []
        randomizeInstrument()
        const minDuration = 12000
        const maxDuration = 120000
        const targetDuration = seededRandom(minDuration, maxDuration)
        let elapsed = 0

        const beatDurations = [125, 250, 375, 500, 750]
        const scale = currentKeyIsMajor ? majorScale : minorScale

        const patternLength = seededRandom(8, 16)
        const pattern: number[] = []
        for (let i = 0; i < patternLength; i++) {
            const octaveOffset = seededRandom(0, 4)
            const step = scale[seededRandom(0, scale.length - 1)] + 12 * octaveOffset
            pattern.push(step)
        }

        const baseFreq = 110

        while (elapsed < targetDuration) {
            const step = pattern[seededRandom(0, pattern.length - 1)]
            const freq = baseFreq * Math.pow(2, step / 12)
            const duration = beatDurations[seededRandom(0, beatDurations.length - 1)]

            noteLog.push(freq)
            showVisualizer(freq)

            const choice = seededRandom(0, 2)
            if (choice === 0) {
                music.play(music.createSoundEffect(
                    currentWave,
                    freq,
                    freq,
                    255,
                    0,
                    duration,
                    SoundExpressionEffect.None,
                    InterpolationCurve.Linear
                ), music.PlaybackMode.UntilDone)
            } else if (choice === 1) {
                playRandomRhythm()
            } else {
                playHybridBeat()
            }

            pause(duration)
            elapsed += duration
        }

        if (visualizerEnabled) {
            pause(500)
        }
    }
}