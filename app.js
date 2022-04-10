const express = require('express')
const mongoose = require('mongoose')
const crypto = require('crypto')
const app = express()
const { MongoURI } = require('./config/keys')
const expressLayouts = require('express-ejs-layouts')
const port = process.env.PORT || 5000

// socket vars
const http = require('http')
const server = http.createServer(app)
const socketio = require('socket.io')
const io = socketio(server)

// encyption vars
const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'
const iv = crypto.randomBytes(16)

// mongodb specific
mongoose.connect(MongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.connection.on("connected", () => {
    console.log("Connected to Mongodb Atlas!")
})
mongoose.connection.on("error", (e) => {
    console.log(e)
})

// registering all the models
require('./models/user')

// express specific
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use('/static', express.static('public'))
app.use(express.json())


// registering all the routes
app.use(require('./routes/auth'))
app.use(require('./routes/user'))
app.use(require('./routes/fileRender'))


// utility functions
function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
}

function decrypt(hash) {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'))
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()])
    return decrpyted.toString()
}

// Entry point
app.get('/', (req, res) => {
    res.redirect('/dashboard')
})

const requireLogin = require('./middleware/requireLogin')

// socket and rooms

let rooms = {}
let details = { name: "user", roomId: "roomid", type: "user", id: "id" }, organiser

app.post('/createRoom', requireLogin, (req, res) => {
    details = req.body
    if (Object.keys(rooms).includes(details.roomId)) return res.json({ error: "This room already exists !" })
    rooms[details.roomId] = {}
    organiser = details.name
    res.json(encrypt(details.roomId))
})

app.post('/joinRoom', requireLogin, (req, res) => {
    details = req.body
    if (Object.keys(rooms).includes(details.roomId)) res.json(encrypt(details.roomId))
    else {
        res.json({ error: "This room does not exists !" })
    }
})

app.get('/room/:iv/:content', (req, res) => {
    if (Object.keys(rooms).includes(decrypt({ iv: req.params.iv, content: req.params.content })) && details["name"] !== "user") return res.render('whiteBoardRoom')
    res.redirect('/dashboard')
})

// socket io 
io.on('connection', socket => {
    socket.join(details.roomId)
    socket.emit('i-have-joined', details, organiser)

    details = { name: "user", roomId: "roomid", type: "user" }

    socket.on('new-user-joined', (user) => {
        rooms[user.roomId][socket.id] = user
        io.to(user.roomId).emit('user-joined', rooms[user.roomId], user.name)
    })
    socket.on('send', (src, roomid) => {
        socket.to(roomid).broadcast.emit('receive', src, roomid)
    })

    socket.on('sendAccess', (type, drawings, socketId) => {
        socket.to(socketId).emit('receiveAccess', type, drawings)
    })

    socket.on('sendDrawings', (drawings, roomid) => {
        socket.to(roomid).emit('receiveDrawings', drawings)
    })

    socket.on('sendMsg', (msg, cname, roomid) => {
        socket.to(roomid).broadcast.emit('receiveMsg', msg, cname)
    })

    let room_id
    socket.on('disconnecting', () => {
        room_id = Object.keys(socket.rooms)[0]
    })

    socket.on('disconnect', () => {
        leftUser = rooms[room_id][socket.id]
        delete rooms[room_id][socket.id]
        socket.to(room_id).broadcast.emit('left', leftUser, rooms[room_id])
        socket.leave(room_id)
        if (Object.keys(rooms[room_id]).length == 0) {
            delete rooms[room_id]
        }
    })
})

// server port
server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

