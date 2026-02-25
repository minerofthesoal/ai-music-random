# AI Music Random

A procedural music generator extension for MakeCode Arcade. Generate melodies, chord progressions, rhythms, arpeggios, and full structured songs — all from seeded randomness constrained to real musical scales.

> Open this page at [https://minerofthesoal.github.io/ai-music-random/](https://minerofthesoal.github.io/ai-music-random/)

## Features

- **6 Musical Scales** — Major, Minor, Pentatonic, Blues, Dorian, Mixolydian
- **Chord Progressions** — Common progressions (I-IV-V-I, I-V-vi-IV, etc.)
- **Melody Generation** — Stepwise motion with occasional leaps for natural-sounding melodies
- **Arpeggios** — Broken chord patterns across octaves
- **Rhythms** — Varied beat patterns with rests and accents
- **Full Song Generation** — Structured songs with Intro, Verse, Chorus, Bridge, and Outro
- **Loop Mode** — Generate repeating musical patterns
- **Sound Effects** — Random SFX with vibrato, tremolo, and warble
- **4 Visualizer Styles** — Bars, Wave, Particles, Spectrum
- **Seeded RNG** — Reproducible music from any seed
- **Tempo & Volume Control** — 40-240 BPM, full volume range
- **5 Instruments** — Triangle, Sawtooth, Square, Sine, Noise

## Blocks

### Configuration
| Block | Description |
|-------|-------------|
| `set seed to [n]` | Set the random seed for reproducible output |
| `set tempo to [n] bpm` | Set playback speed (40-240 BPM) |
| `set volume to [n]` | Set volume (0-255) |
| `set instrument to [wave]` | Choose waveform (Triangle, Sawtooth, Square, Sine, Noise) |

### Scales & Keys
| Block | Description |
|-------|-------------|
| `set root note to [n] Hz` | Set the root frequency |
| `set scale to [scale]` | Choose scale (Major, Minor, Pentatonic, Blues, Dorian, Mixolydian) |

### Playback
| Block | Description |
|-------|-------------|
| `play random note` | Play a single random note from the current scale |
| `play random melody` | Generate a melody with stepwise motion |
| `play random chord` | Play a three-note chord from the scale |
| `play arpeggio` | Play broken chord tones ascending through octaves |
| `play random rhythm` | Play a rhythmic pattern with rests and accents |
| `play chord progression` | Play a common chord progression |
| `play random sound effect` | Generate a random SFX with effects |

### Song Generation
| Block | Description |
|-------|-------------|
| `play full random song` | Generate a structured song (Intro → Verse → Chorus → Verse → Bridge → Chorus → Outro) |
| `play random loop` | Generate a looping musical pattern |

### Visualizer
| Block | Description |
|-------|-------------|
| `enable visualizer [on/off]` | Toggle visual feedback |
| `set visualizer style to [style]` | Choose style (Bars, Wave, Particles, Spectrum) |

## Example Usage

```typescript
aiMusic.setSeed(42)
aiMusic.setScale(aiMusic.Scale.Pentatonic)
aiMusic.setTempo(120)
aiMusic.setInstrument(WaveShape.Triangle)
aiMusic.enableVisualizer(true)
aiMusic.setVisualizerStyle(aiMusic.VisualizerStyle.Bars)
aiMusic.playFullSong()
```

## Use as Extension

This repository can be added as an **extension** in MakeCode.

* open [https://arcade.makecode.com/](https://arcade.makecode.com/)
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for **https://github.com/minerofthesoal/ai-music-random** and import

## Edit this project

To edit this repository in MakeCode.

* open [https://arcade.makecode.com/](https://arcade.makecode.com/)
* click on **Import** then click on **Import URL**
* paste **https://github.com/minerofthesoal/ai-music-random** and click import

#### Metadata (used for search, rendering)

* for PXT/arcade
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
