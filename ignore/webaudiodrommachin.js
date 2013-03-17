//webaudiodrommachin.js

<!--
Copyright 2011, Google Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

    * Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above
copyright notice, this list of conditions and the following disclaimer
in the documentation and/or other materials provided with the
distribution.
    * Neither the name of Google Inc. nor the names of its
contributors may be used to endorse or promote products derived from
this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
-->

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
  "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<meta name="description" content="Create custom drum beats with a few clicks.  Choose from 15 drum kits and 26 effects, and adjust the pitch of each drum.  Save and share your beats… rock on!">
<title>WebAudio Drum Machine</title>

<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Michroma">
<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Droid Sans">
<link rel="stylesheet" type="text/css" href = "style/drummachine.css" />


<!-- Our javascript code -->
<script type="text/javascript">

// Events
// init() once the page has finished loading.
window.onload = init;

var context;
var convolver;
var compressor;
var masterGainNode;
var effectLevelNode;

// Each effect impulse response has a specific overall desired dry and wet volume.
// For example in the telephone filter, it's necessary to make the dry volume 0 to correctly hear the effect.
var effectDryMix = 1.0;
var effectWetMix = 1.0;

var timeoutId;

var startTime;
var lastDrawTime = -1;

var kits;

var kNumInstruments = 6;
var kInitialKitIndex = 10;
var kMaxSwing = .08;

var currentKit;

var beatReset = {"kitIndex":0,"effectIndex":0,"tempo":100,"swingFactor":0,"effectMix":0.25,"kickPitchVal":0.5,"snarePitchVal":0.5,"hihatPitchVal":0.5,"tom1PitchVal":0.5,"tom2PitchVal":0.5,"tom3PitchVal":0.5,"rhythm1":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm2":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm3":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm4":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm5":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm6":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]};
var beatDemo = [
    {"kitIndex":13,"effectIndex":18,"tempo":120,"swingFactor":0,"effectMix":0.19718309859154926,"kickPitchVal":0.5,"snarePitchVal":0.5,"hihatPitchVal":0.5,"tom1PitchVal":0.5,"tom2PitchVal":0.5,"tom3PitchVal":0.5,"rhythm1":[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm2":[0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0],"rhythm3":[0,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0],"rhythm4":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0],"rhythm5":[0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm6":[0,0,0,0,0,0,0,2,0,2,2,0,0,0,0,0]},
    {"kitIndex":4,"effectIndex":3,"tempo":100,"swingFactor":0,"effectMix":0.2,"kickPitchVal":0.46478873239436624,"snarePitchVal":0.45070422535211263,"hihatPitchVal":0.15492957746478875,"tom1PitchVal":0.7183098591549295,"tom2PitchVal":0.704225352112676,"tom3PitchVal":0.8028169014084507,"rhythm1":[2,1,0,0,0,0,0,0,2,1,2,1,0,0,0,0],"rhythm2":[0,0,0,0,2,0,0,0,0,1,1,0,2,0,0,0],"rhythm3":[0,1,2,1,0,1,2,1,0,1,2,1,0,1,2,1],"rhythm4":[0,0,0,0,0,0,2,1,0,0,0,0,0,0,0,0],"rhythm5":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0],"rhythm6":[0,0,0,0,0,0,0,2,1,2,1,0,0,0,0,0]},
    {"kitIndex":2,"effectIndex":5,"tempo":100,"swingFactor":0,"effectMix":0.25,"kickPitchVal":0.5,"snarePitchVal":0.5,"hihatPitchVal":0.5211267605633803,"tom1PitchVal":0.23943661971830987,"tom2PitchVal":0.21126760563380287,"tom3PitchVal":0.2535211267605634,"rhythm1":[2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0],"rhythm2":[0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0],"rhythm3":[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],"rhythm4":[1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],"rhythm5":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0],"rhythm6":[0,0,1,0,1,0,0,2,0,2,0,0,1,0,0,0]},
    {"kitIndex":1,"effectIndex":4,"tempo":120,"swingFactor":0,"effectMix":0.25,"kickPitchVal":0.7887323943661972,"snarePitchVal":0.49295774647887325,"hihatPitchVal":0.5,"tom1PitchVal":0.323943661971831,"tom2PitchVal":0.3943661971830986,"tom3PitchVal":0.323943661971831,"rhythm1":[2,0,0,0,0,0,0,2,2,0,0,0,0,0,0,1],"rhythm2":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm3":[0,0,1,0,2,0,1,0,1,0,1,0,2,0,2,0],"rhythm4":[2,0,2,0,0,0,0,0,2,0,0,0,0,2,0,0],"rhythm5":[0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm6":[0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,0]},
    {"kitIndex":0,"effectIndex":1,"tempo":60,"swingFactor":0.5419847328244275,"effectMix":0.25,"kickPitchVal":0.5,"snarePitchVal":0.5,"hihatPitchVal":0.5,"tom1PitchVal":0.5,"tom2PitchVal":0.5,"tom3PitchVal":0.5,"rhythm1":[2,2,0,1,2,2,0,1,2,2,0,1,2,2,0,1],"rhythm2":[0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0],"rhythm3":[2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,1],"rhythm4":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"rhythm5":[0,0,1,0,0,1,0,1,0,0,1,0,0,0,1,0],"rhythm6":[1,0,0,1,0,1,0,1,1,0,0,1,1,1,1,0]},
];

function cloneBeat(source) {
    var beat = new Object();
    
    beat.kitIndex = source.kitIndex;
    beat.effectIndex = source.effectIndex;
    beat.tempo = source.tempo;
    beat.swingFactor = source.swingFactor;
    beat.effectMix = source.effectMix;
    beat.kickPitchVal = source.kickPitchVal;
    beat.snarePitchVal = source.snarePitchVal;
    beat.hihatPitchVal = source.hihatPitchVal;
    beat.tom1PitchVal = source.tom1PitchVal;
    beat.tom2PitchVal = source.tom2PitchVal;
    beat.tom3PitchVal = source.tom3PitchVal;
    beat.rhythm1 = source.rhythm1.slice(0);        // slice(0) is an easy way to copy the full array
    beat.rhythm2 = source.rhythm2.slice(0);
    beat.rhythm3 = source.rhythm3.slice(0);
    beat.rhythm4 = source.rhythm4.slice(0);
    beat.rhythm5 = source.rhythm5.slice(0);
    beat.rhythm6 = source.rhythm6.slice(0);
    
    return beat;
}

// theBeat is the object representing the current beat/groove
// ... it is saved/loaded via JSON
var theBeat = cloneBeat(beatReset);

kickPitch = snarePitch = hihatPitch = tom1Pitch = tom2Pitch = tom3Pitch = 0;

var mouseCapture = null;
var mouseCaptureOffset = 0;

var loopLength = 16;
var rhythmIndex = 0;
var kMinTempo = 50;
var kMaxTempo = 180;
var noteTime = 0.0;

var instruments = ['Kick', 'Snare', 'HiHat', 'Tom1', 'Tom2', 'Tom3'];

var volumes = [0, 0.3, 1];

var kitCount = 0;

