const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('./utilities/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utilities/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));


io.on('connection', (socket) => {
    console.log('New Web-Socket Connection') // test
    
    // Listens to a specific room
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        
        if (error) {
           return callback(error)
        }
        
        
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${username} has joined ${room}`))
        
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        
        callback()
        // General socket.emit --> emits to THIS socket
        //         io.emit --> emits to ALL
        //         socket.broadcast.emit --> emits to all BUT this one  
        // Room Specific io.to.emit --> emits to ALL in a specific room 
        //               socket.broadcast.to.emit --> but THIS socket  
    })
    
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()    
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left ${user.room}`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
    
})

server.listen(port, (error) => {
    if (error) {
        return console.log('Error(s)\n' + error)
    }
    console.log(`Server is up on port ${port}`)
})
