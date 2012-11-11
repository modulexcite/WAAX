WAAX
====
*Web Audio API eXtension for Modern Browsers (Chrome/Safari/FireFox)*

WAAX is an experimental javascript framework for [Web Audio API][1] incorporated in the modern browsers such as Chrome, Safari and FireFox. With music/sound creation in mind, it is designed to provide users with higher level of musical control: complex real-time sound synthesis, ready-made instruments, even a timebase system for sophisticated structure.

The goal of this project is to make web audio programming more approachable by expanding the audio domain with new web technologies that make the browser user-centered, highly-visualized and ever-connected. Also the library is strongly inspired by THREE.js, which is one of WebGL JavaScript library being used most in the scene, and hopefully it can be a sonic counterpart in the web-based audiovisual system.

In addition to core technology, the library comes with an interactive web-based IDE for rapid experiment and deployment. It allows users to perform JavaScript audio progoramming and export the code snippet for other web projects.

The author of this library is Hongchan Choi at [CCRMA][2], Stanford University.

[1]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html "Web Audio API: W3C Editor's Draft"
[2]: https://ccrma.stanford.edu/ "The Center for Computer Research in Music and Acoustics"

Layers
------
Node - Unit - Block - Module
* Transport
* Data Structure
* Visualization


Connections
-----------
Node -> Unit (semi WX connection)     "connect(Unit.node)" call
Unit -> Node (semi-web audio api)     "connect" method
Unit -> Unit (pure WAAX connection)   "to" method
Node -> Node (pure web audio api)     "connect" method

Unit -> Block
Block -> Block
Block -> Unit

block should have unit(input/output)
then all the connection will be between units





Structure
---------
WAAX.js

Utilities.js
  random2(), random2f(), scale(), db2rms(), 
  midi2freq(), freq2midi()

/Units
  <Gen>
  Oscillator(), FMOperator(), Wavetable(), SampleBuffer(),
  ADSR(), EnvelopeFollower(),
  <Efx>
  Delay(), Filter(), Reverb(), Compressor(), Waveshaper()

/Blocks
  <Synth>
  Osc2(), Osc3(), FM3(), FM7(), WaveTab3(), Samplex()  
  <Processor>
  ResonZ(), LPF(), HPF(), EQ3(), EQ5(), EQ7(), 
  StereoDelay(), Chorus(), Flanger(),
  ConVerb(), NVerb(), 
  QuadComp(), Limiter(), Gate(), DeEsser(),
  Enhancer(), Exciter(), Overdrive(), Vinyl()
  
/Modules
  SynaMon()
  FMOne()
  Xpler

/Timebase
  Clip()


Milestone
---------
(1.5 week)
BB & Preset: Oscillator() -> Osc2()
BB & Preset: Filter() -> ResonZ(), HPF()
BB: Envelope() -> Fader for OSC2
BB: Envelope() -> Filter
BB & Preset: Delay() -> StereoDelay()
Instrument: SynaMon()
time-base

Questions
---------
1) does offlineAudioContext exist in current implementation?
2) why does "stop()" method irreversible? is this to save resources as well?

