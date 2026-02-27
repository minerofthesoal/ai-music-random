// AI Music Random V3 — Test suite
// This file is not compiled when this package is used as an extension.

// ── Configuration ─────────────────────────────────────────────────────────────
aiMusic.setSeed(42)
aiMusic.setTempo(120)
aiMusic.setVolume(200)
aiMusic.setInstrument(WaveShape.Triangle)
aiMusic.setArticulation(aiMusic.Articulation.Normal)

// Test: random seed returns a positive number
const rs = aiMusic.randomSeed()
aiMusic.setSeed(rs)   // re-apply so tests are reproducible from here

// Test: clamping for tempo
aiMusic.setTempo(10)   // clamps to 40
aiMusic.setTempo(999)  // clamps to 240
aiMusic.setTempo(120)

// Test: clamping for volume
aiMusic.setVolume(-10) // clamps to 0
aiMusic.setVolume(500) // clamps to 255
aiMusic.setVolume(200)

// ── AI & Song Codes ───────────────────────────────────────────────────────────
aiMusic.setApiKey(aiMusic.AiService.LMStudio, "test-key")
aiMusic.setApiKey(aiMusic.AiService.OpenAI, "sk-test")
aiMusic.setApiKey(aiMusic.AiService.Anthropic, "ant-test")
aiMusic.setAiModel("gpt-4o")
aiMusic.setLMStudioUrl("http://localhost:1234/v1")

// Test: prompt parser sets scale/tempo/wave correctly
aiMusic.generateFromAI("happy fast synth music")
aiMusic.generateFromAI("slow sad piano ballad")
aiMusic.generateFromAI("mysterious eerie jazz")
aiMusic.generateFromAI("heroic epic guitar rock")
aiMusic.generateFromAI("dream ambient")

// Test: song code round-trip
aiMusic.setSeed(777)
aiMusic.setTempo(130)
aiMusic.setVolume(180)
aiMusic.setScale(aiMusic.Scale.Dorian)
aiMusic.setRootNote(294)
aiMusic.setInstrument(WaveShape.Sawtooth)
aiMusic.setArticulation(aiMusic.Articulation.Staccato)
aiMusic.setBaseOctave(1)
const code = aiMusic.getSongCode()
// Reset to different values, then reload
aiMusic.setSeed(1)
aiMusic.setTempo(90)
aiMusic.loadSongCode(code)   // should restore all settings above
aiMusic.loadSongCode("")     // invalid — silently ignored
aiMusic.loadSongCode("AIMSV3|bad") // too few parts — silently ignored

// ── Scales & Keys ─────────────────────────────────────────────────────────────
aiMusic.setRootNote(262)
aiMusic.setScale(aiMusic.Scale.Major)
aiMusic.setScale(aiMusic.Scale.Minor)
aiMusic.setScale(aiMusic.Scale.Pentatonic)
aiMusic.setScale(aiMusic.Scale.Blues)
aiMusic.setScale(aiMusic.Scale.Dorian)
aiMusic.setScale(aiMusic.Scale.Mixolydian)
aiMusic.setScale(aiMusic.Scale.Lydian)
aiMusic.setScale(aiMusic.Scale.Phrygian)
aiMusic.setScale(aiMusic.Scale.Locrian)
aiMusic.setScale(aiMusic.Scale.HarmonicMinor)
aiMusic.setScale(aiMusic.Scale.WholeTone)
aiMusic.setScale(aiMusic.Scale.Major) // reset

aiMusic.transposeBy(0)    // identity
aiMusic.transposeBy(7)    // up a fifth
aiMusic.transposeBy(-7)   // back down
aiMusic.setRootNote(262)  // restore

aiMusic.setBaseOctave(0)
aiMusic.setBaseOctave(2)
aiMusic.setBaseOctave(-2)
aiMusic.setBaseOctave(0)

// ── Playback (fast tempo for quick tests) ────────────────────────────────────
aiMusic.setSeed(1)
aiMusic.setTempo(200)
aiMusic.setVolume(200)
aiMusic.setScale(aiMusic.Scale.Major)
aiMusic.setInstrument(WaveShape.Triangle)
aiMusic.setArticulation(aiMusic.Articulation.Normal)

