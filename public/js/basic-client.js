/*
  ============THIS IS FOR UNDERSTAING bcuz we are adding more code in this file=============
*/

const socket = io(); // recieve the event

// listen the event
socket.on("message", (message) => {
  console.log(message);
});

// handle form submission
const handleSubmit = (e) => {
  e.preventDefault();
  const msg = e.target[0].value;

  if (msg) {
    // emit "sendMessage" event(WITH EVENT ACKNOWLEDGEMENT)
    socket.emit("sendMessage", msg, (error) => {
      e.target[0].value = "";
      e.target[0].focus();

      if (error) {
        return console.log(error);
      }
      console.log("Your message has been delivered!");
    });
  }
};
document.querySelector("#form").addEventListener("submit", handleSubmit);

// handle Share location
document.querySelector("#share-location-btn").addEventListener("click", () => {
  // Check browser supports geolocation or not
  if (!navigator.geolocation) {
    return console.log("Your browser do not support geolocation service!");
  }

  // Disable the btn
  document
    .querySelector("#share-location-btn")
    .setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const locationObj = {
      lat: position.coords.latitude,
      log: position.coords.longitude,
    };

    socket.emit("sendLocation", locationObj, () => {
      console.log("Location shared!");

      // Enabled the btn
      document.querySelector("#share-location-btn").removeAttribute("disabled");
    });
  });
});