var kitName = [
    "R8",
    "CR78",
    "KPR77",
    "LINN",
    "Kit3",
    "Kit8",
    "Techno",
    "Stark",
    "breakbeat8",
    "breakbeat9",
    "breakbeat13",
    "acoustic-kit",
    "4OP-FM",
    "TheCheebacabra1",
    "TheCheebacabra2"
    ];

var kitNamePretty = [
    "Roland R-8",
    "Roland CR-78",
    "Korg KPR-77",
    "LinnDrum",
    "Kit 3",
    "Kit 8",
    "Techno",
    "Stark",
    "Breakbeat 8",
    "Breakbeat 9",
    "Breakbeat 13",
    "Acoustic Kit",
    "4OP-FM",
    "The Cheebacabra 1",
    "The Cheebacabra 2"
    ];

function Kit(name) {
    this.name = name;

    this.pathName = function() {
        var pathName = "sounds/drum-samples/" + this.name + "/";
        return pathName;
    };

    this.kickBuffer = 0;
    this.snareBuffer = 0;
    this.hihatBuffer = 0;

    this.instrumentCount = kNumInstruments;
    this.instrumentLoadCount = 0;
    
    this.startedLoading = false;
    this.isLoaded = false;
    
    this.demoIndex = -1;
}

Kit.prototype.setDemoIndex = function(index) {
    this.demoIndex = index;
}

Kit.prototype.load = function() {
    if (this.startedLoading)
        return;
        
    this.startedLoading = true;
        
    var pathName = this.pathName();

    var kickPath = pathName + "kick.wav";
    var snarePath = pathName + "snare.wav";
    var hihatPath = pathName + "hihat.wav";
    var tom1Path = pathName + "tom1.wav";
    var tom2Path = pathName + "tom2.wav";
    var tom3Path = pathName + "tom3.wav";

    this.loadSample(0, kickPath, false);
    this.loadSample(1, snarePath, false);
    this.loadSample(2, hihatPath, true);  // we're panning only the hihat
    this.loadSample(3, tom1Path, false);
    this.loadSample(4, tom2Path, false);
    this.loadSample(5, tom3Path, false);
}

Kit.prototype.loadSample = function(sampleID, url, mixToMono) {
    // Load asynchronously

    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var kit = this;

    request.onload = function() {
        var buffer = context.createBuffer(request.response, mixToMono);
        switch (sampleID) {
            case 0: kit.kickBuffer = buffer; break;
            case 1: kit.snareBuffer = buffer; break;
            case 2: kit.hihatBuffer = buffer; break;
            case 3: kit.tom1 = buffer; break;
            case 4: kit.tom2 = buffer; break;
            case 5: kit.tom3 = buffer; break;
        }

        kit.instrumentLoadCount++;
        if (kit.instrumentLoadCount == kit.instrumentCount) {
            kit.isLoaded = true;

            if (kit.demoIndex != -1) {
                beatDemo[kit.demoIndex].setKitLoaded();
            }
        }
    }

    request.send();
}

var impulseResponseInfoList = [
    // Impulse responses - each one represents a unique linear effect.
    {"name":"No Effect", "url":"undefined", "dryMix":1, "wetMix":0},
    {"name":"Spreader 1", "url":"impulse-responses/spreader50-65ms.wav",        "dryMix":0.8, "wetMix":1.4},
    {"name":"Spreader 2", "url":"impulse-responses/noise-spreader1.wav",        "dryMix":1, "wetMix":1},
    {"name":"Spring Reverb", "url":"impulse-responses/feedback-spring.wav",     "dryMix":1, "wetMix":1},
    {"name":"Space Oddity", "url":"impulse-responses/filter-rhythm3.wav",       "dryMix":1, "wetMix":0.7},
    {"name":"Reverse", "url":"impulse-responses/spatialized5.wav",              "dryMix":1, "wetMix":1},
    {"name":"Huge Reverse", "url":"impulse-responses/matrix6-backwards.wav",    "dryMix":0, "wetMix":0.7},
    {"name":"Telephone Filter", "url":"impulse-responses/filter-telephone.wav", "dryMix":0, "wetMix":1.2},
    {"name":"Lopass Filter", "url":"impulse-responses/filter-lopass160.wav",    "dryMix":0, "wetMix":0.5},
    {"name":"Hipass Filter", "url":"impulse-responses/filter-hipass5000.wav",   "dryMix":0, "wetMix":4.0},
    {"name":"Comb 1", "url":"impulse-responses/comb-saw1.wav",                  "dryMix":0, "wetMix":0.7},
    {"name":"Comb 2", "url":"impulse-responses/comb-saw2.wav",                  "dryMix":0, "wetMix":1.0},
    {"name":"Cosmic Ping", "url":"impulse-responses/cosmic-ping-long.wav",      "dryMix":0, "wetMix":0.9},
    {"name":"Kitchen", "url":"impulse-responses/house-impulses/kitchen-true-stereo.wav", "dryMix":1, "wetMix":1},
    {"name":"Living Room", "url":"impulse-responses/house-impulses/dining-living-true-stereo.wav", "dryMix":1, "wetMix":1},
    {"name":"Living-Bedroom", "url":"impulse-responses/house-impulses/living-bedroom-leveled.wav", "dryMix":1, "wetMix":1},
    {"name":"Dining-Far-Kitchen", "url":"impulse-responses/house-impulses/dining-far-kitchen.wav", "dryMix":1, "wetMix":1},
    {"name":"Medium Hall 1", "url":"impulse-responses/matrix-reverb2.wav",      "dryMix":1, "wetMix":1},
    {"name":"Medium Hall 2", "url":"impulse-responses/matrix-reverb3.wav",      "dryMix":1, "wetMix":1},
    {"name":"Large Hall", "url":"impulse-responses/spatialized4.wav",           "dryMix":1, "wetMix":0.5},
    {"name":"Peculiar", "url":"impulse-responses/peculiar-backwards.wav",       "dryMix":1, "wetMix":1},
    {"name":"Backslap", "url":"impulse-responses/backslap1.wav",                "dryMix":1, "wetMix":1},
    {"name":"Warehouse", "url":"impulse-responses/tim-warehouse/cardiod-rear-35-10/cardiod-rear-levelled.wav", "dryMix":1, "wetMix":1},
    {"name":"Diffusor", "url":"impulse-responses/diffusor3.wav",                "dryMix":1, "wetMix":1},
    {"name":"Binaural Hall", "url":"impulse-responses/bin_dfeq/s2_r4_bd.wav",   "dryMix":1, "wetMix":0.5},
    {"name":"Huge", "url":"impulse-responses/matrix-reverb6.wav",               "dryMix":1, "wetMix":0.7},
]

var impulseResponseList = 0;

function ImpulseResponse(url, index) {
    this.url = url;
    this.index = index;
    this.startedLoading = false;
    this.isLoaded_ = false;
    this.buffer = 0;
    
    this.demoIndex = -1; // no demo
}

ImpulseResponse.prototype.setDemoIndex = function(index) {
    this.demoIndex = index;
}

ImpulseResponse.prototype.isLoaded = function() {
    return this.isLoaded_;
}