aiMusic.playRandomNote()
aiMusic.playRandomMelody(4)
aiMusic.playRandomChord()
aiMusic.playArpeggio(4)
aiMusic.playRandomRhythm(4)
aiMusic.playChordProgression()
aiMusic.playRandomSfx()
aiMusic.playBassline(4)
aiMusic.playFanfare()
aiMusic.playAmbient(2)
aiMusic.playCallAndResponse(4)
aiMusic.playRandomSolo(4)

// Test: articulation variants
aiMusic.setArticulation(aiMusic.Articulation.Staccato)
aiMusic.playRandomMelody(2)
aiMusic.setArticulation(aiMusic.Articulation.Legato)
aiMusic.playRandomMelody(2)
aiMusic.setArticulation(aiMusic.Articulation.Accent)
aiMusic.playRandomNote()
aiMusic.setArticulation(aiMusic.Articulation.Normal)

// ── Percussion ────────────────────────────────────────────────────────────────
aiMusic.playDrumPattern(4)
aiMusic.playPercHit()

// ── Song Generation ───────────────────────────────────────────────────────────
aiMusic.setSeed(1)
aiMusic.setTempo(240)  // maximum speed for test pass

aiMusic.playSongSection(aiMusic.SongSection.Intro)
aiMusic.playSongSection(aiMusic.SongSection.Verse)
aiMusic.playSongSection(aiMusic.SongSection.Chorus)
aiMusic.playSongSection(aiMusic.SongSection.Bridge)
aiMusic.playSongSection(aiMusic.SongSection.Outro)

aiMusic.playRandomLoop(1)

// Test: composeSong styles (1-bar snippets each, 240 BPM)
aiMusic.setTempo(240)
aiMusic.composeSong(aiMusic.SongStyle.Upbeat)
aiMusic.setTempo(240)
aiMusic.composeSong(aiMusic.SongStyle.Sad)
aiMusic.setTempo(240)
aiMusic.composeSong(aiMusic.SongStyle.Epic)
aiMusic.setTempo(240)
aiMusic.composeSong(aiMusic.SongStyle.Calm)
aiMusic.setTempo(240)
aiMusic.composeSong(aiMusic.SongStyle.Mysterious)
aiMusic.setTempo(240)
aiMusic.composeSong(aiMusic.SongStyle.Heroic)
aiMusic.setTempo(240)
aiMusic.composeSong(aiMusic.SongStyle.Ambient)
aiMusic.setTempo(240)
aiMusic.composeSong(aiMusic.SongStyle.Default)

// ── Visualizer ────────────────────────────────────────────────────────────────
aiMusic.enableVisualizer(true)

aiMusic.setVisualizerStyle(aiMusic.VisualizerStyle.Bars)
aiMusic.setVisualizerStyle(aiMusic.VisualizerStyle.Wave)
aiMusic.setVisualizerStyle(aiMusic.VisualizerStyle.Particles)
aiMusic.setVisualizerStyle(aiMusic.VisualizerStyle.Spectrum)
aiMusic.setVisualizerStyle(aiMusic.VisualizerStyle.Matrix)
aiMusic.setVisualizerStyle(aiMusic.VisualizerStyle.Circle)
aiMusic.setVisualizerStyle(aiMusic.VisualizerStyle.Bounce)
aiMusic.setVisualizerStyle(aiMusic.VisualizerStyle.Spiral)

aiMusic.setVisualizerColor(aiMusic.VizColor.Rainbow)
aiMusic.setVisualizerColor(aiMusic.VizColor.Warm)
aiMusic.setVisualizerColor(aiMusic.VizColor.Cool)
aiMusic.setVisualizerColor(aiMusic.VizColor.Mono)

aiMusic.vizPulse(440)
aiMusic.vizPulse(880)
aiMusic.vizPulse(220)

aiMusic.clearVisualizer()
aiMusic.enableVisualizer(false)

// ── Reproducibility ───────────────────────────────────────────────────────────
aiMusic.setSeed(123)
aiMusic.setScale(aiMusic.Scale.Pentatonic)
aiMusic.setTempo(200)
aiMusic.playRandomNote()
aiMusic.playRandomNote()
