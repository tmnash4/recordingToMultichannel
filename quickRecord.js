// QuickRecord and Upload
// Jesse Allison 2023

const multer = require('multer') //use multer to upload blob data
const bodyParser = require('body-parser');
const upload = multer(); // set multer to be the upload variable (just like express, see above ( include it, then use it/set it up))
const fs = require('fs'); //use the file system so we can save files
const directoryPath = 'public/uploads';
//const files = fs.readdirSync(directoryPath);
//let fileCount = files.length;



// setInterval(countFiles, 1000)

//console.log(`There are ${fileCount} files in the directory.`);

const { Server } = require('socket.io');
var publicFolder = __dirname + '/public';

let ffmpeg = require('ffmpeg');

// Polyfill for Objects.entries
// FIXME: didn't seem to work on the Heroku server. 
if (!Object.entries) {
  Object.entries = function( obj ){
    var ownProps = Object.keys( obj ),
        i = ownProps.length,
        resArray = new Array(i); // preallocate the Array
    while (i--)
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    
    return resArray;
  };
}

// var serverPort = process.env.PORT || SERVER_PORT;
var serveIndex = require('serve-index')
var express = require('express');
var http = require('http');
var serverPort = process.env.PORT || 3003;
console.log("Port: " + serverPort);

var app = express();
app.use(express.static(publicFolder));
console.log(publicFolder);
let date = new Date()

// server is the node server (web app via express)
// this code can launch the server on port 80 and switch the user id away from sudo
// apparently this makes it more secure - if something goes awry it isn't running under the superuser.
var server = http.createServer(app)
  .listen(serverPort, function(err) {
    if (err) return cb(err);

    var uid = parseInt(process.env.SUDO_UID); // Find out which user used sudo through the environment variable
    if (uid) process.setuid(uid); // Set our server's uid to that user
    console.log('Server\'s UID is now ' + process.getuid());
  });
//showing files
fs.readdir(directoryPath, (err, files) => {
  if(err) {
    return console.log(err)
  }
  
  files.forEach((file) => {
    console.log(file)
  })
})

app.use('viewuploads', serveIndex(__dirname + directoryPath));

// app.get('/viewuploads', (req, res) => {
//   const files = fs.readdirSync(path.join(__dirname, directoryPath));
//   res.render('index', {files});
// })



// start socket.io listening on the server
const io = new Server(server);

let fileNameArray = [];



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// *** adding in audio file upload...
//let fileNameEnd = 0
app.post('/upload', upload.single('soundBlob'), function(req, res, next) {
  console.log('upload', req.file);

  let savedName = req.file.originalname + ".wav";
  let uploadLocation = __dirname + '/public/uploads/' + savedName;

  fs.writeFileSync(uploadLocation, Buffer.from(new Uint8Array(req.file.buffer)));

  console.log("Seems to have uploaded...", req.body.id, req.body.user, req.file.originalname);

  // Keep your mp3 conversion if you still want it
  mp3(req.file.originalname);

  // This is the important part:
  // public/uploads is served by express.static(publicFolder),
  // so the browser URL should be /uploads/filename.wav
  let fileUrl = "/uploads/" + savedName;

  if (!fileName2.includes(fileUrl)) {
    fileName2.push(fileUrl);
  }

  console.log("Current audio files:", fileName2);

  // Send updated file list to any player that is listening
  io.emit("loadAudio", fileName2);

  res.sendStatus(200);
});
let counter = 0;
let fileName3 = [];


function mp3(fileName) {
  console.log('MP3: ', fileName);

  try {
    let process = new ffmpeg(__dirname + '/public/uploads/' + fileName  + ".wav");

    process.then(function(audio) {
      audio.setAudioBitRate(128);

      audio.fnExtractSoundToMP3(__dirname + '/public/uploads/' + fileName  + ".mp3", function(error, file) {
        if (!error) {
          console.log('Audio file: ', file);
        } else {
          console.log('Extraction Error: ', error);
        }
      });
    }, function(err) {
      console.log('Error encoding mp3: ', err);
    });
  } catch (e) {
    console.log('Error: ', e.code);
    console.log(e.msg);
  }
}

let i = 0;
let ambiSocket;
let index;
let idArray = []
let numberOfAudioFiles = [];
let myCount;
let myCount1;
let fileName = [];

let recordState = {
  // section: "zero"
}

let whisperSection = {
  section: "zero"
};

let fileName2 = [];


io.on('connection', (socket) => {
  console.log("socket connected:", socket.id);

  socket.on('register', (data) => {
    console.log("registered:", data);

    if (data === 'ambisonic' || data === 'player') {
      ambiSocket = socket;
    }

    if (data === 'index') {
      index = socket;
    }

    // Send the current section to new audience pages.
    // Since default is now "zero", index pages should not jump to section four.
    socket.emit("set_section", whisperSection.section);
  });

  socket.on('correctNumber', (data) => {
    myCount = data;
    console.log(data);
    socket.emit('correct-number', data);
  });

  socket.on('counter', (data) => {
    console.log("counter:", data);
    numberOfAudioFiles.push(data);
    myCount = numberOfAudioFiles.length;
  });

  socket.on('sendBack', () => {
    socket.emit('send-back', myCount);
  });

  socket.on('sendBack1', () => {
    socket.emit('send-back', myCount);
  });

  socket.on('sendFileName', () => {
    socket.emit('send-FN', fileName2);
  });

  // IMPORTANT:
  // This now ONLY sends audio files.
  // It does NOT change the section.
  socket.on('sendFileName1', () => {
    console.log("sending files from sendFileName1:", fileName2);
    socket.emit("loadAudio", fileName2);
  });

  // Also support this event name, since your server already had it.
  socket.on("load_audio", () => {
    console.log("sending files from load_audio:", fileName2);
    socket.emit("loadAudio", fileName2);
  });

  socket.on("play_audio", () => {
    io.emit("playAudio", true);
  });

  // Simple universal section handler for the player/control page
  socket.on("set_section", (sectionName) => {
    whisperSection.section = sectionName;
    console.log("section set to:", sectionName);
    io.emit("set_section", sectionName);
  });

  // Older section event names, kept for compatibility

  socket.on('resetMode', () => {
    whisperSection.section = "zero";
    io.emit("set_section", "zero");
  });

  socket.on('startSec', () => {
    whisperSection.section = "one";
    io.emit("set_section", "one");
  });

  socket.on('sec1', () => {
    whisperSection.section = "two";
    io.emit("set_section", "two");
  });

  socket.on("justListen", () => {
    whisperSection.section = "three";
    io.emit("set_section", "three");
  });

  socket.on("sec2", () => {
    whisperSection.section = "four";
    io.emit("set_section", "four");
  });

  socket.on("secEnd", () => {
    whisperSection.section = "five";
    io.emit("set_section", "five");
  });

  socket.on("end", () => {
    whisperSection.section = "six";
    io.emit("set_section", "six");
  });
});

