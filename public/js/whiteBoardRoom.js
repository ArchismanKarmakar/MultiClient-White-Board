const socket = io('/')
const ClientName = document.getElementById('ClientName')
const roomID = document.getElementById('roomID')

const canvas = document.getElementById("canvas");
const eraser = document.getElementById('eraser')
const pen = document.getElementById('pen')
const colorPicker = document.getElementById('color-picker')
const penSize = document.getElementById('penSize')
const eraserSlider = document.getElementById('eraserSize')
const selectBtn = document.getElementById('selectBtn')
const saveBtn = document.getElementById('saveDrawings')
const clearBtn = document.getElementById('clearDrawings')
const newBoard = document.getElementById('newBoard')
const context = canvas.getContext("2d")
const sendBtn = document.getElementById('sendBtn')

// disable right clicking
document.oncontextmenu = function () {
    return false;
}

// list of all strokes drawn
let drawings = [];
let prevBoardId = null

// coordinates of our cursor
let cursorX;
let cursorY;
let prevCursorX;
let prevCursorY;

// painting and erasing
let enablePainting = false
let enableErase = false
let lineWidth = penSize.value;
let eraserSize = eraserSlider.value

// distance from origin
let offsetX = 0;
let offsetY = 0;

// zoom amount
let scale = 1;

// client specifications
let cname = "name", roomid = "roomid", type = "admin", id = 'id'

socket.on('user-joined', (users, name) => {
    let index = 1
    if (cname !== name) {
        document.querySelector('.toast-head').innerText = "New user joined !"
        document.querySelector('.toast-body').innerText = `${name} has joined the room just now.`
        $(document).ready(() => {
            $('.toast').toast('show')
        })
    }
    document.getElementById('pageSubmenu').innerHTML = ""
    for (let i in users) {
        if (users[i].id != id) {
            if (type == 'admin') {
                document.getElementById('pageSubmenu').innerHTML += `<li><div class="dropdown show">
                <a style="color:black;text-decoration:none;" class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${index}.) ${users[i].name}</a>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                <a class="dropdown-item" id="${i}" style="margin-right: 10px;cursor: pointer;" onclick="allowDenyAccess(this.id)">Allow Board Access</a>
                </div>
                </div></li>`
                index++
            }
            else {
                document.getElementById('pageSubmenu').innerHTML += `<li><a style="color:black;text-decoration:none;">${index}.) ${users[i].name}</a></li>`
            }
        }
    }
    if (type == "admin") {
        let src = canvas.toDataURL('image/png')
        socket.emit('send', src, roomid)
    }
})

socket.on('left', (leftUser, users) => {
    let index = 1
    if (leftUser.type == "admin") window.location.href = `${window.location.origin}/dashboard`
    else {
        document.querySelector('.toast-head').innerText = "User left !"
        document.querySelector('.toast-body').innerText = `${leftUser.name} has left the room just now !`
        $(document).ready(() => {
            $('.toast').toast('show')
        })
        document.getElementById('pageSubmenu').innerHTML = ""
        for (let i in users) {
            if (users[i].id != id) {
                if (type == 'admin') {
                    document.getElementById('pageSubmenu').innerHTML += `<li><div class="dropdown show">
                    <a style="color:black;text-decoration:none;" class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink${index}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${index}.) ${users[i].name}</a>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenuLink${index}">
                    <a class="dropdown-item" id="${i}" style="margin-right: 10px;cursor: pointer;" onclick="allowDenyAccess(this.id)">Allow Board Access</a>
                    </div>
                    </div></li>`
                    index++
                }
                else {
                    document.getElementById('pageSubmenu').innerHTML += `<li><a style="color:black;text-decoration:none;">${index}.) ${users[i].name}</a></li>`
                }
            }
        }
    }
})


// convert coordinates
function toScreenX(xTrue) {
    return (xTrue + offsetX) * scale;
}
function toScreenY(yTrue) {
    return (yTrue + offsetY) * scale;
}
function toTrueX(xScreen) {
    return (xScreen / scale) - offsetX;
}
function toTrueY(yScreen) {
    return (yScreen / scale) - offsetY;
}
function trueHeight() {
    return canvas.clientHeight / scale;
}
function trueWidth() {
    return canvas.clientWidth / scale;
}

