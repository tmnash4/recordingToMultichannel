console.log(ambisonics);

// Setup audio context and variables
var AudioContext = window.AudioContext // Default
    || window.webkitAudioContext; // Safari and old versions of Chrome
var context = new AudioContext; // Create and Initialize the Audio Context
Tone.setContext(context);
let tone = Tone;
tone.setContext(context);

//var context = tone.getContext()

// added resume context to handle Firefox suspension of it when new IR loaded
// see: http://stackoverflow.com/questions/32955594/web-audio-scriptnode-not-called-after-button-onclick
context.onstatechange = function() {
    if (context.state === "suspended") { context.resume(); }
}

let soundUrl = "/uploads/whisper_Sample";



var maxOrder = 3;
var orderOut = 3;
var soundBuffer, sound;
let soundBuffer1, sound1;
let soundBuffer2, sound2;
let soundBuffer3, sound3

var socketName = 'ambisonic';
var socket = io(); 

let myNum;
let myNum1;
let myNumArray = []

async function startAudio() {  //This code starts the audio 
    await Tone.start()
    console.log("ready")
  }
  

let playerArray = [];


socket.emit('register', 'ambisonic')
socket.on('newFile', (data) => {
    console.log(data.fileName)
    //nameArray.push((data.fileName))
    //let mySample = new Tone.Player('/uploads/' + data.fileName + '.mp3')
    let mySample = '/uploads/' + data.fileName
    playerArray.push(mySample)
})



// define HOA encoder (panner)
var encoder = new ambisonics.monoEncoder(context, maxOrder);
encoder.azim = -90;
console.log(encoder);
// define HOA order limiter (to show the effect of order)
var limiter = new ambisonics.orderLimiter(context, maxOrder, orderOut);
console.log(limiter);
// binaural HOA decoder
var decoder = new ambisonics.decoder(context, maxOrder);
//let spkSphPosArray = [ [0, 0, 1], [90, 0, 1], [180, 0, 1], [270, 0, 1], [0, 90, 1], [0, -90, 1] ];
let spkSphPosArray = [ [0, 0, 1], [45, 0, 1], [90, 0, 1], [135, 0, 1], [180, 0, 1], [225, 0, 1], [270, 0, 1], [315, 0, 1], [0, 90, 1], [300, -90, 1] ];

decoder.speakerPos = spkSphPosArray;
console.log(decoder);
// intensity analyser
var analyser = new ambisonics.intensityAnalyser(context, maxOrder);
console.log(analyser);
// output gain
var gainOut = context.createGain();

// connect HOA blocks
encoder.out.connect(analyser.in);
encoder.out.connect(limiter.in);
limiter.out.connect(decoder.in);
decoder.out.connect(gainOut);
gainOut.connect(context.destination);


// setup audio context number of channel 
var maxChannelCount = context.destination.maxChannelCount;
console.log('max channel in AudioContext:', maxChannelCount, 'required:', decoder.nSpk);
context.destination.channelCount = decoder.nSpk;

// // may come handy at some point (Safari / Firefox?):
// decoder.out.channelCount = 1;
// decoder.out.channelCountMode = "explicit";
// decoder.out.channelInterpretation = "discrete";
// context.destination.channelCountMode = "explicit";
// context.destination.channelInterpretation = "discrete";
//et grain = new Tone.GrainPlayer(myNumArray[0]);


// function to assign sample to the sound buffer for playback (and enable playbutton)
var assignSample2SoundBuffer = function(decodedBuffer) {
    soundBuffer = decodedBuffer;
    //document.getElementById('play').disabled = false;
    setAzim()
}

var assignSample2SoundBuffer1 = function(decodedBuffer) {
    soundBuffer1 = decodedBuffer;
    //document.getElementById('play').disabled = false;
    setAzim()
}

var assignSample2SoundBuffer2 = function(decodedBuffer) {
    soundBuffer2 = decodedBuffer;
    //document.getElementById('play').disabled = false;
    setAzim()
}

var assignSample2SoundBuffer3 = function(decodedBuffer) {
    soundBuffer3 = decodedBuffer;
    //document.getElementById('play').disabled = false;
    setAzim()
}



function onDecodeAudioDataError(error) {
    var url = 'hjre';
  alert("Browser cannot decode audio data..." + "\n\nError: " + error + "\n\n(If you re using Safari and get a null error, this is most likely due to Apple's shady plan going on to stop the .ogg format from easing web developer's life :)");
}

