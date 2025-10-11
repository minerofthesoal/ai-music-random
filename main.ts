namespace randomMusic {
    let rngSeed = 1
    let currentKeyIsMajor = true
    let noteLog: number[] = []
    let currentWave: WaveShape = WaveShape.Sine

    const majorScale = [0, 2, 4, 5, 7, 9, 11]
    const minorScale = [0, 2, 3, 5, 7, 8, 10]
    const instrumentWaves: WaveShape[] = [
        WaveShape.Triangle,
        WaveShape.Sawtooth,
        WaveShape.Square,
        WaveShape.Sine,
        WaveShape.Noise
    ]

    const noteFrequencies: { [note: string]: number } = {
        "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.00,
        "A4": 440.00, "B4": 493.88, "C5": 523.25, "D5": 587.33, "E5": 659.25,
        "F5": 698.46, "G5": 783.99, "A5": 880.00, "B5": 987.77
    }

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

    function randomizeInstrument() {
        currentWave = instrumentWaves[seededRandom(0, instrumentWaves.length - 1)]
    }

    function getRandomNote(): number {
        const noteKeys = Object.keys(noteFrequencies)
        const selectedNote = noteKeys[seededRandom(0, noteKeys.length - 1)]
        return noteFrequencies[selectedNote]
    }

    //% block="play random sound effect"
    export function playRandomSound(): void {
        const freq = getRandomNote()
        const duration = seededRandom(100, 400)
        noteLog.push(freq)

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
    }

    //% block="play random rhythm sequence"
    export function playRandomRhythm(): void {
        const beatDurations = [100, 200, 300, 400]
        for (let i = 0; i < 4; i++) {
            playRandomSound()
            pause(beatDurations[seededRandom(0, beatDurations.length - 1)])
        }
    }

    //% block="play hybrid beat"
    export function playHybridBeat(): void {
        const patterns: string[][] = [
            ["C4", "-", "C4", "-", "C4", "-", "C4", "-"],
            ["C4", "D4", "-", "C4", "-", "E4", "C4", "-"],
            ["C4", "-", "-", "F4", "G4", "-", "-", "C4"]
        ]
        const base = patterns[seededRandom(0, patterns.length - 1)]
        const hybrid = base.map(b => {
            if (b === "-") {
                const keys = Object.keys(noteFrequencies)
                return seededRandom(0, 1) === 0 ? keys[seededRandom(0, keys.length - 1)] : "-"
            }
            return b
        })

        for (let b of hybrid) {
            if (b !== "-") {
                music.playTone(noteFrequencies[b], music.beat(BeatFraction.Eighth))
            } else {
                pause(music.beat(BeatFraction.Eighth))
            }
        }
    }

    //% block="play seeded fixed song"
    export function playSeededSong(): void {
        noteLog = []
        randomizeInstrument()

        const melodyNotes = ["C4", "E4", "G4", "A4", "F4", "E4", "D4", "C5"]
        const baseFreq = 110
        const scale = currentKeyIsMajor ? majorScale : minorScale

        for (let j = 0; j < melodyNotes.length; j++) {
            // Use seed to select the octave offset
            const octaveOffset = (rngSeed + j) % 2
            const noteName = melodyNotes[j]
            const freq2 = noteFrequencies[noteName] * Math.pow(2, octaveOffset)
            noteLog.push(freq2)

            music.play(music.createSoundEffect(
                currentWave,
                freq2,
                freq2,
                255,
                0,
                400,
                SoundExpressionEffect.None,
                InterpolationCurve.Linear
            ), music.PlaybackMode.UntilDone)
            pause(400)
        }
    }

    //% block="play chill ambient sequence"
    export function playAmbientSequence(): void {
        randomizeInstrument()
        for (let k = 0; k < 10; k++) {
            const freq3 = getRandomNote()
            music.play(music.createSoundEffect(
                currentWave,
                freq3,
                freq3,
                180,
                0,
                300 + seededRandom(0, 200),
                SoundExpressionEffect.None,
                InterpolationCurve.Curve
            ), music.PlaybackMode.UntilDone)
            pause(150 + seededRandom(0, 150))
        }
    }
}
