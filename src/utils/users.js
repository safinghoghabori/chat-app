const users = [];

// Add User
const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if (!username || !room) {
    return {
      error: "Username and Room are required!",
    };
  }

  // Check the existing user
  const isUserExisting = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // Validate username
  if (isUserExisting) {
    return {
      error: "Username already taken!",
    };
  }

  // Store the user
  const user = {
    id: id,
    username: username,
    room: room,
  };
  users.push(user);

  return { user };
};

// Remove User
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// Get User
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

// Get Users joined in the room
const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
