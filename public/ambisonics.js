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
let soundBuffer3, sound3;
let soundBuffer4, sound4;
let info = "hello"

var socketName = 'ambisonic';
var socket = io(); 

let myNum;
let myNum1;
let myNumArray = []
let myFFT;

async function startAudio() {  //This code starts the audio 
    await Tone.start()
    console.log("ready")
    // loadSounds()
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
var encoder1 = new ambisonics.monoEncoder(context, maxOrder);
var encoder2 = new ambisonics.monoEncoder(context, maxOrder);
var encoder3 = new ambisonics.monoEncoder(context, maxOrder);
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
   // setAzim()
    soundBuffer = decodedBuffer;
    //document.getElementById('play').disabled = false;
   
}

var assignSample2SoundBuffer1 = function(decodedBuffer) {
    // setAzim()
    soundBuffer1 = decodedBuffer;
    //document.getElementById('play').disabled = false;
    
}

var assignSample2SoundBuffer2 = function(decodedBuffer) {
    // setAzim()
    soundBuffer2 = decodedBuffer;
    //document.getElementById('play').disabled = false;
    
}

var assignSample2SoundBuffer3 = function(decodedBuffer) {
    // setAzim()
    soundBuffer3 = decodedBuffer;
    //document.getElementById('play').disabled = false;
    
}