ImpulseResponse.prototype.load = function() {
    if (this.startedLoading) {
        return;
    }
    
    this.startedLoading = true;

    // Load asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", this.url, true);
    request.responseType = "arraybuffer";
    this.request = request;
    
    var asset = this;

    request.onload = function() {
        asset.buffer = context.createBuffer(request.response, false);
        asset.isLoaded_ = true;
        
        if (asset.demoIndex != -1) {
            beatDemo[asset.demoIndex].setEffectLoaded();
        }
    }

    request.send();
}

function startLoadingAssets() {
    impulseResponseList = new Array();

    for (i = 0; i < impulseResponseInfoList.length; i++) {
        impulseResponseList[i] = new ImpulseResponse(impulseResponseInfoList[i].url, i);
    }
    
    // Initialize drum kits
    var numKits = kitName.length;
    kits = new Array(numKits);
    for (var i  = 0; i < numKits; i++) {
        kits[i] = new Kit(kitName[i]);
    }  
    
    // Start loading the assets used by the presets first, in order of the presets.
    for (var demoIndex = 0; demoIndex < 5; ++demoIndex) {
        var effect = impulseResponseList[beatDemo[demoIndex].effectIndex];
        var kit = kits[beatDemo[demoIndex].kitIndex];
        
        // These effects and kits will keep track of a particular demo, so we can change
        // the loading status in the UI.
        effect.setDemoIndex(demoIndex);
        kit.setDemoIndex(demoIndex);
        
        effect.load();
        kit.load();
    }
    
    // Then load the remaining assets.
    // Note that any assets which have previously started loading will be skipped over.
    for (var i  = 0; i < numKits; i++) {
        kits[i].load();
    }  

    // Start at 1 to skip "No Effect"
    for (i = 1; i < impulseResponseInfoList.length; i++) {
        impulseResponseList[i].load();
    }
    
    // Setup initial drumkit
    currentKit = kits[kInitialKitIndex];
}

function demoButtonURL(demoIndex) {
    var n = demoIndex + 1;
    var demoName = "demo" + n;
    var url = "images/btn_" + demoName + ".png";
    return url;
}

// This gets rid of the loading spinner in each of the demo buttons.
function showDemoAvailable(demoIndex /* zero-based */) {
    var url = demoButtonURL(demoIndex);
    var n = demoIndex + 1;
    var demoName = "demo" + n;
    var demo = document.getElementById(demoName);
    demo.src = url;
    
    // Enable play button and assign it to demo 2.
    if (demoIndex == 1) {
        showPlayAvailable();
        loadBeat(beatDemo[1]);

    // Uncomment to allow autoplay
    //     handlePlay();
    }
}

// This gets rid of the loading spinner on the play button.
function showPlayAvailable() {
    var play = document.getElementById("play");
    play.src = "images/btn_play.png";
}

function init() {
    // Let the beat demos know when all of their assets have been loaded.
    // Add some new methods to support this.
    for (var i = 0; i < beatDemo.length; ++i) {
        beatDemo[i].index = i;
        beatDemo[i].isKitLoaded = false;
        beatDemo[i].isEffectLoaded = false;

        beatDemo[i].setKitLoaded = function() {
            this.isKitLoaded = true;
            this.checkIsLoaded();
        };

        beatDemo[i].setEffectLoaded = function() {
            this.isEffectLoaded = true;
            this.checkIsLoaded();
        };

        beatDemo[i].checkIsLoaded = function() {
            if (this.isLoaded()) {
                showDemoAvailable(this.index); 
            }
        };

        beatDemo[i].isLoaded = function() {
            return this.isKitLoaded && this.isEffectLoaded;
        };
    }
        
    startLoadingAssets();

    context = new webkitAudioContext();

    var finalMixNode;
    if (context.createDynamicsCompressor) {
        // Create a dynamics compressor to sweeten the overall mix.
        compressor = context.createDynamicsCompressor();
        compressor.connect(context.destination);
        finalMixNode = compressor;
    } else {
        // No compressor available in this implementation.
        finalMixNode = context.destination;
    }

    // Create master volume.
    masterGainNode = context.createGainNode();
    masterGainNode.gain.value = 0.7; // reduce overall volume to avoid clipping
    masterGainNode.connect(finalMixNode);

    // Create effect volume.
    effectLevelNode = context.createGainNode();
    effectLevelNode.gain.value = 1.0; // effect level slider controls this
    effectLevelNode.connect(masterGainNode);

    // Create convolver for effect
    convolver = context.createConvolver();
    convolver.connect(effectLevelNode);


    var elKitCombo = document.getElementById('kitcombo');
    elKitCombo.addEventListener("mousedown", handleKitComboMouseDown, true);

    var elEffectCombo = document.getElementById('effectcombo');
    elEffectCombo.addEventListener("mousedown", handleEffectComboMouseDown, true);

    document.body.addEventListener("mousedown", handleBodyMouseDown, true);

    initControls();
    updateControls();
}

function initControls() {
    // Initialize note buttons
    initButtons();
    makeKitList();
    makeEffectList();

    // sliders
    document.getElementById('effect_thumb').addEventListener('mousedown', handleSliderMouseDown, true);
    document.getElementById('tom1_thumb').addEventListener('mousedown', handleSliderMouseDown, true);
    document.getElementById('tom2_thumb').addEventListener('mousedown', handleSliderMouseDown, true);
    document.getElementById('tom3_thumb').addEventListener('mousedown', handleSliderMouseDown, true);
    document.getElementById('hihat_thumb').addEventListener('mousedown', handleSliderMouseDown, true);
    document.getElementById('snare_thumb').addEventListener('mousedown', handleSliderMouseDown, true);
    document.getElementById('kick_thumb').addEventListener('mousedown', handleSliderMouseDown, true);
    document.getElementById('swing_thumb').addEventListener('mousedown', handleSliderMouseDown, true);

    document.getElementById('effect_thumb').addEventListener('dblclick', handleSliderDoubleClick, true);
    document.getElementById('tom1_thumb').addEventListener('dblclick', handleSliderDoubleClick, true);
    document.getElementById('tom2_thumb').addEventListener('dblclick', handleSliderDoubleClick, true);
    document.getElementById('tom3_thumb').addEventListener('dblclick', handleSliderDoubleClick, true);
    document.getElementById('hihat_thumb').addEventListener('dblclick', handleSliderDoubleClick, true);
    document.getElementById('snare_thumb').addEventListener('dblclick', handleSliderDoubleClick, true);
    document.getElementById('kick_thumb').addEventListener('dblclick', handleSliderDoubleClick, true);
    document.getElementById('swing_thumb').addEventListener('dblclick', handleSliderDoubleClick, true);

    // tool buttons
    document.getElementById('play').addEventListener('mousedown', handlePlay, true);
    document.getElementById('stop').addEventListener('mousedown', handleStop, true);
    document.getElementById('save').addEventListener('mousedown', handleSave, true);
    document.getElementById('save_ok').addEventListener('mousedown', handleSaveOk, true);
    document.getElementById('load').addEventListener('mousedown', handleLoad, true);
    document.getElementById('load_ok').addEventListener('mousedown', handleLoadOk, true);
    document.getElementById('load_cancel').addEventListener('mousedown', handleLoadCancel, true);
    document.getElementById('reset').addEventListener('mousedown', handleReset, true);
    document.getElementById('demo1').addEventListener('mousedown', handleDemoMouseDown, true);
    document.getElementById('demo2').addEventListener('mousedown', handleDemoMouseDown, true);
    document.getElementById('demo3').addEventListener('mousedown', handleDemoMouseDown, true);
    document.getElementById('demo4').addEventListener('mousedown', handleDemoMouseDown, true);
    document.getElementById('demo5').addEventListener('mousedown', handleDemoMouseDown, true);

    var elBody = document.getElementById('body');
    elBody.addEventListener('mousemove', handleMouseMove, true);
    elBody.addEventListener('mouseup', handleMouseUp, true);

    document.getElementById('tempoinc').addEventListener('mousedown', tempoIncrease, true);
    document.getElementById('tempodec').addEventListener('mousedown', tempoDecrease, true);
}

