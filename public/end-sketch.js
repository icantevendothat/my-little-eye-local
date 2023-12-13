let dataUrl; 
let socket = io();


window.addEventListener('load', () => {
    
    socket.on('connect', () => {
        console.log('Connected to server');

        socket.on('submitted', (data) =>{
            username = username;
            dataUrl = data;
            console.log(dataUrl);
            document.getElementById('submittedImg').src = dataUrl;
        })
      });  
})