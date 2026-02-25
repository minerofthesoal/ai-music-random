// AI Music Random — Tests
// This file is not compiled when this package is used as an extension.

// Test: Basic configuration does not throw
aiMusic.setSeed(42)
aiMusic.setTempo(120)
aiMusic.setVolume(200)
aiMusic.setInstrument(WaveShape.Triangle)
aiMusic.setRootNote(262)
aiMusic.setScale(aiMusic.Scale.Major)
aiMusic.enableVisualizer(false)
aiMusic.setVisualizerStyle(aiMusic.VisualizerStyle.Bars)

// Test: Clamping works for tempo
aiMusic.setTempo(10)   // should clamp to 40
aiMusic.setTempo(999)  // should clamp to 240
aiMusic.setTempo(120)  // reset

// Test: Clamping works for volume
aiMusic.setVolume(-10)  // should clamp to 0
aiMusic.setVolume(500)  // should clamp to 255
aiMusic.setVolume(200)  // reset

// Test: All scales can be set
aiMusic.setScale(aiMusic.Scale.Major)
aiMusic.setScale(aiMusic.Scale.Minor)
aiMusic.setScale(aiMusic.Scale.Pentatonic)
aiMusic.setScale(aiMusic.Scale.Blues)
aiMusic.setScale(aiMusic.Scale.Dorian)
aiMusic.setScale(aiMusic.Scale.Mixolydian)

// Test: All visualizer styles can be set
aiMusic.setVisualizerStyle(aiMusic.VisualizerStyle.Bars)
aiMusic.setVisualizerStyle(aiMusic.VisualizerStyle.Wave)
aiMusic.setVisualizerStyle(aiMusic.VisualizerStyle.Particles)
aiMusic.setVisualizerStyle(aiMusic.VisualizerStyle.Spectrum)

// Test: Seed reproducibility — same seed should produce same output
aiMusic.setSeed(123)
aiMusic.setScale(aiMusic.Scale.Pentatonic)
aiMusic.playRandomNote()

// Test: Playback functions run without error
aiMusic.setSeed(1)
aiMusic.setTempo(200)  // Fast tempo for quicker tests
aiMusic.playRandomNote()
aiMusic.playRandomMelody(4)
aiMusic.playRandomChord()
aiMusic.playArpeggio(4)
aiMusic.playRandomRhythm(4)
aiMusic.playChordProgression()
aiMusic.playRandomSfx()
aiMusic.playRandomLoop(1)
