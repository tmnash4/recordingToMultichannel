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

app.use('viewuploads', serveIndex(__dirname + '/uploads'));

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
  console.log('upload', req.file); // see what got uploaded
  let uploadLocation = __dirname + '/public/uploads/' + req.file.originalname + ".wav" // where to save the file to. make sure the incoming name has a .wav extension

  fs.writeFileSync(uploadLocation, Buffer.from(new Uint8Array(req.file.buffer))); // write the blob to the server as a file
  res.sendStatus(200); //send back that everything went ok
  console.log("Seems to have uploaded...", req.body.id, req.body.user, req.file.originalname);
  //fileNameEnd++
  mp3(req.file.originalname);
  //index.emit('newFile', {'fileName': req.file.originalname})
  //ambiSocket.emit('newFile', {'fileName': req.file.originalname})
  fileNameArray.push(req.file.originalname);
 
  
  // Could transmit the load sample from here:
  // hub.transmit('sample', null, { 'user': req.body.user, 'val': 'load', 'sample': true, 'url': req.file.originalname + '.mp3', 'id': req.body.id });
  
})
let counter = 0;
let fileName2 = [];
let fileName3 = [];


// Could spin off into it's own node app or spork a thread.
function mp3(fileName) {
//   console.log(fileNameArray)
//  for (f=0; f< fileNameArray.length; f++) {
//     let myVar = fileNameArray[f].slice(14, 15);
//     console.log(myVar + "heheh")
//  }
//   console.log(fileNameArray[f])
  console.log('MP3: ', fileName);
  try {
    let process = new ffmpeg(__dirname + '/public/uploads/' + fileName  + ".wav");
    // console.log('process: ', process);
    process.then(function(audio) {
      // callback mode
      audio.setAudioBitRate(128);
      // console.log('Audio', audio);
      audio.fnExtractSoundToMP3(__dirname + '/public/uploads/' + fileName  + ".mp3", function(error, file) {
        if (!error) {
          console.log('Audio file: ', file);
        } else {
          console.log('Extraction Error: ', error);
        }
      });
    }, function(err) {
      console.log('Error encoding mp3: ', err);
    })
  } catch (e) {
    console.log('Error: ', e.code);
    console.log(e.msg);
  }

  let fileName1 = "./uploads/" + fileName  + ".mp3"
  fileName2.push(fileName1)
  //fileName3.push()
  console.log(fileName1)
  console.log(fileName2)

  if (counter == "3") {
    fileName3.push(fileName1)
  }

  // console.log('done mp3');
};

let i = 0;
let ambiSocket;
let index;
let idArray = []
let numberOfAudioFiles = [];
let myCount;
let myCount1;
let fileName = [];

let recordState = {
  section: "start"
}

io.on('connection', (socket) => {
  socket.on('register', (data)=> {
    if (data == 'ambisonic') {
      ambiSocket = socket
    } 
    socket.on('counter', (data) => {
      console.log(data)
      //numberOfAudioFiles.push(data)
      myCount1 = numberOfAudioFiles.length 
    })
   
    socket.on('sendBack', () => {
      socket.emit('send-back', myCount1)
    })

    socket.on('sendBack1', () => {
      socket.emit('send-back', myCount1)
    })

    socket.on('sendFileName', () => {
      //fileName.split(',')
      socket.emit('send-FN', fileName2)
    })

    socket.on('sendFileName1', () => {
      //fileName.split(',')
      counter = 3
      socket.emit('send-FN1', fileName3)
    })

  

    //for (i=0; i < fileCount; i++) {
   
  
    // if (data) {
    //   ambiSocket = socket
    // }
  })
  
  // console.log(socket.id)
 
  // socket.id = i 
  // idArray.push(socket.id);
  // i++


  // socket.on("connect", () => {
  //   console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  // })
  // socket.emit("room", 1)
  // socket.join('room1')
  // console.log("room1")
})

io.on('connection', (socket1) => {
  socket1.on('register', (data)=> {
    if (data == 'index') {
      index = socket1
    }

    
    //for (i=0; i < fileCount; i++) {
    //   socket1.on('file-count', () => {
    //   // socket1.emit('send-count', fileCount)
    //   console.log(fileCount)
    // })
  

    socket1.on('counter', (data) => {
      console.log(data)
      numberOfAudioFiles.push(data)
      myCount = numberOfAudioFiles.length 

     
    })
   
    socket1.on('sendBack', () => {
      socket1.emit('send-back', myCount)
    })

    socket1.on('file-name', (data) => {
      fileName.push(upload.originalname)
      console.log(fileName)
    })

    socket1.on("begin", () => {
      // socket.broadcast.emit("end_piece", true);
       recordState.section = "startRecording";
       io.emit("set_section", recordState.section)

   })

   socket1.on("sec2", () => {
    // socket.broadcast.emit("end_piece", true);
     recordState.section = "secondSection";
     io.emit("set_section", recordState.section)

 })
   socket1.emit("set_section", recordState.section)
  })

})