function initButtons() {        
    var elButton;

    for (i = 0; i < loopLength; ++i) {
        for (j = 0; j < kNumInstruments; j++) {
                elButton = document.getElementById(instruments[j] + '_' + i);
                elButton.addEventListener("mousedown", handleButtonMouseDown, true);
        }
    }
}

function makeEffectList() {
    var elList = document.getElementById('effectlist');
    var numEffects = impulseResponseInfoList.length;

    
    var elItem = document.createElement('li');
    elItem.innerHTML = 'None';
    elItem.addEventListener("mousedown", handleEffectMouseDown, true);
    
    for (var i = 0; i < numEffects; i++) {
        var elItem = document.createElement('li');
        elItem.innerHTML = impulseResponseInfoList[i].name;
        elList.appendChild(elItem);
        elItem.addEventListener("mousedown", handleEffectMouseDown, true);
    }
}

function makeKitList() {
    var elList = document.getElementById('kitlist');
    var numKits = kitName.length;
    
    for (var i = 0; i < numKits; i++) {
        var elItem = document.createElement('li');
        elItem.innerHTML = kitNamePretty[i];
        elList.appendChild(elItem);
        elItem.addEventListener("mousedown", handleKitMouseDown, true);
    }
}

function advanceNote() {
    // Advance time by a 16th note...
    var secondsPerBeat = 60.0 / theBeat.tempo;

    rhythmIndex++;
    if (rhythmIndex == loopLength) {
        rhythmIndex = 0;
    }

        // apply swing    
    if (rhythmIndex % 2) {
        noteTime += (0.25 + kMaxSwing * theBeat.swingFactor) * secondsPerBeat;
    } else {
        noteTime += (0.25 - kMaxSwing * theBeat.swingFactor) * secondsPerBeat;
    }
}

function playNote(buffer, pan, x, y, z, sendGain, mainGain, playbackRate, noteTime) {
    // Create the note
    var voice = context.createBufferSource();
    voice.buffer = buffer;
    voice.playbackRate.value = playbackRate;

    // Optionally, connect to a panner
    var finalNode;
    if (pan) {
        var panner = context.createPanner();
        panner.panningModel = webkitAudioPannerNode.HRTF;
        panner.setPosition(x, y, z);
        voice.connect(panner);
        finalNode = panner;
    } else {
        finalNode = voice;
    }

    // Connect to dry mix
    var dryGainNode = context.createGainNode();
    dryGainNode.gain.value = mainGain * effectDryMix;
    finalNode.connect(dryGainNode);
    dryGainNode.connect(masterGainNode);

    // Connect to wet mix
    var wetGainNode = context.createGainNode();
    wetGainNode.gain.value = sendGain;
    finalNode.connect(wetGainNode);
    wetGainNode.connect(convolver);

    voice.noteOn(noteTime);
}

function schedule() {
    var currentTime = context.currentTime;

    // The sequence starts at startTime, so normalize currentTime so that it's 0 at the start of the sequence.
    currentTime -= startTime;

    while (noteTime < currentTime + 0.200) {
        // Convert noteTime to context time.
        var contextPlayTime = noteTime + startTime;
        
        // Kick
        if (theBeat.rhythm1[rhythmIndex]) {
            playNote(currentKit.kickBuffer, false, 0,0,-2, 0.5, volumes[theBeat.rhythm1[rhythmIndex]] * 1.0, kickPitch, contextPlayTime);
        }

        // Snare
        if (theBeat.rhythm2[rhythmIndex]) {
            playNote(currentKit.snareBuffer, false, 0,0,-2, 1, volumes[theBeat.rhythm2[rhythmIndex]] * 0.6, snarePitch, contextPlayTime);
        }

        // Hihat
        if (theBeat.rhythm3[rhythmIndex]) {
            // Pan the hihat according to sequence position.
            playNote(currentKit.hihatBuffer, true, 0.5*rhythmIndex - 4, 0, -1.0, 1, volumes[theBeat.rhythm3[rhythmIndex]] * 0.7, hihatPitch, contextPlayTime);
        }

        // Toms    
        if (theBeat.rhythm4[rhythmIndex]) {
            playNote(currentKit.tom1, false, 0,0,-2, 1, volumes[theBeat.rhythm4[rhythmIndex]] * 0.6, tom1Pitch, contextPlayTime);
        }

        if (theBeat.rhythm5[rhythmIndex]) {
            playNote(currentKit.tom2, false, 0,0,-2, 1, volumes[theBeat.rhythm5[rhythmIndex]] * 0.6, tom2Pitch, contextPlayTime);
        }

        if (theBeat.rhythm6[rhythmIndex]) {
            playNote(currentKit.tom3, false, 0,0,-2, 1, volumes[theBeat.rhythm6[rhythmIndex]] * 0.6, tom3Pitch, contextPlayTime);
        }

        
        // Attempt to synchronize drawing time with sound
        if (noteTime != lastDrawTime) {
            lastDrawTime = noteTime;
            drawPlayhead((rhythmIndex + 15) % 16);
        }

        advanceNote();
    }

    timeoutId = setTimeout("schedule()", 0);
}

function tempoIncrease() {
    theBeat.tempo = Math.min(kMaxTempo, theBeat.tempo+4);
    document.getElementById('tempo').innerHTML = theBeat.tempo;
}

function tempoDecrease() {
    theBeat.tempo = Math.max(kMinTempo, theBeat.tempo-4);
    document.getElementById('tempo').innerHTML = theBeat.tempo;
}

function handleSliderMouseDown(event) {
    mouseCapture = event.target.id;

    // calculate offset of mousedown on slider
    var el = event.target;
    if (mouseCapture == 'swing_thumb') {
        var thumbX = 0;    
        do {
            thumbX += el.offsetLeft;
        } while (el = el.offsetParent);

        mouseCaptureOffset = event.pageX - thumbX;
    } else {
        var thumbY = 0;    
        do {
            thumbY += el.offsetTop;
        } while (el = el.offsetParent);

        mouseCaptureOffset = event.pageY - thumbY;
    }
}

function handleSliderDoubleClick(event) {
    var id = event.target.id;
    if (id != 'swing_thumb' && id != 'effect_thumb') {
        mouseCapture = null;
        sliderSetValue(event.target.id, 0.5);
        updateControls();
    }
}