// function to load samples
function loadSample(url, doAfterLoading) {
    var fetchSound = new XMLHttpRequest(); // Load the Sound with XMLHttpRequest
    fetchSound.open("GET", url, true); // Path to Audio File
    fetchSound.responseType = "arraybuffer"; // Read as Binary Data
    fetchSound.onload = function() {
        context.decodeAudioData(fetchSound.response, doAfterLoading, onDecodeAudioDataError);
    }
    fetchSound.send();
}





let myFilez = []
let myFilez1 = []
let myGrainPlayer;

function playGrainSounds() {
    let rand1 = Math.floor(Math.random() * myFilez1.length)
    console.log(myFilez1[rand1])
    console.log(rand1)
    myGrainPlayer = new tone.GrainPlayer(myFilez1[rand1], () => {
        myGrainPlayer.start()
    })
    myGrainPlayer.grainSize = 0.1;
    myGrainPlayer.overlap = 0.9;
    //myGrainPlayer.loop = true;
    myGrainPlayer.reverse = true;
    myGrainPlayer.fadeIn = 0.5;
    myGrainPlayer.fadeOut = 0.5
    myGrainPlayer.connect(encoder.in)
    setAzim()
}


function playMoreSounds() {
    // for (i=0; i< myNumArray.length; i++) {
    // loadSample((myNumArray[i]),assignSample2SoundBuffer);
    let rand = Math.floor(Math.random() * myFilez.length)
    loadSample(myFilez[rand], assignSample2SoundBuffer);
    let rand1 = Math.floor(Math.random() * myFilez.length)
    loadSample(myFilez[rand1], assignSample2SoundBuffer1);
    let rand2 = Math.floor(Math.random() * myFilez.length)
    loadSample(myFilez[rand2], assignSample2SoundBuffer2);
    let rand3 = Math.floor(Math.random() * myFilez.length)
    loadSample(myFilez[rand3], assignSample2SoundBuffer3);
   
            //grain.toDestination()
            console.log(encoder.azim)
            sound = context.createBufferSource();
            sound1 = context.createBufferSource()
            sound2 = context.createBufferSource()
            sound3 = context.createBufferSource()

            console.log(sound)
    
            //encoder.azim = -180;
            sound.buffer = soundBuffer;
            sound1.buffer = soundBuffer1;
            sound2.buffer = soundBuffer2;
            sound3.buffer = soundBuffer3;
            //sound.loop = true;
            sound.fadeIn = 0.05
            sound.fadeOut = 0.05
            
            sound.connect(encoder.in);
            sound.start(0);
            //sound1.fadeIn = 0.05
            sound1.fadeOut = 0.05
    

            sound1.connect(encoder.in);
            //sound1.start(0)
  
            //myGrainPlayer.buffer = soundBuffer1
      
            sound.isPlaying = true;
            sound1.isPlaying = true;
            //player.connect(encoder.in)
            // document.getElementById('play1').disabled = true;
            // document.getElementById('stop').disabled = false;
            
    
    //console.log(myNumArray[i])
    
    }

function playOneSound() {
    let rand = Math.floor(Math.random() * myFilez.length)
    loadSample(myFilez[rand], assignSample2SoundBuffer);
            setAzim()
            console.log(encoder.azim)
            sound = context.createBufferSource();
            sound.buffer = soundBuffer;
            sound.fadeIn = 0.05
            sound.fadeOut = 0.05
            sound.connect(encoder.in);
            sound.start(0);
            sound.isPlaying = true;
}




// function to change sample from select box
function changeSample() {
    //document.getElementById('play').disabled = true;
   // document.getElementById('stop').disabled = true;

    for (a=0; a<myNumArray.length; i++) {
    soundUrl = document.getElementById("sample_no").value;
       // soundUrl = myNumArray[]
    }

    if (typeof sound != 'undefined' && sound.isPlaying) {
        sound.stop(0);
        sound.isPlaying = false;
    }
   
 


}
// Define mouse drag on spatial map .png local impact

let randAzim = Math.random() * 360

function setAzim() {
    let randAzim = Math.random() * 360
    encoder.azim = randAzim;
    encoder.updateGains()
}

function mouseActionLocal(angleXY) {
    encoder.azim = angleXY[0];
    encoder.elev = angleXY[1];
    encoder.updateGains();
}

function drawLocal() {
    // Update audio analyser buffers
    analyser.updateBuffers();
    var params = analyser.computeIntensity();
    updateCircles(params, canvas);
}

let myVariable = "hello"

window.onload = () => {
    const getButton = document.querySelector("#getSamples")
    getButton.addEventListener("click", makeList)
  
}



//let myNum1 = 0;

  socket.on('send-back', (data) => {
    console.log(data)
    myNum1 = data
  })