function redrawCanvas() {
    // set the canvas to the size of the window
    canvas.width = document.body.clientWidth - 6;
    canvas.height = document.body.clientHeight - 120;

    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < drawings.length; i++) {
        const line = drawings[i];
        drawLine(toScreenX(line.x0), toScreenY(line.y0), toScreenX(line.x1), toScreenY(line.y1), line.width, line.color)
    }
    let src = canvas.toDataURL('image/png')
    socket.emit('send', src, roomid)
}
redrawCanvas()

socket.on('receive', (src, roomid) => {
    let img = new Image()
    img.src = src
    img.crossOrigin = "anonymous"
    img.onload = () => {
        context.drawImage(img, 0, 0)
    }
})

socket.on('receiveMsg', (msg, name) => {
    appendMsg(msg, name)
})

socket.on('receiveAccess', (type, d) => {
    canvas.classList.remove('penStyle')
    canvas.classList.remove('eraserStyle')
    if (type === 'allow') {
        document.getElementById('allowAccess').innerText = 'WhiteBoard Controls : Allowed'
        showFeatures()
        // Touch Event Handlers - Mobile and tab
        canvas.addEventListener('touchstart', onTouchStart)
        canvas.addEventListener('touchend', onTouchEnd)
        canvas.addEventListener('touchcancel', onTouchEnd)
        canvas.addEventListener('touchmove', onTouchMove)
        // Mouse Event Handlers - Window
        canvas.addEventListener('mousedown', onMouseDown)
        canvas.addEventListener('mouseup', onMouseUp, false)
        canvas.addEventListener('mouseout', onMouseUp, false)
        canvas.addEventListener('mousemove', onMouseMove, false)
        canvas.addEventListener('wheel', onMouseWheel, false)
    }
    else if (type === 'deny') {
        document.getElementById('allowAccess').innerText = 'WhiteBoard Controls : Denied'
        hideFeatures()
        // Touch Event Handlers - Mobile and tab
        canvas.removeEventListener('touchstart', onTouchStart)
        canvas.removeEventListener('touchend', onTouchEnd)
        canvas.removeEventListener('touchcancel', onTouchEnd)
        canvas.removeEventListener('touchmove', onTouchMove)
        // Mouse Event Handlers - Window
        canvas.removeEventListener('mousedown', onMouseDown)
        canvas.removeEventListener('mouseup', onMouseUp, false)
        canvas.removeEventListener('mouseout', onMouseUp, false)
        canvas.removeEventListener('mousemove', onMouseMove, false)
        canvas.removeEventListener('wheel', onMouseWheel, false)
    }
    drawings = d
})

socket.on('receiveDrawings', (d) => {
    drawings = d
})

// if the window changes size, redraw the canvas
window.addEventListener("resize", () => {
    redrawCanvas();
});

// utility functions

function changeColor(a, b, c) {
    a.classList.remove(a.classList[1])
    a.classList.add('btn-primary')
    b.classList.remove(b.classList[1])
    b.classList.add('btn-secondary')
    c.classList.remove(c.classList[1])
    c.classList.add('btn-secondary')
}

function hideFeatures() {
    document.getElementById('eraser').style.display = "none"
    document.getElementById('pen').style.display = "none"
    document.getElementById('color-picker').style.display = "none"
    document.getElementById('penSize').style.display = "none"
    document.getElementById('eraserSize').style.display = "none"
    document.getElementById('selectBtn').style.display = "none"
    document.getElementById('saveDrawings').style.display = "none"
    document.getElementById('clearDrawings').style.display = "none"
    document.getElementById('penText').style.display = "none"
    document.getElementById('eraseText').style.display = "none"
    document.getElementById('colorText').style.display = "none"
    document.getElementById('newBoard').style.display = "none"
    document.querySelector('.toast-head').innerText = "Access"
    document.querySelector('.toast-body').innerText = "Access to the whiteboard taken"
    $(document).ready(() => {
        $('.toast').toast('show')
    })
}