function handleMouseMove(event) {
    if (!mouseCapture) return;
    
    var elThumb = document.getElementById(mouseCapture);
    var elTrack = elThumb.parentNode;

    if (mouseCapture != 'swing_thumb') {
        var thumbH = elThumb.clientHeight;
        var trackH = elTrack.clientHeight;
        var travelH = trackH - thumbH;

        var trackY = 0;
        var el = elTrack;
        do {
            trackY += el.offsetTop;
        } while (el = el.offsetParent);

        var offsetY = Math.max(0, Math.min(travelH, event.pageY - mouseCaptureOffset - trackY));
        var value = 1.0 - offsetY / travelH;
        elThumb.style.top = travelH * (1.0 - value) + 'px';
    } else {
        var thumbW = elThumb.clientWidth;
        var trackW = elTrack.clientWidth;
        var travelW = trackW - thumbW;

        var trackX = 0;
        var el = elTrack;
        do {
            trackX += el.offsetLeft;
        } while (el = el.offsetParent);

        var offsetX = Math.max(0, Math.min(travelW, event.pageX - mouseCaptureOffset - trackX));
        var value = offsetX / travelW;
        elThumb.style.left = travelW * value + 'px';
    }

    sliderSetValue(mouseCapture, value);
}

function handleMouseUp() {
    mouseCapture = null;
}

function sliderSetValue(slider, value) {
    var pitchRate = Math.pow(2.0, 2.0 * (value - 0.5));
    
    switch(slider) {
    case 'effect_thumb':
        // Change the volume of the convolution effect.
        theBeat.effectMix = value;
        setEffectLevel(theBeat);            
        break;
    case 'kick_thumb':
        theBeat.kickPitchVal = value;
        kickPitch = pitchRate;
        break;
    case 'snare_thumb':
        theBeat.snarePitchVal = value;
        snarePitch = pitchRate;
        break;
    case 'hihat_thumb':
        theBeat.hihatPitchVal = value;
        hihatPitch = pitchRate;
        break;
    case 'tom1_thumb':
        theBeat.tom1PitchVal = value;
        tom1Pitch = pitchRate;
        break;
    case 'tom2_thumb':
        theBeat.tom2PitchVal = value;
        tom2Pitch = pitchRate;
        break;
    case 'tom3_thumb':
        theBeat.tom3PitchVal = value;
        tom3Pitch = pitchRate;
        break;
    case 'swing_thumb':
        theBeat.swingFactor = value;
        break; 
    }
}

function sliderSetPosition(slider, value) {
    var elThumb = document.getElementById(slider);
    var elTrack = elThumb.parentNode;

    if (slider == 'swing_thumb') {
        var thumbW = elThumb.clientWidth;
        var trackW = elTrack.clientWidth;
        var travelW = trackW - thumbW;

        elThumb.style.left = travelW * value + 'px';
    } else {
        var thumbH = elThumb.clientHeight;
        var trackH = elTrack.clientHeight;
        var travelH = trackH - thumbH;

        elThumb.style.top = travelH * (1.0 - value) + 'px';
    }
}

function handleButtonMouseDown(event) {
    var notes = theBeat.rhythm1;
    
    var instrumentIndex;
    var rhythmIndex;

    var elId = event.target.id;
    rhythmIndex = elId.substr(elId.indexOf('_') + 1, 2);
    instrumentIndex = instruments.indexOf(elId.substr(0, elId.indexOf('_')));
        
    switch (instrumentIndex) {
        case 0: notes = theBeat.rhythm1; break;
        case 1: notes = theBeat.rhythm2; break;
        case 2: notes = theBeat.rhythm3; break;
        case 3: notes = theBeat.rhythm4; break;
        case 4: notes = theBeat.rhythm5; break;
        case 5: notes = theBeat.rhythm6; break;
    }

    notes[rhythmIndex] = (notes[rhythmIndex] + 1) % 3;

    drawNote(notes[rhythmIndex], rhythmIndex, instrumentIndex);

    var note = notes[rhythmIndex];
    
    if (note) {
        switch(instrumentIndex) {
        case 0:  // Kick
          playNote(currentKit.kickBuffer, false, 0,0,-2, 0.5 * theBeat.effectMix, volumes[note] * 1.0, kickPitch, 0);
          break;

        case 1:  // Snare
          playNote(currentKit.snareBuffer, false, 0,0,-2, theBeat.effectMix, volumes[note] * 0.6, snarePitch, 0);
          break;

        case 2:  // Hihat
          // Pan the hihat according to sequence position.
          playNote(currentKit.hihatBuffer, true, 0.5*rhythmIndex - 4, 0, -1.0, theBeat.effectMix, volumes[note] * 0.7, hihatPitch, 0);
          break;

        case 3:  // Tom 1   
          playNote(currentKit.tom1, false, 0,0,-2, theBeat.effectMix, volumes[note] * 0.6, tom1Pitch, 0);
          break;

        case 4:  // Tom 2   
          playNote(currentKit.tom2, false, 0,0,-2, theBeat.effectMix, volumes[note] * 0.6, tom2Pitch, 0);
          break;

        case 5:  // Tom 3   
          playNote(currentKit.tom3, false, 0,0,-2, theBeat.effectMix, volumes[note] * 0.6, tom3Pitch, 0);
          break;
        }
    }
}

function handleKitComboMouseDown(event) {
    document.getElementById('kitcombo').classList.toggle('active');
}

function handleKitMouseDown(event) {
    var index = kitNamePretty.indexOf(event.target.innerHTML);
    theBeat.kitIndex = index;
    currentKit = kits[index];
    document.getElementById('kitname').innerHTML = kitNamePretty[index];
}

function handleBodyMouseDown(event) {
    var elKitcombo = document.getElementById('kitcombo');
    var elEffectcombo = document.getElementById('effectcombo');

    if (elKitcombo.classList.contains('active') && !isDescendantOfId(event.target, 'kitcombo_container')) {
        elKitcombo.classList.remove('active');
        if (!isDescendantOfId(event.target, 'effectcombo_container')) {
            event.stopPropagation();
        }
    }
    
    if (elEffectcombo.classList.contains('active') && !isDescendantOfId(event.target, 'effectcombo')) {
        elEffectcombo.classList.remove('active');
        if (!isDescendantOfId(event.target, 'kitcombo_container')) {
            event.stopPropagation();
        }
    }    
}

function isDescendantOfId(el, id) {
    if (el.parentElement) {
        if (el.parentElement.id == id) {
            return true;
        } else {
            return isDescendantOfId(el.parentElement, id);
        }
    } else {
        return false;
    }
}

function handleEffectComboMouseDown(event) {
    if (event.target.id != 'effectlist') {
        document.getElementById('effectcombo').classList.toggle('active');
    }
}

function handleEffectMouseDown(event) {
    for (var i = 0; i < impulseResponseInfoList.length; ++i) {
        if (impulseResponseInfoList[i].name == event.target.innerHTML) {

            // Hack - if effect is turned all the way down - turn up effect slider.
            // ... since they just explicitly chose an effect from the list.
            if (theBeat.effectMix == 0)
                theBeat.effectMix = 0.5;

            setEffect(i);
            break;
        }
    }
}

