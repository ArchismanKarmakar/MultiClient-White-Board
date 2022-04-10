let roominfo = document.getElementById('roominfo');
let chats = document.getElementById('chats');
let sidebar1 = document.getElementById('sidebar1');
let sidebar2 = document.getElementById('sidebar2');
let navtoggle = document.getElementById('navtoggle');
let i = 2;

sidebar1.style.display = 'none'
sidebar2.style.display = 'none'

if (document.getElementById('topNav').clientHeight === 56) i = 1;

roominfo.addEventListener('click', () => {
    if (document.getElementById('topNav').clientHeight === 56) i = 1;
    if (sidebar1.style.display === "block") {
        sidebar1.style.setProperty("display", "none", "important")
    }
    else {
        sidebar1.style.setProperty("display", "block", "important")
    }
    sidebar1.style.top = `${document.getElementById('topNav').clientHeight}px`
    sidebar2.style.top = `${document.getElementById('topNav').clientHeight}px`
    sidebar2.style.setProperty("display", "none", "important")
})
chats.addEventListener('click', () => {
    if (document.getElementById('topNav').clientHeight === 56) i = 1;
    if (sidebar2.style.display === 'block') {
        sidebar2.style.setProperty("display", "none", "important")
    }
    else {
        sidebar2.style.setProperty("display", "block", "important")
    }
    sidebar1.style.top = `${document.getElementById('topNav').clientHeight}px`
    sidebar2.style.top = `${document.getElementById('topNav').clientHeight}px`
    sidebar1.style.setProperty("display", "none", "important")
})
navtoggle.addEventListener('click', () => {
    if (document.getElementById('topNav').clientHeight === 56) {
        sidebar1.style.top = '136px'
        sidebar2.style.top = '136px'
    }
    else {
        sidebar1.style.top = '56px'
        sidebar2.style.top = '56px'
    }
    sidebar1.style.height = `${document.getElementById('content').clientHeight}px`
    sidebar2.style.height = `${document.getElementById('content').clientHeight}px`
})

window.addEventListener('resize', () => {
    sidebar1.style.top = `${document.getElementById('topNav').clientHeight}px`
    sidebar2.style.top = `${document.getElementById('topNav').clientHeight}px`
    sidebar1.clientHeight = `${document.getElementById('content').clientHeight}px`
    sidebar2.clientHeight = `${document.getElementById('content').clientHeight}px`
})



