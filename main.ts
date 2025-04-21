namespace randomMusic {
    let rngSeed = 1
    let currentKeyIsMajor = true
    let noteLog: number[] = []

    const majorScale = [0, 2, 4, 5, 7, 9, 11]
    const minorScale = [0, 2, 3, 5, 7, 8, 10]

    /**
     * Set the seed for music generation
     */
    //% block="set music seed to %seed"
    export function setMusicSeed(seed: number): void {
        rngSeed = seed
    }

    // Basic seeded PRNG
    function seededRandom(min: number, max: number): number {
        rngSeed = (rngSeed * 16807) % 2147483647
        return min + (rngSeed % (max - min + 1))
    }

    /**
     * Set major or minor key
     */
    //% block="set music key to major %isMajor"
    //% isMajor.shadow="toggleOnOff"
    export function setMusicKey(isMajor: boolean): void {
        currentKeyIsMajor = isMajor
    }

    function getScaleNote(): number {
        const scale = currentKeyIsMajor ? majorScale : minorScale
        const base = 220
        const step = scale[seededRandom(0, scale.length - 1)]
        return base * Math.pow(2, step / 12)
    }

    /**
     * Play a random sound effect
     */
    //% block="play random sound effect"
    export function playRandomSound(): void {
        const freqStart = getScaleNote()
        const freqEnd = getScaleNote()
        const duration = seededRandom(100, 300)

        noteLog.push(freqStart)

        music.play(music.createSoundEffect(
            WaveShape.Sine,
            freqStart,
            freqEnd,
            255,
            0,
            duration,
            SoundExpressionEffect.None,
            InterpolationCurve.Linear
        ), music.PlaybackMode.UntilDone)
    }

    /**
     * Play a rhythm of random notes
     */
    //% block="play random rhythm sequence"
    export function playRandomRhythm(): void {
        const beatDurations = [100, 200, 300]
        for (let i = 0; i < 8; i++) {
            playRandomSound()
            pause(beatDurations[seededRandom(0, beatDurations.length - 1)])
        }
    }

    /**
     * Play a hybrid beat combining presets and random variations
     */
    //% block="play hybrid beat"
    export function playHybridBeat(): void {
        const patterns: string[][] = [
            ["C4", "-", "C4", "-", "C4", "-", "C4", "-"],
            ["C4", "C4", "-", "C4", "-", "C4", "C4", "-"],
            ["C4", "-", "-", "C4", "C4", "-", "-", "C4"]
        ]
        const base2 = patterns[seededRandom(0, patterns.length - 1)]
        const hybrid = base2.map(b => {
            if (seededRandom(0, 99) < 30) {
                return seededRandom(0, 1) === 0 ? "C4" : "-"
            }
            return b
        })

        for (let b of hybrid) {
            if (b == "C4") {
                music.playTone(Note.C, music.beat(BeatFraction.Eighth))
            } else {
                pause(music.beat(BeatFraction.Eighth))
            }
        }
    }

    /**
     * Play a full random song between 12s and 2m using patterns and beat
     */
    //% block="play full random song"
    export function playFullRandomSong(): void {
        noteLog = []
        const beatDurations2 = [250, 350, 500]
        const minDuration = 12000
        const maxDuration = 120000
        const targetDuration = seededRandom(minDuration, maxDuration)
        let elapsed = 0

        const pattern: number[] = []
        const patternLength = seededRandom(3, 6)
        const scale2 = currentKeyIsMajor ? majorScale : minorScale
        for (let j = 0; j < patternLength; j++) {
            pattern.push(scale2[seededRandom(0, scale2.length - 1)])
        }

        const baseFreq = 220

        while (elapsed < targetDuration) {
            const patternStep = pattern[elapsed % pattern.length]
            const freq = baseFreq * Math.pow(2, patternStep / 12)
            const duration2 = beatDurations2[seededRandom(0, beatDurations2.length - 1)]

            noteLog.push(freq)

            music.play(music.createSoundEffect(
                WaveShape.Sine,
                freq,
                freq,
                255,
                0,
                duration2,
                SoundExpressionEffect.None,
                InterpolationCurve.Linear
            ), music.PlaybackMode.UntilDone)

            playHybridBeat()
            pause(duration2)
            elapsed += duration2
        }
    }
}
