const users = []

// Add User 
exports.addUser = ({ id, username, room }) => {
    
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and Room are required'
        }
    }
    
    // Check for existing user
    const existingUser = users.find(user => user.room  === room && user.username === username)

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}    
        
// remove User
exports.removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }    
}

// get User
exports.getUser = (id) => {
    return users.find((user) => user.id === id)    
}

// get Users in Room
exports.getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