var assignSample2SoundBuffer4 = function(decodedBuffer) {
    // setAzim()
    soundBuffer4 = decodedBuffer;
    //document.getElementById('play').disabled = false;
    
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
let myGrainPlayer1;
let myGrainPlayer2;

function playGrainSounds() {
    setAzim()
    let rand1 = Math.floor(Math.random() * myFilez1.length)
    //console.log(myFilez1[rand1])
    console.log(rand1)
    myGrainPlayer = new tone.GrainPlayer(myFilez1[rand1], () => {
        myGrainPlayer.start()
    })
    myGrainPlayer.grainSize = 0.9;
    myGrainPlayer.overlap = 2.9;
    //myGrainPlayer.loop = true;
    myGrainPlayer.reverse = true;
    myGrainPlayer.fadeIn = 0.5;
    myGrainPlayer.fadeOut = 0.5
    myGrainPlayer.connect(encoder.in)
}

function playMoreGrainSounds() {
    setAzim()
    let rand1 = Math.floor(Math.random() * myFilez1.length)
    //console.log(myFilez1[rand1])
    console.log(rand1)
    myGrainPlayer1 = new tone.GrainPlayer(myFilez1[rand1], () => {
        myGrainPlayer1.start()
    })
    myGrainPlayer1.grainSize = 2.0;
    myGrainPlayer1.overlap = 0.7;
    //myGrainPlayer.loop = true;
    myGrainPlayer1.reverse = true;
    myGrainPlayer1.fadeIn = 0.5;
    myGrainPlayer1.fadeOut = 0.5
    myGrainPlayer1.connect(encoder.in)
}

function playMoreGrainSounds1() {
    setAzim()
    let rand1 = Math.floor(Math.random() * myFilez1.length)
    //console.log(myFilez1[rand1])
    console.log(rand1)
    myGrainPlayer2 = new tone.GrainPlayer(myFilez1[rand1], () => {
        myGrainPlayer2.start()
    })
    myGrainPlayer2.grainSize = 0.7;
    myGrainPlayer2.overlap = 1.5;
    //myGrainPlayer.loop = true;
    myGrainPlayer2.reverse = true;
    myGrainPlayer2.fadeIn = 0.7;
    myGrainPlayer2.fadeOut = 0.7;
    myGrainPlayer2.connect(encoder.in)
   
}

async function playGrains() {
    playGrainSounds();
    playMoreGrainSounds()
    playMoreGrainSounds1()
}


function loadSounds() {
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





    
}

let whichSample = 0;

//let norm = new Tone.Normalize(0,5);
//norm.toDestination()

function playMoreSounds() {
   
    // for (i=0; i< myNumArray.length; i++) {
    // loadSample((myNumArray[i]),assignSample2SoundBuffer);

    if (whichSample == 0) {
        setAzim()
       // sound.stop()
        let rand = Math.floor(Math.random() * myFilez.length)
        loadSample(myFilez[rand], assignSample2SoundBuffer);
        sound = context.createBufferSource();
        sound.buffer = soundBuffer;
        sound.fadeIn = 0.09
        sound.fadeOut = 0.09
        sound.connect(encoder.in);
        whichSample++
        sound.start(0);
        console.log(encoder.azim)

    } else if (whichSample == 1) {
        setAzim(1)
    //sound1.stop()
    let rand1 = Math.floor(Math.random() * myFilez.length)
    loadSample(myFilez[rand1], assignSample2SoundBuffer1);
    sound1 = context.createBufferSource()
    sound1.fadeIn = 0.09
    sound1.fadeOut = 0.09
    sound1.connect(encoder.in);
 
    sound1.buffer = soundBuffer1;

    whichSample++
    sound1.start(0)
    console.log(encoder1.azim)

    } else if (whichSample == 2) {

        setAzim(2)
       // sound2.start()
        let rand2 = Math.floor(Math.random() * myFilez.length)
        loadSample(myFilez[rand2], assignSample2SoundBuffer2);
        sound2 = context.createBufferSource()
        
       
        sound2.buffer = soundBuffer2;
        sound2.fadeIn = 0.09
        sound2.fadeOut = 0.09
        sound2.connect(encoder.in);
   
    
        whichSample++
        sound2.start(0)
        console.log(encoder2.azim)

    } else if (whichSample == 3) {
        setAzim(3)
        //sound3.stop()
        let rand3 = Math.floor(Math.random() * myFilez.length)
        loadSample(myFilez[rand3], assignSample2SoundBuffer3);
        sound3 = context.createBufferSource()
        sound3.buffer = soundBuffer3;

        sound3.fadeIn = 0.09
        sound3.fadeOut = 0.09
        sound3.connect(encoder.in);
        whichSample = 0
        sound3.start(0)
        console.log(encoder3.azim)


    } 
      

  
    
  
 
    // console.log(rand, rand1, rand2)
            //grain.toDestination()
            //console.log(encoder.azim)
            // sound = context.createBufferSource();
            // sound1 = context.createBufferSource()
            // sound2 = context.createBufferSource()
            // sound3 = context.createBufferSource()

            // console.log(sound)
    
            // //encoder.azim = -180;
            // sound.buffer = soundBuffer;
            // sound1.buffer = soundBuffer1;
            // sound2.buffer = soundBuffer2;
            // sound3.buffer = soundBuffer3;
            //sound.loop = true;
            

          


            //sound1.start(0)
  
            //myGrainPlayer.buffer = soundBuffer1
      
            // sound.isPlaying = true;
            // sound1.isPlaying = true;
            // encoder.setAzim = 30;
            // encoder.updateGains()
            //player.connect(encoder.in)
            // document.getElementById('play1').disabled = true;
            // document.getElementById('stop').disabled = false;
            
    
    //console.log(myNumArray[i])
    
    }

function playSoundsSpaced() {

    setAzim()
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
    let rand4 = Math.floor(Math.random() * myFilez.length)
    loadSample(myFilez[rand4], assignSample2SoundBuffer4);
    // console.log(rand, rand1, rand2)
    let bf = context.createBufferSource()
            //grain.toDestination()
            console.log(encoder.azim)
            sound = bf
            sound1 = context.createBufferSource()
            sound2 = context.createBufferSource()
            sound3 = context.createBufferSource()
            sound4 = context.createBufferSource()

            console.log(sound)
    
            //encoder.azim = -180;
            sound.buffer = soundBuffer;
            sound1.buffer = soundBuffer1;
            sound2.buffer = soundBuffer2;
            sound3.buffer = soundBuffer3;
            sound4.buffer = soundBuffer4;
            //sound.loop = true;

            sound.fadeIn = 0.09
            sound.fadeOut = 0.09
            sound.connect(encoder.in);


            sound.start(0);

            sound1.fadeIn = 0.09
            sound1.fadeOut = 0.09
            sound1.connect(encoder.in);

            setTimeout(() => {
                sound1.start(0)
            }, 1000)
        

            sound2.fadeIn = 0.09
            sound2.fadeOut = 0.09
            sound2.connect(encoder.in);
            setTimeout(() => {
                sound2.start(0)
            }, 1700)
            sound3.fadeIn = 0.09
            sound3.fadeOut = 0.09
            sound3.connect(encoder.in);
            setTimeout(() => {
                sound3.start(0)
            }, 2500)

            sound4.fadeIn = 0.09
            sound4.fadeOut = 0.09
            sound4.connect(encoder.in);
            setTimeout(() => {
                sound4.start(0)
            }, 3600)

            //sound1.start(0)
  
            //myGrainPlayer.buffer = soundBuffer1
      
            sound.isPlaying = true;
            sound1.isPlaying = true;

}




const meter = new Tone.Meter();

let n = 0;
document.addEventListener('keydown', (e) => {
    if (e.key == "1") {
        playOneSound()
    } else if (e.key == "2") {
        playMoreSounds()
    } else if (e.key == "3") {
        let myInt = setInterval(() => {
            playOneSound()
            n++
            if (n >= 15) {
                clearInterval(myInt)
            }
        } ,3000
             

        )
    } 
})

let myList = updateList

setInterval(myList, 5000);

//info = new Tone.Buffer(myFilez[myFilez.length - 1]);



function printAudio() {

let getLink = myFilez[myFilez.length = 1];
let slicedLink = getLink.slice(1, getLink.length);
let fullLink = "https://whisper.treyanash.com" + slicedLink
console.log(fullLink)
let myBuff = new Tone.Buffer(fullLink);


if (myFilez.length >= 1) {
    console.log(myBuff.duration)
    console.log(myBuff.length)
    
}

}


function playOneSound() {
    setAzim()
    let rand = Math.floor(Math.random() * myFilez.length)
    loadSample(myFilez[rand], assignSample2SoundBuffer);
            console.log(encoder.azim)
            sound = context.createBufferSource();
            sound.buffer = soundBuffer;
            sound.fadeIn = 0.09
            sound.fadeOut = 0.09
           
            sound.connect(encoder.in);
            sound.start(0);

            //sound.isPlaying = true;
           // myFFT = new Tone.FFT(128)
            //myFilez[rand].connect(myFFT)
            //console.log(myFilez[rand].connect(myFFT))
            //console.log(sound.connect(myFFT)
           
            //console.log(meter.getValue())
            
            
}




// function to change sample from select box
// function changeSample() {
//     //document.getElementById('play').disabled = true;
//    // document.getElementById('stop').disabled = true;

//     for (a=0; a<myNumArray.length; i++) {
//     soundUrl = document.getElementById("sample_no").value;
//        // soundUrl = myNumArray[]
//     }

//     if (typeof sound != 'undefined' && sound.isPlaying) {
//         sound.stop(0);
//         sound.isPlaying = false;
//     }
   
 


// }
// // Define mouse drag on spatial map .png local impact

let randAzim = Math.random() * 360

// let myAzim;

function setAzim(encoderNumber = 0) {
    let randAzim = Math.random() * 360
    // console.log(marker.innerHTML)
    // myAzim = Number(marker.innerHTML)
    if (!encoderNumber) {
        encoder.azim = randAzim
        encoder.updateGains()
    } else if (encoderNumber == 1) {
        encoder1.azim = randAzim
        encoder1.updateGains()
    } else if (encoderNumber == 2) {
        encoder2.azim = randAzim
        encoder2.updateGains()
    } else if (encoderNumber == 3) {
        encoder3.azim = randAzim
        encoder3.updateGains()
    }
    
    
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
    //console.log(data)
    myNum1 = data
  })

