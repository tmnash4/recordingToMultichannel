// QuickRecord and Upload
// Jesse Allison 2023

const multer = require('multer') //use multer to upload blob data
const bodyParser = require('body-parser');
const upload = multer(); // set multer to be the upload variable (just like express, see above ( include it, then use it/set it up))
const fs = require('fs'); //use the file system so we can save files

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

var express = require('express');
var http = require('http');
var serverPort = process.env.PORT || 3002;
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

// start socket.io listening on the server
const io = new Server(server);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// *** adding in audio file upload...
let fileNameEnd = 1
app.post('/upload', upload.single('soundBlob'), function(req, res, next) {
  console.log('upload', req.file); // see what got uploaded
  let uploadLocation = __dirname + '/public/uploads/' + req.file.originalname + fileNameEnd + ".wav" // where to save the file to. make sure the incoming name has a .wav extension

  fs.writeFileSync(uploadLocation, Buffer.from(new Uint8Array(req.file.buffer))); // write the blob to the server as a file
  res.sendStatus(200); //send back that everything went ok
  console.log("Seems to have uploaded...", req.body.id, req.body.user, req.file.originalname);

  mp3(req.file.originalname);
    ambiSocket.emit('newFile', {'fileName': req.file.originalname + fileNameEnd})
    fileNameEnd++
  // Could transmit the load sample from here:
  // hub.transmit('sample', null, { 'user': req.body.user, 'val': 'load', 'sample': true, 'url': req.file.originalname + '.mp3', 'id': req.body.id });
  
})


// Could spin off into it's own node app or spork a thread.
function mp3(fileName) {
  console.log('MP3: ', fileName);
  try {
    let process = new ffmpeg(__dirname + '/public/uploads/' + fileName + fileNameEnd + ".wav");
    // console.log('process: ', process);
    process.then(function(audio) {
      // callback mode
      audio.setAudioBitRate(128);
      // console.log('Audio', audio);
      audio.fnExtractSoundToMP3(__dirname + '/public/uploads/' + fileName + fileNameEnd + ".mp3", function(error, file) {
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
  // console.log('done mp3');
};

let ambiSocket;

io.on('connection', (socket) => {
  socket.on('register', (data)=> {
    if (data == 'ambisonic') {
      ambiSocket = socket
    } 
    // if (data) {
    //   ambiSocket = socket
    // }
  })


})