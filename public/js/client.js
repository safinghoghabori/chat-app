const socket = io(); // recieve the event

// Element (JUST WE DECLARE HERE FOR DRY CONCEPT)
const messageDiv = document.querySelector("#messages");

// listen the event
socket.on("message", (message) => {
  // Render messages on UI
  const messageTemplate = document.querySelector("#message-template").innerHTML;

  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm A"),
    username: message.username,
  });
  messageDiv.insertAdjacentHTML("beforeend", html);

  // call autoscroll()
  autoscroll();
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

// Listen the "locationMessage" event
socket.on("locationMessage", (obj) => {
  const locationTemplate = document.querySelector("#location-template")
    .innerHTML;

  // Render location on UI with clickable link
  const html = Mustache.render(locationTemplate, {
    locationUrl: obj.url,
    createdAt: moment(obj.createdAt).format("h:mm A"),
    username: obj.username,
  });

  messageDiv.insertAdjacentHTML("beforeend", html);

  // Call autoscroll()
  autoscroll();
});

// Emit "join" event, to retrive username and room name
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
socket.emit(
  "join",
  {
    username,
    room,
  },
  (error) => {
    if (error) {
      alert(error);
      location.href = "/";
    }
  }
);

// Listen "roomData" event to track the user and display it on sidebar
socket.on("roomData", ({ room, users }) => {
  const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

  const html = Mustache.render(sidebarTemplate, {
    room: room,
    users: users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

// Autoscroll Functionality
const autoscroll = () => {
  // New message element
  const $newMessage = messageDiv.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = messageDiv.offsetHeight;

  // Height of messages container
  const containerHeight = messageDiv.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = messageDiv.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messageDiv.scrollTop = messageDiv.scrollHeight;
  }
};
