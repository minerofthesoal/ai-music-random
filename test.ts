// AI Music Random — test harness.
// Not compiled when this package is imported as an extension.

// ─── Setup ────────────────────────────────────────────────────────────────
aiMusic.setSeed(42)
aiMusic.setTempo(200)        // fast for quick test passes
aiMusic.setVolume(180)
aiMusic.setInstrument(WaveShape.Triangle)
aiMusic.setFeel(aiMusic.Feel.Straight)

// Clamping checks
aiMusic.setTempo(10)         // → 40
aiMusic.setTempo(999)        // → 240
aiMusic.setTempo(200)
aiMusic.setVolume(-50)       // → 0
aiMusic.setVolume(500)       // → 255
aiMusic.setVolume(180)

// Random seed returns a positive number
const fresh = aiMusic.randomSeed()
aiMusic.setSeed(fresh)
aiMusic.setSeed(0)           // 0 should normalise to 1
aiMusic.setSeed(42)

// ─── Scale & Key ──────────────────────────────────────────────────────────
aiMusic.setRoot(262)
aiMusic.setScale(aiMusic.Scale.Major)
aiMusic.setScale(aiMusic.Scale.Minor)
aiMusic.setScale(aiMusic.Scale.Pentatonic)
aiMusic.setScale(aiMusic.Scale.Blues)
aiMusic.setScale(aiMusic.Scale.Dorian)
aiMusic.setScale(aiMusic.Scale.Mixolydian)
aiMusic.setScale(aiMusic.Scale.Lydian)
aiMusic.setScale(aiMusic.Scale.Phrygian)
aiMusic.setScale(aiMusic.Scale.HarmonicMinor)
aiMusic.setScale(aiMusic.Scale.WholeTone)
aiMusic.setScale(aiMusic.Scale.Chromatic)
aiMusic.setScale(aiMusic.Scale.Major)

aiMusic.transpose(7)
aiMusic.transpose(-7)
aiMusic.setRoot(262)

aiMusic.setOctave(2)
aiMusic.setOctave(-2)
aiMusic.setOctave(0)

aiMusic.applyMood(aiMusic.Mood.Happy)
aiMusic.applyMood(aiMusic.Mood.Sad)
aiMusic.applyMood(aiMusic.Mood.Epic)
aiMusic.applyMood(aiMusic.Mood.Calm)
aiMusic.applyMood(aiMusic.Mood.Spooky)
aiMusic.applyMood(aiMusic.Mood.Dreamy)

// Reset to known state for playback
aiMusic.setScale(aiMusic.Scale.Major)
aiMusic.setTempo(240)

// ─── Notes & patterns ─────────────────────────────────────────────────────
aiMusic.playNote()
aiMusic.playMelody(4)
aiMusic.playRandomChord()
aiMusic.playArpeggio(4)
aiMusic.playProgression()
aiMusic.playBassline(4)
aiMusic.playRhythm(4)
aiMusic.playCallResponse()

// Feel variants
aiMusic.setFeel(aiMusic.Feel.Staccato)
aiMusic.playMelody(2)
aiMusic.setFeel(aiMusic.Feel.Legato)
aiMusic.playMelody(2)
aiMusic.setFeel(aiMusic.Feel.Swing)
aiMusic.playMelody(2)
aiMusic.setFeel(aiMusic.Feel.Straight)

// ─── Drums ────────────────────────────────────────────────────────────────
aiMusic.hitDrum(aiMusic.Drum.Kick)
aiMusic.hitDrum(aiMusic.Drum.Snare)
aiMusic.hitDrum(aiMusic.Drum.HiHat)
aiMusic.hitDrum(aiMusic.Drum.Tom)
aiMusic.hitDrum(aiMusic.Drum.Cymbal)
aiMusic.playGroove(4)

// ─── Songs ────────────────────────────────────────────────────────────────
aiMusic.playSection(aiMusic.Section.Intro)
aiMusic.playSection(aiMusic.Section.Verse)
aiMusic.playSection(aiMusic.Section.Chorus)
aiMusic.playSection(aiMusic.Section.Bridge)
aiMusic.playSection(aiMusic.Section.Outro)
aiMusic.playLoop(1)

// ─── Visualizer ───────────────────────────────────────────────────────────
aiMusic.setVisualizer(aiMusic.Visualizer.Bars)
aiMusic.playMelody(4)
aiMusic.setVisualizer(aiMusic.Visualizer.Wave)
aiMusic.playMelody(4)
aiMusic.setVisualizer(aiMusic.Visualizer.Rings)
aiMusic.playMelody(4)
aiMusic.setVisualizer(aiMusic.Visualizer.Rain)
aiMusic.playMelody(4)
aiMusic.setVisualizer(aiMusic.Visualizer.Off)

// ─── Song Code round trip ────────────────────────────────────────────────
aiMusic.setSeed(777)
aiMusic.setTempo(140)
aiMusic.setScale(aiMusic.Scale.Dorian)
aiMusic.setOctave(1)
const code = aiMusic.getSongCode()
aiMusic.setSeed(1)
aiMusic.setTempo(60)
aiMusic.loadSongCode(code)        // restore
aiMusic.loadSongCode("")          // ignore
aiMusic.loadSongCode("garbage")   // ignore
aiMusic.loadSongCode("AIM4:bad")  // ignore (too few parts)