function showFeatures() {
    document.getElementById('eraser').style.display = "inline-block"
    document.getElementById('pen').style.display = "inline-block"
    document.getElementById('color-picker').style.display = "inline-block"
    document.getElementById('penSize').style.display = "inline-block"
    document.getElementById('eraserSize').style.display = "inline-block"
    document.getElementById('selectBtn').style.display = "inline-block"
    document.getElementById('clearDrawings').style.display = "inline-block"
    document.getElementById('penText').style.display = "inline-block"
    document.getElementById('eraseText').style.display = "inline-block"
    document.getElementById('colorText').style.display = "inline-block"
    document.querySelector('.toast-head').innerText = "Access"
    document.querySelector('.toast-body').innerText = "Access to the whiteboard has been provided"
    $(document).ready(() => {
        $('.toast').toast('show')
    })
}

function allowDenyAccess(socketId) {
    if (document.getElementById(socketId).innerText === 'Allow Board Access') {
        document.getElementById(socketId).innerText = 'Deny Board Access'
        socket.emit('sendAccess', 'allow', drawings, socketId)
    }
    else {
        document.getElementById(socketId).innerText = 'Allow Board Access'
        socket.emit('sendAccess', 'deny', [], socketId)
    }
}

function editBoard(pic) {
    prevBoardId = pic.split(' ')[1]
    pic = pic.split(' ')[0]
    let img = new Image()
    img.src = pic
    img.crossOrigin = "anonymous"
    img.onload = () => {
        context.drawImage(img, 0, 0)
    }

    fetch('/getDrawings', {
        method: 'post',
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({
            pic: pic,
            email: JSON.parse(localStorage.getItem("user")).email
        })
    }).then(res => res.json())
        .then(d => {
            drawings = d
            let src = canvas.toDataURL('image/png')
            socket.emit('send', src, d, roomid)
        })
}