function setEffect(index) {
    if (index > 0 && !impulseResponseList[index].isLoaded()) {
        alert('Sorry, this effect is still loading.  Try again in a few seconds :)');
        return;
    }

    theBeat.effectIndex = index;
    effectDryMix = impulseResponseInfoList[index].dryMix;
    effectWetMix = impulseResponseInfoList[index].wetMix;            
    convolver.buffer = impulseResponseList[index].buffer;

  // Hack - if the effect is meant to be entirely wet (not unprocessed signal)
  // then put the effect level all the way up.
    if (effectDryMix == 0)
        theBeat.effectMix = 1;

    setEffectLevel(theBeat);
    sliderSetValue('effect_thumb', theBeat.effectMix);
    updateControls();

    document.getElementById('effectname').innerHTML = impulseResponseInfoList[index].name;
}

function setEffectLevel() {        
    // Factor in both the preset's effect level and the blending level (effectWetMix) stored in the effect itself.
    effectLevelNode.gain.value = theBeat.effectMix * effectWetMix;
}


function handleDemoMouseDown(event) {
    var loaded = false;
    
    switch(event.target.id) {
        case 'demo1':
            loaded = loadBeat(beatDemo[0]);    
            break;
        case 'demo2':
            loaded = loadBeat(beatDemo[1]);    
            break;
        case 'demo3':
            loaded = loadBeat(beatDemo[2]);    
            break;
        case 'demo4':
            loaded = loadBeat(beatDemo[3]);    
            break;
        case 'demo5':
            loaded = loadBeat(beatDemo[4]);    
            break;
    }
    
    if (loaded)
        handlePlay();
}

function handlePlay(event) {
    noteTime = 0.0;
    startTime = context.currentTime + 0.005;
    schedule();

    document.getElementById('play').classList.add('playing');
    document.getElementById('stop').classList.add('playing');
}

function handleStop(event) {
    clearTimeout(timeoutId);

    var elOld = document.getElementById('LED_' + (rhythmIndex + 14) % 16);
    elOld.src = 'images/LED_off.png';

    rhythmIndex = 0;

    document.getElementById('play').classList.remove('playing');
    document.getElementById('stop').classList.remove('playing');
}

function handleSave(event) {
    toggleSaveContainer();
    var elTextarea = document.getElementById('save_textarea');
    elTextarea.value = JSON.stringify(theBeat);
}

function handleSaveOk(event) {
    toggleSaveContainer();
}

function handleLoad(event) {
    toggleLoadContainer();
}

function handleLoadOk(event) {
    var elTextarea = document.getElementById('load_textarea');
    theBeat = JSON.parse(elTextarea.value);

    // Set drumkit
    currentKit = kits[theBeat.kitIndex];
    document.getElementById('kitname').innerHTML = kitNamePretty[theBeat.kitIndex];

    // Set effect
    setEffect(theBeat.effectIndex);

    // Change the volume of the convolution effect.
    setEffectLevel(theBeat);

    // Apply values from sliders
    sliderSetValue('effect_thumb', theBeat.effectMix);
    sliderSetValue('kick_thumb', theBeat.kickPitchVal);
    sliderSetValue('snare_thumb', theBeat.snarePitchVal);
    sliderSetValue('hihat_thumb', theBeat.hihatPitchVal);
    sliderSetValue('tom1_thumb', theBeat.tom1PitchVal);
    sliderSetValue('tom2_thumb', theBeat.tom2PitchVal);
    sliderSetValue('tom3_thumb', theBeat.tom3PitchVal);
    sliderSetValue('swing_thumb', theBeat.swingFactor);

    // Clear out the text area post-processing
    elTextarea.value = '';

    toggleLoadContainer();
    updateControls();
}

function handleLoadCancel(event) {
    toggleLoadContainer();
}

function toggleSaveContainer() {
    document.getElementById('pad').classList.toggle('active');
    document.getElementById('params').classList.toggle('active');
    document.getElementById('tools').classList.toggle('active');
    document.getElementById('save_container').classList.toggle('active');
}

function toggleLoadContainer() {
    document.getElementById('pad').classList.toggle('active');
    document.getElementById('params').classList.toggle('active');
    document.getElementById('tools').classList.toggle('active');
    document.getElementById('load_container').classList.toggle('active');
}

function handleReset(event) {
    handleStop();
    loadBeat(beatReset);    
}

function loadBeat(beat) {
    // Check that assets are loaded.
    if (beat != beatReset && !beat.isLoaded())
        return false;

    handleStop();

    theBeat = cloneBeat(beat);
    currentKit = kits[theBeat.kitIndex];
    setEffect(theBeat.effectIndex);

    // apply values from sliders
    sliderSetValue('effect_thumb', theBeat.effectMix);
    sliderSetValue('kick_thumb', theBeat.kickPitchVal);
    sliderSetValue('snare_thumb', theBeat.snarePitchVal);
    sliderSetValue('hihat_thumb', theBeat.hihatPitchVal);
    sliderSetValue('tom1_thumb', theBeat.tom1PitchVal);
    sliderSetValue('tom2_thumb', theBeat.tom2PitchVal);
    sliderSetValue('tom3_thumb', theBeat.tom3PitchVal);
    sliderSetValue('swing_thumb', theBeat.swingFactor);

    updateControls();

    return true;
}

function updateControls() {
    for (i = 0; i < loopLength; ++i) {
        for (j = 0; j < kNumInstruments; j++) {
            switch (j) {
                case 0: notes = theBeat.rhythm1; break;
                case 1: notes = theBeat.rhythm2; break;
                case 2: notes = theBeat.rhythm3; break;
                case 3: notes = theBeat.rhythm4; break;
                case 4: notes = theBeat.rhythm5; break;
                case 5: notes = theBeat.rhythm6; break;
            }

            drawNote(notes[i], i, j);
        }
    }

    document.getElementById('kitname').innerHTML = kitNamePretty[theBeat.kitIndex];
    document.getElementById('effectname').innerHTML = impulseResponseInfoList[theBeat.effectIndex].name;
    document.getElementById('tempo').innerHTML = theBeat.tempo;
    sliderSetPosition('swing_thumb', theBeat.swingFactor);
    sliderSetPosition('effect_thumb', theBeat.effectMix);
    sliderSetPosition('kick_thumb', theBeat.kickPitchVal);
    sliderSetPosition('snare_thumb', theBeat.snarePitchVal);
    sliderSetPosition('hihat_thumb', theBeat.hihatPitchVal);
    sliderSetPosition('tom1_thumb', theBeat.tom1PitchVal);        
    sliderSetPosition('tom2_thumb', theBeat.tom2PitchVal);
    sliderSetPosition('tom3_thumb', theBeat.tom3PitchVal);
}


function drawNote(draw, xindex, yindex) {    
    var elButton = document.getElementById(instruments[yindex] + '_' + xindex);
    switch (draw) {
        case 0: elButton.src = 'images/button_off.png'; break;
        case 1: elButton.src = 'images/button_half.png'; break;
        case 2: elButton.src = 'images/button_on.png'; break;
    }
}

function drawPlayhead(xindex) {
    var lastIndex = (xindex + 15) % 16;

    var elNew = document.getElementById('LED_' + xindex);
    var elOld = document.getElementById('LED_' + lastIndex);
    
    elNew.src = 'images/LED_on.png';
    elOld.src = 'images/LED_off.png';
}

