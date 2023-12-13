// Initialize the Image Classifier method with MobileNet. A callback needs to be passed.
let mobilenet;

//establish connection to server
let socket = io();

// A variable to hold the image we want to classify
let img;
let video;
let label = "";
let confidence = "";
let displayed;

let promptData;
let promptWord;
let accepted;
let trigger = false;
let matchFound = false;
let green = false; // match variable
let screenshotTaken = false;

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("prompt", (data) => {
  promptWord = data.term;
  accepted = data.accepted;
  trigger = true;
});

// socket.on("username", (data) => {
//   console.log("got it!!");
// });

function modelReady() {
  console.log("Model ready");
  mobilenet.predict(gotResult);
}

// A function to run when we get any errors and the results
function gotResult(error, results) {
  // Display error in the console
  if (error) {
    console.error(error);
  } else {
    // The results are in an array ordered by confidence.
    let resultLabel = results[0].label;
    label = resultLabel.split(", ")[0];
    confidence = round(results[0].confidence * 100, 2);

    if (confidence > 40) {
      displayed = label + ", " + confidence;

      for (let i = 0; i < accepted.length; i++) {
        //length of prompt accepted words
        if (label === accepted[i]) {
          green = true;
          matchFound = true;
          fill(0, 255, 0);
          console.log("MATCH");
          break;
        } else {
          console.log("The word does not match any word in the array.");
          matchFound = false;
        }
      }
    }

    if (matchFound === false) {
      mobilenet.predict(gotResult);
    }
  }
}

let ratio = 1440 / 1080;
let l;
let h;

//#Source: Dan Shiffman
function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.hide();

  if (windowWidth / windowHeight > ratio) {
    l = windowWidth;
    h = l / ratio;
    //console.log("a");
  } else {
    h = windowHeight;
    l = h * ratio;
  }
  imageMode(CENTER);

  // capture.elt.setAttribute('playsinline', ''); // add this for iphone compatibility

  mobilenet = ml5.imageClassifier("MobileNet", video, modelReady);

  // Create the "Submit" button
  submitButton = createButton("Submit");
  submitButton.position(width / 2 + 70, height - 80);
  submitButton.mousePressed(submitScreenshot);
  submitButton.hide(); // Initially hide the button

  // Create the "Retake" button
  retakeButton = createButton("Retake");
  retakeButton.position(width / 2 - 120, height - 80);
  retakeButton.mousePressed(retakeScreenshot);
  retakeButton.hide(); // Initially hide the button
}

function draw() {
  background(0);
  text("Prompt : " + promptWord, width / 2, 70); //  the prompt
  if (green) {
    // pause video
    // pause ml5 + screenshot
    let screenshot = video.get(
      width / 2 - l / 4,
      height / 2 - h / 4,
      l / 2,
      h / 2
    );

    //send screenshot to server
    let dataUrl = screenshot.canvas.toDataURL();
    socket.emit("screenshot", dataUrl);

    image(screenshot, width / 2, height / 2); // Display the screenshot
    push();
    translate(width, 0); // Move to the right edge
    scale(-1, 1); // Flip horizontally
    image(video, width / 2, height / 2, l / 2, h / 2); // Display the flipped video
    pop();
    // Stop updating the video feed
    video.pause();
    textSize(32);
    textAlign(CENTER, CENTER);
    text(displayed, width / 2, height - 150);
    fill(0, 255, 0);
    submitButton.show();
    retakeButton.show();
    screenshotTaken = true;
  } else {
    image(video, width / 2, height / 2, l / 2, h / 2);
    push();
    translate(width, 0); // Move to the right edge
    scale(-1, 1); // Flip horizontally
    image(video, width / 2, height / 2, l / 2, h / 2); // Display the flipped video
    pop();
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(displayed, width / 2, height - 150);
    submitButton.hide();
    retakeButton.hide();
    screenshotTaken = false;
  }
}

// function submitUsername() {
//   console.log('hello');
//   const usernameInput = document.getElementById('username');
//   const username = usernameInput.value;
//   console.log (username);
  // socket.emit('username', username);

  // usernameInput.value = "";
// }

// function submitUsername() {
//   const usernameInput = document.getElementById('username');
//   const username = usernameInput.value;
//   socket.emit('username', username);
//   console.log (username);


//   // usernameInput.value = "";
// }

function submitUsername(value) {
  console.log("Submitted:", value);
  // Do something with the submitted value in your Sketch.js canvas
}

function submitScreenshot() {
  // window.open('endscreen.html', '_blank');
  window.location.href = "endscreen.html";
  // trigger the gallery feed.html

  
  
  //store username, label, confidence score & screenshot
  let submitData = {
    username: username,
    label: label,
    confidence: confidence,
    screenshot: dataUrl
  }

  //send submitData to server
  socket.emit('submitted', submitData);
}

function retakeScreenshot() {
  green = false;
  window.location.reload();
}