function delBoard(img) {
    img = img.replace('del', '')
    let [img_url, img_id] = img.split(' ')
    let arr = JSON.parse(localStorage.getItem("user")).WhiteBoards
    arr = arr.filter(e => e.img !== img_url)
    localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), WhiteBoards: arr }))

    document.getElementById(`board${img_url}`).remove()

    fetch('/deleteBoard', {
        method: 'put',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem("jwt")}`
        },
        body: JSON.stringify({
            img_url,
            img_id
        })
    }).then(res => res.json())
        .then(result => {
            document.querySelector('.toast-head').innerText = "Success !"
            document.querySelector('.toast-body').innerText = result.message
            $(document).ready(() => {
                $('.toast').toast('show')
            })
        })

}

function appendMsg(msg, name) {
    document.querySelector('.chats').innerHTML += `<div class="insidetext">
    <p style="color: black;">${msg}</p>
    <p style="float: right; font-size: 10px;"> ~ ${name}</p>
    </div>`
}

function drawLine(x0, y0, x1, y1, lineWidth, color) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.lineCap = "round"
    context.stroke();
}

function erase(x, y, s) {
    context.fillStyle = '#ffffff'
    context.fillRect(x, y, s, s)
    drawings = drawings.filter(d => {
        return !((Math.abs(x - toScreenX(d.x0)) < s / 2 && Math.abs(y - toScreenY(d.y0)) < s / 2) || (Math.abs(x - toScreenX(d.x1)) < s / 2 && Math.abs(y - toScreenY(d.y1)) < s / 2))
    })
}

socket.on('i-have-joined', (details, organiser) => {
    cname = details.name
    roomid = details.roomId
    id = details.id
    type = details.type
    ClientName.innerText = `Name : ${cname}`
    roomID.innerText = `Room ID : ${roomid}`
    document.getElementById('pageSubmenu1').innerHTML = `<li><a>${organiser}</a></li>`
    socket.emit('new-user-joined', details)

    document.querySelector('.toast-head').innerText = "Welcome !"
    document.querySelector('.toast-body').innerText = (cname !== organiser) ? `Welcome to the room created by ${organiser}` : `You created this room`
    $(document).ready(() => {
        $('.toast').toast('show')
    })

    if (details.type === "user") {
        document.getElementById('eraser').style.display = "none"
        document.getElementById('pen').style.display = "none"
        document.getElementById('color-picker').style.display = "none"
        document.getElementById('penSize').style.display = "none"
        document.getElementById('eraserSize').style.display = "none"
        document.getElementById('selectBtn').style.display = "none"
        document.getElementById('saveDrawings').style.display = "none"
        document.getElementById('clearDrawings').style.display = "none"
        document.getElementById('penText').style.display = "none"
        document.getElementById('eraseText').style.display = "none"
        document.getElementById('colorText').style.display = "none"
        document.getElementById('newBoard').style.display = "none"
        document.getElementById('allowAccess').innerText = 'WhiteBoard Controls : Denied'
    }

    if (details.type === "admin") {
        document.getElementById('allowAccess').style.display = 'none'
        document.getElementById('sidenavItems').innerHTML += `<br>
        <li>
        <a href="#pageSubmenu2" data-toggle="collapse" aria-expanded="false"
        class="dropdown-toggle">My Saved Boards</a>
        <ul class="collapse lisst-unstyled" style="list-style: none;overflow-y: scroll;max-height: 25rem;margin-top: 8px" id="pageSubmenu2"></ul>
        </li>`
        JSON.parse(localStorage.getItem('user')).WhiteBoards.forEach(wb => {
            document.getElementById('pageSubmenu2').innerHTML += `<li style="margin-bottom:10px" id="board${wb.img}"><div class="card" style="width: 15rem; margin:2px"><img class="card-img-top" src="${wb.img}" alt="Card image cap"></div><button type="button" class="btn btn-primary btn-sm" id="${wb.img} ${wb.img_id}" onclick="editBoard(this.id)">Edit</button><button type="button" class="btn btn-primary btn-sm" id="del${wb.img} ${wb.img_id}" onclick="delBoard(this.id)">Delete</button></li>`
        })
        // Touch Event Handlers - Mobile and tab
        canvas.addEventListener('touchstart', onTouchStart)
        canvas.addEventListener('touchend', onTouchEnd)
        canvas.addEventListener('touchcancel', onTouchEnd)
        canvas.addEventListener('touchmove', onTouchMove)
        // Mouse Event Handlers - Window
        canvas.addEventListener('mousedown', onMouseDown)
        canvas.addEventListener('mouseup', onMouseUp, false)
        canvas.addEventListener('mouseout', onMouseUp, false)
        canvas.addEventListener('mousemove', onMouseMove, false)
        canvas.addEventListener('wheel', onMouseWheel, false)
    }



    penSize.addEventListener('change', () => {
        lineWidth = penSize.value
    })

    eraserSlider.addEventListener('change', () => {
        eraserSize = eraserSlider.value
    })

    selectBtn.addEventListener('click', () => {
        enableErase = enablePainting = false
        changeColor(selectBtn, pen, eraser)
        canvas.classList.remove('penStyle')
        canvas.classList.remove('eraserStyle')
    })

    pen.addEventListener('click', (e) => {
        changeColor(pen, selectBtn, eraser)
        canvas.classList.add('penStyle')
        canvas.classList.remove('eraserStyle')
        enablePainting = !enablePainting
        if (enablePainting) enableErase = false
        else {
            pen.classList.remove(pen.classList[1])
            pen.classList.add('btn-secondary')
            selectBtn.classList.remove(pen.classList[1])
            selectBtn.classList.add('btn-primary')
        }
    })

    eraser.addEventListener('click', () => {
        changeColor(eraser, selectBtn, pen)
        enableErase = !enableErase
        canvas.classList.add('eraserStyle')
        canvas.classList.remove('penStyle')
        if (enableErase) enablePainting = false
        else {
            eraser.classList.remove(pen.classList[1])
            eraser.classList.add('btn-secondary')
            selectBtn.classList.remove(pen.classList[1])
            selectBtn.classList.add('btn-primary')
        }
    })

    newBoard.addEventListener('click', () => {
        prevBoardId = null
        drawings = []
        redrawCanvas()
        document.querySelector('.toast-head').innerText = "Success !"
        document.querySelector('.toast-body').innerText = "New white board created !"
        $(document).ready(() => {
            $('.toast').toast('show')
        })
    })

    saveBtn.addEventListener('click', () => {
        let imageSrc = canvas.toDataURL('image/png')
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                const image = new File([blob], 'drawing.png', blob)
                let data = new FormData()
                data.append("file", image)
                data.append("upload_preset", "drawingboard")
                data.append("cloud_name", "instaimagesparnab")

                fetch(`https://api.cloudinary.com/v1_1/instaimagesparnab/image/upload`, {
                    method: "post",
                    body: data,
                })
                    .then(res => res.json())
                    .then(data => {
                        let arr = JSON.parse(localStorage.getItem("user")).WhiteBoards
                        if (prevBoardId) {
                            arr.forEach((e, i) => {
                                if (e.img_id === prevBoardId) {
                                    arr[i] = { img: data.secure_url, img_id: data.public_id }
                                }
                            })
                        }
                        else arr.push({ img: data.secure_url, img_id: data.public_id })
                        document.getElementById('pageSubmenu2').innerHTML = ''
                        localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), WhiteBoards: arr }))
                        fetch(`/saveWhiteBoard`, {
                            method: 'put',
                            headers: {
                                'Content-Type': 'application/json',
                                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
                            },
                            body: JSON.stringify({
                                url: data.secure_url,
                                img_id: data.public_id,
                                drawings,
                                prevBoardId
                            })
                        })
                            .then(res => res.json())
                            .then(result => {
                                document.querySelector('.toast-head').innerText = "Success !"
                                document.querySelector('.toast-body').innerText = result.message
                                $(document).ready(() => {
                                    $('.toast').toast('show')
                                })
                                prevBoardId = data.public_id
                                JSON.parse(localStorage.getItem('user')).WhiteBoards.forEach(wb => {
                                    document.getElementById('pageSubmenu2').innerHTML += `<li style="margin-bottom:10px" id="board${wb.img}"><div class="card" style="width: 15rem; margin:2px"><img class="card-img-top" src="${wb.img}" alt="Card image cap"></div><button type="button" class="btn btn-primary btn-sm" id="${wb.img} ${wb.img_id}" onclick="editBoard(this.id)">Edit</button><button type="button" class="btn btn-primary btn-sm" id="del${wb.img} ${wb.img_id}" onclick="delBoard(this.id)">Delete</button></li>`
                                })
                            })
                            .catch(e => console.log(e))
                    })
                    .catch(e => console.log(e))
            })
    })

    clearBtn.addEventListener('click', () => {
        drawings = []
        redrawCanvas()
    })

    sendBtn.addEventListener('click', () => {
        let msg = document.getElementById('inputText').value
        appendMsg(msg, cname)
        socket.emit('sendMsg', msg, cname, roomid)
        document.getElementById('inputText').value = ""
    })

})