document.addEventListener('keydown', (e)=> {
    if (e.key == "l") {
        socket.emit('sendBack', true)
        console.log("l")
        socket.emit('sendFileName', true)
    } else if (e.key == "s") {
        socket.emit('sendFileName1', true)
        console.log("2go")
    }
})

//let listButton = document.getElementById("updateList");
//listButton.addEventListener('click', updateList)

function updateList() {
    socket.emit('sendBack', true)
    console.log("l")
    socket.emit('sendFileName', true)
}


socket.on('send-FN', (data) => {
    myFilez = data
    console.log(myFilez)
  })

  socket.on('send-FN1', (data) => {
    myFilez1 = data;
    console.log(myFilez1)
  })




// function getTheSamples() {
//     // myNum = localStorage.getItem("PLAYER");
//     // myNum1 = Number(myNum)
//     // 
//     //myNum1 = myCount;
//     console.log(myNum1)
//     makeList()
// }







//$.holdReady( true ); // to force awaiting on common.html loading

function makeList() {

    // adapt common html elements to specific example
    //document.getElementById('div-mirror').outerHTML = '';
 
    // update sample list for selection
    // var sampleList = { 
    // };
   
    // for (i=(myNumArray.length); i<myNum1; i++) {
    //     let mySample = i + ".mp3"
    //     sampleList['whisper' + i]  = "http://127.0.0.1:3003/uploads/whisper_Sample" + mySample
    //     let sampleLink = "http://127.0.0.1:3003/uploads/whisper_Sample" + mySample
    //     //console.log("hello")
    //     myNumArray.push(sampleLink)
    //     //console.log(myNumArray)
    // }

    

    // var $el = $("#sample_no");
    // $el.empty(); // remove old options
    // $.each(sampleList, function(key,value) {
    //      $el.append($("<option></option>")
    //                 .attr("value", value).text(key));
    //      });

    

    // set speaker position element
    setSpkPosContainer = document.getElementById('div-decoder');
    //setSpkPosContainer.innerHTML = "<p> Set speaker pos (spherical coords: azim1, elev1, dist1, ... azimN, elevN, distN ):<span id='decoder-value'></span> &nbsp; </p>";
    var input = document.createElement("input");
    input.type = "text";
    input.setAttribute("id", 'spkpos');
    input.setAttribute("value", decoder.speakerPos);
    input.setAttribute("size", 100);
    input.style.visibility = "hidden"
    setSpkPosContainer.appendChild(input); // put it into the DOM
    //var button = document.createElement("button");
    // button.setAttribute("id", 'spkButton');
    // button.innerHTML = 'set';
    // button.addEventListener('click', () => {
    //     let str = document.getElementById('spkpos').value;
    //     let tmp = str.split(",");
    //     if( tmp.length % 0 > 0 ){
    //         alert('wrong format (must be multiple of 3, for a, e, d values');
    //         return;
    //     }
    //     let spkPos = []
    //     for( let i = 0; i<tmp.length / 3; i++ ){
    //         spkPos.push( [ Number(tmp[3*i]), Number(tmp[3*i+1]), Number(tmp[3*i+2])] );
    //     }
    //     decoder.speakerPos = spkPos;
    //     decoder.out.connect(gainOut);
    //     document.getElementById('spkpos').value = decoder.speakerPos;
        
    // })
    // setSpkPosContainer.appendChild(button); // put it into the DOM

    // Init event listeners
    // document.getElementById('play').addEventListener('click', function() {
    //     setAzim()
    //     console.log(encoder.azim)
    //     sound = context.createBufferSource();
    //     //encoder.azim = -180;
    //     sound.buffer = soundBuffer;
    //     //sound.loop = true;
    //     sound.connect(encoder.in);
    //     sound.start(0);
    //     sound.isPlaying = true;
    //     document.getElementById('play').disabled = true;
    //     document.getElementById('stop').disabled = false;

    // });


    // document.getElementById('stop').addEventListener('click', function() {
    //     sound.stop(0);
    //     sound.isPlaying = false;
    //     document.getElementById('play').disabled = false;
    //     document.getElementById('stop').disabled = true;
    // });

    // Order control buttons
    orderValue.innerHTML = maxOrder;
    var orderButtons = document.getElementById("div-order");
    for (var k=1; k<=3; k++) {
        var button = document.createElement("button");
        button.setAttribute("id", 'N'+k);
        button.setAttribute("value", k);
        button.innerHTML = 'N'+k;
        button.addEventListener('click', function() {
            orderOut = parseInt(this.value);
            //orderOut = 3;
            orderValue.innerHTML = orderOut;
            limiter.updateOrder(orderOut);
            limiter.out.connect(decoder.in);
        });
        orderButtons.appendChild(button);
        
    }
    
};