</script>
</head>


<!-- Preload some important UI elements -->
<img class="preload" src='images/btn_play.png'>
<img class="preload" src='images/btn_load.png'>
<img class="preload" src='images/btn_reset.png'>
<img class="preload" src='images/btn_save.png'>
<img class="preload" src='images/btn_demo1.png'>
<img class="preload" src='images/btn_demo2.png'>
<img class="preload" src='images/btn_demo3.png'>
<img class="preload" src='images/btn_demo4.png'>
<img class="preload" src='images/btn_demo5.png'>
<img class="preload" src='images/button_off.png'>
<img class="preload" src='images/button_half.png'>
<img class="preload" src='images/button_on.png'>
<img class="preload" src='images/LED_on.png'>

<!--  The markup below keeps all images in a row on a single long line to avoid 
            a bizarre bug where otherwise the browser inserts an extra pixel between 
            the images.  The cost of perfectionism :O{
-->

<body id='body'>
    <div id='title'>
        WebAudio Drum Machine <span id='version'>1.0</span>
    </div>
    <section class='container active' id='pad'>
        <div class='buttons_row'>
            <span class='label'>Tom 1</span>
            <img id='Tom1_0' class='btn' src='images/button_off.png'><img id='Tom1_1' class='btn' src='images/button_off.png'><img id='Tom1_2' class='btn' src='images/button_off.png'><img id='Tom1_3' class='btn' src='images/button_off.png'><img id='Tom1_4' class='btn' src='images/button_off.png'><img id='Tom1_5' class='btn' src='images/button_off.png'><img id='Tom1_6' class='btn' src='images/button_off.png'><img id='Tom1_7' class='btn' src='images/button_off.png'><img id='Tom1_8' class='btn' src='images/button_off.png'><img id='Tom1_9' class='btn' src='images/button_off.png'><img id='Tom1_10' class='btn' src='images/button_off.png'><img id='Tom1_11' class='btn' src='images/button_off.png'><img id='Tom1_12' class='btn' src='images/button_off.png'><img id='Tom1_13' class='btn' src='images/button_off.png'><img id='Tom1_14' class='btn' src='images/button_off.png'><img id='Tom1_15' class='btn' src='images/button_off.png'>
        </div>
        <div class='buttons_row'>
            <span class='label'>Tom 2</span>
            <img id='Tom2_0' class='btn' src='images/button_off.png'><img id='Tom2_1' class='btn' src='images/button_off.png'><img id='Tom2_2' class='btn' src='images/button_off.png'><img id='Tom2_3' class='btn' src='images/button_off.png'><img id='Tom2_4' class='btn' src='images/button_off.png'><img id='Tom2_5' class='btn' src='images/button_off.png'><img id='Tom2_6' class='btn' src='images/button_off.png'><img id='Tom2_7' class='btn' src='images/button_off.png'><img id='Tom2_8' class='btn' src='images/button_off.png'><img id='Tom2_9' class='btn' src='images/button_off.png'><img id='Tom2_10' class='btn' src='images/button_off.png'><img id='Tom2_11' class='btn' src='images/button_off.png'><img id='Tom2_12' class='btn' src='images/button_off.png'><img id='Tom2_13' class='btn' src='images/button_off.png'><img id='Tom2_14' class='btn' src='images/button_off.png'><img id='Tom2_15' class='btn' src='images/button_off.png'>
        </div>
        <div class='buttons_row'>
            <span class='label'>Tom 3</span>
            <img id='Tom3_0' class='btn' src='images/button_off.png'><img id='Tom3_1' class='btn' src='images/button_off.png'><img id='Tom3_2' class='btn' src='images/button_off.png'><img id='Tom3_3' class='btn' src='images/button_off.png'><img id='Tom3_4' class='btn' src='images/button_off.png'><img id='Tom3_5' class='btn' src='images/button_off.png'><img id='Tom3_6' class='btn' src='images/button_off.png'><img id='Tom3_7' class='btn' src='images/button_off.png'><img id='Tom3_8' class='btn' src='images/button_off.png'><img id='Tom3_9' class='btn' src='images/button_off.png'><img id='Tom3_10' class='btn' src='images/button_off.png'><img id='Tom3_11' class='btn' src='images/button_off.png'><img id='Tom3_12' class='btn' src='images/button_off.png'><img id='Tom3_13' class='btn' src='images/button_off.png'><img id='Tom3_14' class='btn' src='images/button_off.png'><img id='Tom3_15' class='btn' src='images/button_off.png'>
        </div>
        <div class='buttons_row'>
            <span class='label'>Hi-Hat</span>
            <img id='HiHat_0' class='btn' src='images/button_off.png'><img id='HiHat_1' class='btn' src='images/button_off.png'><img id='HiHat_2' class='btn' src='images/button_off.png'><img id='HiHat_3' class='btn' src='images/button_off.png'><img id='HiHat_4' class='btn' src='images/button_off.png'><img id='HiHat_5' class='btn' src='images/button_off.png'><img id='HiHat_6' class='btn' src='images/button_off.png'><img id='HiHat_7' class='btn' src='images/button_off.png'><img id='HiHat_8' class='btn' src='images/button_off.png'><img id='HiHat_9' class='btn' src='images/button_off.png'><img id='HiHat_10' class='btn' src='images/button_off.png'><img id='HiHat_11' class='btn' src='images/button_off.png'><img id='HiHat_12' class='btn' src='images/button_off.png'><img id='HiHat_13' class='btn' src='images/button_off.png'><img id='HiHat_14' class='btn' src='images/button_off.png'><img id='HiHat_15' class='btn' src='images/button_off.png'>
        </div>
        <div class='buttons_row'>
            <span class='label'>Snare</span>
            <img id='Snare_0' class='btn' src='images/button_off.png'><img id='Snare_1' class='btn' src='images/button_off.png'><img id='Snare_2' class='btn' src='images/button_off.png'><img id='Snare_3' class='btn' src='images/button_off.png'><img id='Snare_4' class='btn' src='images/button_off.png'><img id='Snare_5' class='btn' src='images/button_off.png'><img id='Snare_6' class='btn' src='images/button_off.png'><img id='Snare_7' class='btn' src='images/button_off.png'><img id='Snare_8' class='btn' src='images/button_off.png'><img id='Snare_9' class='btn' src='images/button_off.png'><img id='Snare_10' class='btn' src='images/button_off.png'><img id='Snare_11' class='btn' src='images/button_off.png'><img id='Snare_12' class='btn' src='images/button_off.png'><img id='Snare_13' class='btn' src='images/button_off.png'><img id='Snare_14' class='btn' src='images/button_off.png'><img id='Snare_15' class='btn' src='images/button_off.png'>
        </div>
        <div class='buttons_row'>
            <span class='label'>Kick</span>
            <img id='Kick_0' class='btn' src='images/button_off.png'><img id='Kick_1' class='btn' src='images/button_off.png'><img id='Kick_2' class='btn' src='images/button_off.png'><img id='Kick_3' class='btn' src='images/button_off.png'><img id='Kick_4' class='btn' src='images/button_off.png'><img id='Kick_5' class='btn' src='images/button_off.png'><img id='Kick_6' class='btn' src='images/button_off.png'><img id='Kick_7' class='btn' src='images/button_off.png'><img id='Kick_8' class='btn' src='images/button_off.png'><img id='Kick_9' class='btn' src='images/button_off.png'><img id='Kick_10' class='btn' src='images/button_off.png'><img id='Kick_11' class='btn' src='images/button_off.png'><img id='Kick_12' class='btn' src='images/button_off.png'><img id='Kick_13' class='btn' src='images/button_off.png'><img id='Kick_14' class='btn' src='images/button_off.png'><img id='Kick_15' class='btn' src='images/button_off.png'>
        </div>
        <div class='buttons_row' id='LED_row'>
            <span class='label'></span>
            <img id='LED_0' src='images/LED_off.png'><img id='LED_1' src='images/LED_off.png'><img id='LED_2' src='images/LED_off.png'><img id='LED_3' src='images/LED_off.png'><img id='LED_4' src='images/LED_off.png'><img id='LED_5' src='images/LED_off.png'><img id='LED_6' src='images/LED_off.png'><img id='LED_7' src='images/LED_off.png'><img id='LED_8' src='images/LED_off.png'><img id='LED_9' src='images/LED_off.png'><img id='LED_10' src='images/LED_off.png'><img id='LED_11' src='images/LED_off.png'><img id='LED_12' src='images/LED_off.png'><img id='LED_13' src='images/LED_off.png'><img id='LED_14' src='images/LED_off.png'><img id='LED_15' src='images/LED_off.png'>
        </div>
    </section>
    <section class='container active' id='params'>
        <div id='paramsleft_container'>
            <div id='kitcombo_container'>
                <span class='label' id='kitlabel'>Kit</span>
                <div class='combo' id='kitcombo'>
                    <span id='kitname'></span>
                    <img src='images/drop_arrow.png'>
                    <ul class='combolist' id='kitlist'>
                    </ul>
                </div>
            </div>
            <div id='effectcombo_container'>
                <span class='label' id='effectlabel'>Effect</span>
                <div class='combo' id='effectcombo'>
                    <span id='effectname'></span>
                    <img src='images/drop_arrow.png'>
                    <ul class='combolist' id='effectlist'>
                    </ul>
                </div>
            </div>
            <div id='tempo_container'>
                <span class='label' id='tempolabel'>Tempo</span>
                <div id='tempodisplay'>
                <span id='tempo'></span>&nbsp;<span id='bpm'>bpm</span>
                </div>
                <img id='tempodec' src='images/tempo_dec.png'><img id='tempoinc' src='images/tempo_inc.png'>
            </div>
            <div class='slider_container' id='swing_container'>
                <span class='label' id='swinglabel'>Swing</span>
                <div class='slider_groove'>
                    <img class='slider_track' src='images/sliderh_track.png'>
                    <img class='slider_thumb' id='swing_thumb' src='images/sliderh_thumb.png'>
                </div>
            </div>
        </div>
        <div class='vrule'></div>
        <div class='slider_container' id='effect_container'>
            <div class='slider_groove'>
                <img class='slider_track' src='images/slider_track.png'>
                <img class='slider_thumb' id='effect_thumb' src='images/slider_thumb.png'>
            </div>
            <div class='slider_label'>
                Effect Level
            </div>
        </div>
        <div class='vrule'></div>
        <div class='slider_container' id='kick_container'>
            <div class='slider_groove'>
                <img class='slider_track' src='images/slider_track.png'>
                <img class='slider_thumb' id='kick_thumb' src='images/slider_thumb.png'>
            </div>
            <div class='slider_label'>
                Kick Pitch
            </div>
        </div>
        <div class='slider_container' id='snare_container'>
            <div class='slider_groove'>
                <img class='slider_track' src='images/slider_track.png'>
                <img class='slider_thumb' id='snare_thumb' src='images/slider_thumb.png'>
            </div>
            <div class='slider_label'>
                Snare Pitch
            </div>
        </div>
        <div class='slider_container' id='hihat_container'>
            <div class='slider_groove'>
                <img class='slider_track' src='images/slider_track.png'>
                <img class='slider_thumb' id='hihat_thumb' src='images/slider_thumb.png'>
            </div>
            <div class='slider_label'>
                Hi-Hat Pitch
            </div>
        </div>
        <div class='slider_container' id='tom1_container'>
            <div class='slider_groove'>
                <img class='slider_track' src='images/slider_track.png'>
                <img class='slider_thumb' id='tom1_thumb' src='images/slider_thumb.png'>
            </div>
            <div class='slider_label'>
                Tom 1 Pitch
            </div>
        </div>
        <div class='slider_container' id='tom2_container'>
            <div class='slider_groove'>
                <img class='slider_track' src='images/slider_track.png'>
                <img class='slider_thumb' id='tom2_thumb' src='images/slider_thumb.png'>
            </div>
            <div class='slider_label'>
                Tom 2 Pitch
            </div>
        </div>
        <div class='slider_container' id='tom3_container'>
            <div class='slider_groove'>
                <img class='slider_track' src='images/slider_track.png'>
                <img class='slider_thumb' id='tom3_thumb' src='images/slider_thumb.png'>
            </div>
            <div class='slider_label'>
                Tom 3 Pitch
            </div>
        </div>
    </section>
    
    <section class='container active' id='tools'>
        <span class='label' id='beatlabel'>Beat</span>
        <img id='play' src='images/btn_play_loading.gif' width='80' height='33'>
        <img id='stop' src='images/btn_stop.png'>
        <img id='save' src='images/btn_save.png'><img id='load' src='images/btn_load.png'><img id='reset' src='images/btn_reset.png'>
        <span id='demos_container'>
            <span class='label' id='demolabel'>Demo</span>
            <img id='demo1' src='images/btn_demo1_loading.gif' width='44' height='33'><img id='demo2' src='images/btn_demo2_loading.gif' width='44' height='33'><img id='demo3' src='images/btn_demo3_loading.gif' width='44' height='33'><img id='demo4' src='images/btn_demo4_loading.gif' width='44' height='33'><img id='demo5' src='images/btn_demo5_loading.gif' width='45' height='33'>
        </span>
    </section>
    
    
    <div class='container' id='save_container'>
        <h3>
            Save a Beat
        </h3>
        <p>
            For security reasons, web browsers don't make it easy to save files directly to your hard drive.
            But to save your beat just copy and paste the data block below into a text file.
            To load the beat later click the Load button then paste the data block from your text file 
            into the blank window.
        </p>
        <textarea id='save_textarea' spellcheck='false'></textarea>
        <img id='save_ok' src='images/btn_ok.png'>
    </div>
    
    <div class='container' id='load_container'>
        <h3>
            Load a Beat
        </h3>
        <p>
            Paste the beat data into the blank window below and click OK.
        </p>
        <textarea id='load_textarea' spellcheck='false'></textarea>
        <div id='load_buttons'>
            <img id='load_ok' src='images/btn_ok.png'>
            <img id='load_cancel' src='images/btn_cancel.png'>
        </div>
    </div>
</body>
</html>