// mouse functions
let leftMouseDown = false;
let rightMouseDown = false;
function onMouseDown(event) {

    // detect left clicks
    if (event.button == 0) {
        leftMouseDown = true;
        rightMouseDown = false;
    }
    // detect right clicks
    if (event.button == 2) {
        rightMouseDown = true;
        leftMouseDown = false;
    }

    // update the cursor coordinates
    cursorX = event.pageX - canvas.offsetLeft;
    cursorY = event.pageY - canvas.offsetTop + 24;
    prevCursorX = cursorX;
    prevCursorY = cursorY;
}
function onMouseMove(event) {
    // get mouse position
    cursorX = event.pageX - canvas.offsetLeft;
    cursorY = event.pageY - canvas.offsetTop + 24;
    const scaledX = toTrueX(cursorX);
    const scaledY = toTrueY(cursorY);
    const prevScaledX = toTrueX(prevCursorX);
    const prevScaledY = toTrueY(prevCursorY);

    if (leftMouseDown && enablePainting) {
        // add the line to our drawing history
        drawings.push({
            x0: prevCursorX,
            y0: prevCursorY,
            x1: cursorX,
            y1: cursorY,
            width: lineWidth,
            color: colorPicker.value
        })
        // draw a line
        drawLine(prevCursorX, prevCursorY, cursorX, cursorY, lineWidth, colorPicker.value)
    }
    if (enableErase) {
        if (leftMouseDown) erase(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop + 24, eraserSize)
    }
    let src = canvas.toDataURL('image/png')
    socket.emit('send', src, roomid)

    socket.emit('sendDrawings', drawings, roomid)

    if (rightMouseDown) {
        // move the screen
        offsetX += (cursorX - prevCursorX) / scale;
        offsetY += (cursorY - prevCursorY) / scale;
        redrawCanvas();
    }
    prevCursorX = cursorX;
    prevCursorY = cursorY;

}
function onMouseUp() {
    leftMouseDown = false;
    rightMouseDown = false;
}
function onMouseWheel(event) {

    const deltaY = event.deltaY;
    const scaleAmount = -deltaY / 500;
    scale = scale * (1 + scaleAmount);

    // zoom the page based on where the cursor is
    var distX = event.pageX / canvas.clientWidth;
    var distY = event.pageY / canvas.clientHeight;

    // calculate how much we need to zoom
    const unitsZoomedX = trueWidth() * scaleAmount;
    const unitsZoomedY = trueHeight() * scaleAmount;

    const unitsAddLeft = unitsZoomedX * distX;
    const unitsAddTop = unitsZoomedY * distY;

    offsetX -= unitsAddLeft;
    offsetY -= unitsAddTop;

    redrawCanvas();
}


