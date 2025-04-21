namespace randomMusic {
    let rngSeed = 1
    let currentKeyIsMajor = true
    let noteLog: number[] = []
    let currentWave: WaveShape = WaveShape.Sine
    let visualizerEnabled = false

    const majorScale = [0, 2, 4, 5, 7, 9, 11]
    const minorScale = [0, 2, 3, 5, 7, 8, 10]

    const instrumentWaves: WaveShape[] = [
        WaveShape.Triangle, // Piano
        WaveShape.Sawtooth, // Bass/Strings
        WaveShape.Square,   // Guitar-ish
        WaveShape.Sine,     // Strings
        WaveShape.Noise     // Drums
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

    function randomizeInstrument() {
        currentWave = instrumentWaves[seededRandom(0, instrumentWaves.length - 1)]
    }

    function getScaleNote(): number {
        const scale = currentKeyIsMajor ? majorScale : minorScale
        const base = 110
        const octaveOffset = seededRandom(0, 4)
        const step = scale[seededRandom(0, scale.length - 1)] + 12 * octaveOffset
        return base * Math.pow(2, step / 12)
    }

    function showVisualizer(freq: number) {
        if (!visualizerEnabled) return
        let barHeight = Math.clamp(5, 60, Math.map(freq, 110, 2000, 5, 60))
        let barX = seededRandom(0, 120)
        let col = Math.randomRange(1, 15)
        screen.fillRect(barX, 60 - barHeight, 3, barHeight, col)
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
        const base2 = patterns[seededRandom(0, patterns.length - 1)]
        const hybrid = base2.map(b => {
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

        screen.fill(0) // clear screen for visualizer

        const minDuration = 12000
        const maxDuration = 120000
        const targetDuration = seededRandom(minDuration, maxDuration)
        let elapsed = 0

        const beatDurations2 = [125, 250, 375, 500, 750]
        const scale2 = currentKeyIsMajor ? majorScale : minorScale

        const patternLength = seededRandom(8, 16)
        const pattern: number[] = []
        for (let j = 0; j < patternLength; j++) {
            const octaveOffset2 = seededRandom(0, 4)
            const step2 = scale2[seededRandom(0, scale2.length - 1)] + 12 * octaveOffset2
            pattern.push(step2)
        }

        const baseFreq = 110

        while (elapsed < targetDuration) {
            const step3 = pattern[seededRandom(0, pattern.length - 1)]
            const freq = baseFreq * Math.pow(2, step3 / 12)
            const duration2 = beatDurations2[seededRandom(0, beatDurations2.length - 1)]

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
                    duration2,
                    SoundExpressionEffect.None,
                    InterpolationCurve.Linear
                ), music.PlaybackMode.UntilDone)
            } else if (choice === 1) {
                playRandomRhythm()
            } else {
                playHybridBeat()
            }

            pause(duration2)
            elapsed += duration2
        }

        if (visualizerEnabled) {
            pause(1000)
            screen.fill(0)
        }
    }
}