document.addEventListener('keydown', (e)=> {
    if (e.key == "l") {
        socket.emit('sendBack', true)
        console.log("l")
        socket.emit('sendFileName', true)
        myList = updateList
    } else if (e.key == "s") {
        socket.emit('sendFileName1', true)
        console.log("2go")
       

    }
})

//let listButton = document.getElementById("updateList");
//listButton.addEventListener('click', updateList)

function updateList() {
    socket.emit('sendBack', true)
    socket.emit('sendFileName', true)
  
}

function updateList1() {
    socket.emit('sendBack1', true)
    socket.emit('sendFileName1', true)
}

let myFilez2;

socket.on('send-FN', (data) => {
    myFilez = data
    if (myList != updateList) {
      socket.off('send-FN')
      console.log("I can't hear you!")
    }
    // console.log(myFilez)
  })

  socket.on('send-FN1', (data) => {
    myFilez1 = data;
    myList = updateList1
    //console.log(myFilez1)
    console.log("getting in message back");


   
  })










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
    //

    

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
    //orderValue.innerHTML = maxOrder;
    var orderButtons = document.getElementById("div-order");
    for (var k=1; k<=3; k++) {
        var button = document.createElement("button");
        button.setAttribute("id", 'N'+k);
        button.setAttribute("value", k);
        button.innerHTML = 'N'+k;
        button.addEventListener('click', function() {
            orderOut = parseInt(this.value);
            //orderOut = 3;
            //orderValue.innerHTML = orderOut;
            limiter.updateOrder(orderOut);
            limiter.out.connect(decoder.in);
        });
        orderButtons.appendChild(button);
        button.classList.add("buttonClass4")
        
    }
    
};