// touch functions
const prevTouches = [null, null]; // up to 2 touches
let singleTouch = false;
let doubleTouch = false;
function onTouchStart(event) {
    if (event.touches.length == 1) {
        singleTouch = true;
        doubleTouch = false;
    }
    if (event.touches.length >= 2) {
        singleTouch = false;
        doubleTouch = true;
    }

    // store the last touches
    prevTouches[0] = event.touches[0];
    prevTouches[1] = event.touches[1];

}
function onTouchMove(event) {
    // get first touch coordinates
    const touch0X = event.touches[0].pageX;
    const touch0Y = event.touches[0].pageY;
    const prevTouch0X = prevTouches[0].pageX;
    const prevTouch0Y = prevTouches[0].pageY;

    const scaledX = toTrueX(touch0X);
    const scaledY = toTrueY(touch0Y);
    const prevScaledX = toTrueX(prevTouch0X);
    const prevScaledY = toTrueY(prevTouch0Y);

    if (singleTouch && enablePainting) {
        // add to history
        drawings.push({
            x0: prevScaledX,
            y0: prevScaledY,
            x1: scaledX,
            y1: scaledY,
            width: lineWidth,
            color: colorPicker.value
        })
        // draw a line
        drawLine(prevCursorX, prevCursorY, scaledX, scaledY, lineWidth, colorPicker.value)
    }

    if (singleTouch && enableErase) {
        erase(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop + 24, eraserSize)
    }

    let src = canvas.toDataURL('image/png')
    socket.emit('send', src, roomid)
    socket.emit('sendDrawings', drawings, roomid)

    if (doubleTouch) {
        // get second touch coordinates
        const touch1X = event.touches[1].pageX;
        const touch1Y = event.touches[1].pageY;
        const prevTouch1X = prevTouches[1].pageX;
        const prevTouch1Y = prevTouches[1].pageY;

        // get midpoints
        const midX = (touch0X + touch1X) / 2;
        const midY = (touch0Y + touch1Y) / 2;
        const prevMidX = (prevTouch0X + prevTouch1X) / 2;
        const prevMidY = (prevTouch0Y + prevTouch1Y) / 2;

        // calculate the distances between the touches
        const hypot = Math.sqrt(Math.pow((touch0X - touch1X), 2) + Math.pow((touch0Y - touch1Y), 2));
        const prevHypot = Math.sqrt(Math.pow((prevTouch0X - prevTouch1X), 2) + Math.pow((prevTouch0Y - prevTouch1Y), 2));

        // calculate the screen scale change
        var zoomAmount = hypot / prevHypot;
        scale = scale * zoomAmount;
        const scaleAmount = 1 - zoomAmount;

        // calculate how many pixels the midpoints have moved in the x and y direction
        const panX = midX - prevMidX;
        const panY = midY - prevMidY;
        // scale this movement based on the zoom level
        offsetX += (panX / scale);
        offsetY += (panY / scale);

        // Get the relative position of the middle of the zoom.
        // 0, 0 would be top left. 
        // 0, 1 would be top right etc.
        var zoomRatioX = midX / canvas.clientWidth;
        var zoomRatioY = midY / canvas.clientHeight;

        // calculate the amounts zoomed from each edge of the screen
        const unitsZoomedX = trueWidth() * scaleAmount;
        const unitsZoomedY = trueHeight() * scaleAmount;

        const unitsAddLeft = unitsZoomedX * zoomRatioX;
        const unitsAddTop = unitsZoomedY * zoomRatioY;

        offsetX += unitsAddLeft;
        offsetY += unitsAddTop;

        redrawCanvas();
    }
    prevTouches[0] = event.touches[0];
    prevTouches[1] = event.touches[1];
}

function onTouchEnd(event) {
    singleTouch = false;
    doubleTouch = false;
}

// end


