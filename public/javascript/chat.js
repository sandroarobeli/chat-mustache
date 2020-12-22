const socket = io()


// Elements prefixing a variable with $ indicates it's an element
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message elements
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage) 
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    // Visible height
    const visibleHeight = $messages.offsetHeight

   // Height of messages container
   const containerHeight = $messages.scrollHeight

   // How far have I scrolled?
   const scrollOffset = $messages.scrollTop + visibleHeight

   if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
   }

}

socket.on('message', (message) => {
    console.log(message) // test
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a') 
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (locationURL) => {
    console.log(locationURL) // test
    const html = Mustache.render(locationTemplate, {
        username: locationURL.username,
        locationURL: locationURL.url,
        createdAt: moment(locationURL.createdAt).format('h:mm a')       
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    // disable form
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = event.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        // enable again
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = '' // clears input box
        $messageFormInput.focus() // moves the focus back into box
        if (error) {
            return console.log(error)
        }
        console.log('The message was delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    // disable location button
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', location, () => {
            // enable again
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared successfully')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})