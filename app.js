let express = require("express");
let app = express();
let http = require("http");
let server = http.createServer(app);
let { Server } = require("socket.io");
let io = new Server(server);
let usernames = {};

app.use(express.static("public"));

//timer
let countdownTimer;

//prompt
let parsePrompt;
let promptData;
let randomPrompt;
let selectedPrompt;

//submissions
let dataUrl;

//pull prompt data here so same prompt gets sent to all clients
const fs = require('fs');
const filePath = 'public/prompts.json';

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading JSON file:', err);
    return;
  }
  parsePrompt = JSON.parse(data);
  promptData = parsePrompt.prompts;
  console.log(promptData);
  randomPrompt = Math.floor(Math.random() * promptData.length); //generating random number for prompt
  console.log("prompt number: " + randomPrompt)
  selectedPrompt = promptData[randomPrompt];
  console.log(selectedPrompt);
});

io.on('connection', (socket) => {
  console.log("a user connected");


  socket.on('username', (username) => {
    console.log(`Username received: ${username}`);
    usernames[socket.id] = username;
  });

  if (!countdownTimer) {
    // start the countdown when the first client connects
    startCountdown();
  }

  socket.on('username', (username) => {
    usernames[socket.id] = username;
  });

  socket.on('submitData', (data) => {
    console.log(`Username: ${data.username} submitted an image.`);
    io.emit('submittedData', data);
  });

  // Emit prompt to all clients
  io.emit('prompt', selectedPrompt);

  // Emit the current countdown value to all clients
  io.emit('countdown', getCountdown());

  // Receive screenshot data
  socket.on('screenshot', (data) => {
    // Include the username in the data
    dataUrl = { username: usernames[socket.id], image: data };
    io.emit('submitted', dataUrl);
  });

  socket.on('disconnect', () => {
    console.log("user disconnected");
    // Stop the countdown if the last client disconnects
    // if (io.sockets.sockets.size <= 3) {
    //   restartCountdown();
    // }
  });
});


function startCountdown() {
  let countdown = 20;

  countdownTimer = setInterval(() => {
    io.emit('countdown', countdown);

    if (countdown === 0) {
      stopCountdown();
    } else {
      countdown--;
    }
  }, 1000); 
}

function stopCountdown() {
  clearInterval(countdownTimer);
  countdownTimer = null;
  io.emit('countdown', 0);
  io.emit('redirect', '/gameplay.html'); //TESTING ONLY
  // if (io.sockets.sockets.size < 3) { //ACTIVATE FOR FINAL
  //   startCountdown();
  // } else {
  //   io.emit('redirect', '/gameplay.html');
  // } 
}

// function restartCountdown(){
//   startCountdown();
// }

function getCountdown() {
  return countdownTimer ? countdownTimer._idleTimeout / 1000 : 20;
}

let port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("Server listening on localhost: " + port);
});
