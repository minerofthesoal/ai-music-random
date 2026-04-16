# AI Music Random

Procedural music generator extension for **MakeCode Arcade**. Seeded melodies, chord progressions, drum grooves, basslines, and structured songs that always stay in key.

> Open this page at [https://minerofthesoal.github.io/ai-music-random/](https://minerofthesoal.github.io/ai-music-random/)

## Highlights

- **Seeded RNG** — every seed produces the same music, every time.
- **11 scales** — Major, Minor, Pentatonic, Blues, Dorian, Mixolydian, Lydian, Phrygian, Harmonic Minor, Whole Tone, Chromatic.
- **Mood presets** — one block configures scale, tempo, instrument, and feel.
- **Patterns** — melodies, chords, arpeggios, progressions, basslines, rhythms, call-and-response.
- **Drums** — individual hits and a generated 4-on-the-floor groove.
- **Songs** — named sections (Intro, Verse, Chorus, Bridge, Outro) and a full-song builder.
- **Feel** — Straight, Swing, Staccato, Legato.
- **Visualizers** — Bars, Wave, Rings, Rain.
- **Song codes** — encode every setting into a string you can share and reload.

## Quick start

```typescript
aiMusic.setSeed(42)
aiMusic.applyMood(aiMusic.Mood.Happy)
aiMusic.setVisualizer(aiMusic.Visualizer.Bars)
aiMusic.playFullSong()
```

## Block reference

### Setup
| Block | Description |
|-------|-------------|
| `set seed to [n]` | Set the random seed for reproducible output. |
| `random seed` | Generate a fresh seed and return it. |
| `set tempo to [n] bpm` | 40–240 BPM. |
| `set volume to [n]` | 0–255. |
| `set instrument to [wave]` | Triangle, Sawtooth, Square, Sine, Noise. |
| `set feel to [feel]` | Straight, Swing, Staccato, Legato. |

### Scale & Key
| Block | Description |
|-------|-------------|
| `set scale to [scale]` | Choose one of 11 scales. |
| `set root note to [hz] Hz` | Set the root pitch. |
| `transpose by [n] semitones` | Shift the root up or down. |
| `set octave shift to [n]` | −3 to +3. |
| `apply mood [mood]` | Preset for Happy, Sad, Epic, Calm, Spooky, Dreamy. |

### Notes & Patterns
| Block | Description |
|-------|-------------|
| `play random note` | One in-key note. |
| `play melody of [n] notes` | Stepwise melody with occasional leaps. |
| `play chord` | Three-note chord on a random degree. |
| `play arpeggio of [n] notes` | Broken chord across octaves. |
| `play chord progression` | One of 8 common progressions. |
| `play bassline of [n] notes` | Low sine following a progression. |
| `play rhythm of [n] beats` | Mixed rhythmic pattern with rests. |
| `play call and response` | High call, low resolving response. |

### Drums
| Block | Description |
|-------|-------------|
| `hit drum [kind]` | Kick, Snare, Hi-Hat, Tom, Cymbal. |
| `play drum groove of [n] beats` | Generated kick/snare/hat groove. |

### Songs
| Block | Description |
|-------|-------------|
| `play section [s]` | Intro, Verse, Chorus, Bridge, or Outro. |
| `play full song` | Intro → Verse → Chorus → Verse → Bridge → Chorus → Outro. |
| `play loop for [n] bars` | Repeating in-key pattern. |

### Visualizer
| Block | Description |
|-------|-------------|
| `set visualizer [v]` | Off, Bars, Wave, Rings, Rain. |

### Song Code
| Block | Description |
|-------|-------------|
| `get song code` | Encode current settings as a string. |
| `load song code [code]` | Restore settings from a code. |

## Use as Extension

This repository can be added as an **extension** in MakeCode.

* Open [https://arcade.makecode.com/](https://arcade.makecode.com/)
* Click on **New Project**
* Click on **Extensions** under the gearwheel menu
* Search for **https://github.com/minerofthesoal/ai-music-random** and import

## Edit this project

To edit this repository in MakeCode.

* Open [https://arcade.makecode.com/](https://arcade.makecode.com/)
* Click on **Import** then click on **Import URL**
* Paste **https://github.com/minerofthesoal/ai-music-random** and click import

#### Metadata (used for search, rendering)

* for PXT/arcade
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
