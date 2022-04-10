if (document.referrer === `${window.location.origin}/signin`) {
    document.querySelector('.toast-head').innerText = "Success !"
    document.querySelector('.toast-body').innerText = "LoggedIn Successfully !"
    $(document).ready(() => {
        $('.toast').toast('show')
    })
}

window.addEventListener('load', () => {
    fetch('/dashboard', {
        method: "post",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("jwt")}`
        },
    }).then(res => res.json())
        .then(data => {
            if (data.error) {
                console.log(data.error)
                window.location.href = `${window.location.origin}/signin`
            }
            else {
                document.getElementById('dashboard').innerHTML =
                    `<div class="card m s my-5 mx-5" style="width: 24rem;">
                    <img src="${data.pic}" class="card-img-top rounded" alt="profile">
                    <div class="card-body">
                        <h5>First Name : </h5>
                        <p>${data.firstName}</p>
                        <h5>Last Name : </h5>
                        <p>${data.lastName}</p>
                        <h5>Email : </h5>
                        <p>${data.email}</p>
                        <a href="#" class="btn btn-primary btn-block" data-toggle="modal" data-target="#picChange">Change Profile photo</a>
                    </div>
                </div>
                <div class="accordion my-5 mx-5" id="accordionExample" style="width: 90%; align-self: flex-start;">
                <div class="card">
                    <div class="card-header" id="headingOne">
                        <h2 class="mb-0">
                            <button class="btn btn-link btn-block text-left" type="button" data-toggle="collapse"
                                data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                Create Room
                            </button>
                        </h2>
                    </div>

                    <div id="collapseOne" class="collapse" aria-labelledby="headingOne" data-parent="#accordionExample">
                        <div class="card-body">
                            <form id="createRoom">
                                <div class="form-group">
                                    <input type="text" class="form-control" id="roomIdAdmin"
                                        placeholder="Enter any room Id">
                                    <small id="emailHelp" class="form-text text-muted"> *Id should be a strong password</small>
                                </div>
                                <button type="submit" class="btn btn-primary">Create</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header" id="headingTwo">
                        <h2 class="mb-0">
                            <button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse"
                                data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                Join to Room
                            </button>
                        </h2>
                    </div>
                    <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample">
                        <div class="card-body">
                            <form id="joinRoom">
                                <div class="form-group">
                                    <input type="text" class="form-control" id="roomId"
                                        placeholder="Enter team Id to join">
                                </div>
                                <button type="submit" class="btn btn-primary">Join</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header" id="headingThree">
                        <h2 class="mb-0">
                            <button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse"
                                data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                                My Saved WhiteBoards
                            </button>
                        </h2>
                    </div>
                    <div id="collapseThree" class="collapse" aria-labelledby="headingThree" data-parent="#accordionExample">
                        <div class="card-body" id="cardbody">
                            <ul id="myWhiteBoards" style="list-style: none;overflow-y: scroll; max-height:20rem;max-width:100%;padding-inline-start: 0px;"></ul>
                        </div>
                    </div>
                </div>
                </div>

                <div class="modal fade" id="picChange" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Update Profile Pic</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div class="modal-body d-flex flex-column justify-content-center align-items-center">
                <img src="${data.pic}" alt="profile" id="prof">
                    <form id="changePic">
                        <div class="form-row">
                                <div class="custom-file">
                                    <input type="file" class="custom-file-input" id="newPic"
                                        aria-describedby="inputGroupFileAddon01" multiple="false" accept="image/*">
                                    <label class="custom-file-label" for="inputGroupFile01">Upload a Profile Pic</label>
                                </div>
                        </div>
                        <div class="form-row">
                                <button type="submit" class="btn btn-primary btn-block">Update Pic</button>
                        </div>
                    </form>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
                </div>
                </div>
    </div>
    </div> `
                setTimeout(() => {
                    if (JSON.parse(localStorage.getItem('user')).WhiteBoards.length) {

                        JSON.parse(localStorage.getItem('user')).WhiteBoards.forEach(wb => {
                            document.getElementById('myWhiteBoards').innerHTML += `<li style="max-width:100%"><div class="card" style="width: 100%">
                            <div class="row no-gutters">
                                <div class="col-sm-5 img-board">
                                    <img class="card-img" src="${wb.img}" alt="...">
                                </div>
                                <div class="col-sm-7">
                                    <div class="card-body">
                                    <div class="accordion" id="${wb.img_id}">
                                    <div class="card share" style="width:99%">
                                      <div class="card-header" id="heading${wb.img_id}">
                                        <h2 class="mb-0">
                                          <button class="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="#collapse${wb.img_id}" aria-expanded="true" aria-controls="collapse${wb.img_id}">
                                            Share Board
                                          </button>
                                        </h2>
                                      </div>
                                      <div id="collapse${wb.img_id}" aria-labelledby="heading${wb.img_id}" data-parent="#${wb.img_id}" class="collapse">
                                        <div class="card-body">
                                        <p>Enter the email id to whom you want to share board</p><br>
                                        <form class="form-inline" id="${wb.img}" onsubmit="shareLink(event)">
                                            <div class="form-group my-2">
                                                <input type="email" class="form-control" id="email${wb.img}" placeholder="Email" required>
                                            </div>
                                            <button type="submit" class="btn btn-primary mx-2">Share Link</button>
                                        </form>
                                        </div>
                                      </div>
                                    </div>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </div></li>`
                        })
                    }
                    else {
                        document.getElementById('cardbody').innerHTML = `<p> No white Boards created !`
                    }
                }, 0);
            }

        })
        .catch(e => console.log(e))
})

document.getElementById('logout').addEventListener('click', () => {
    localStorage.clear()
    window.location.href = `${window.location.origin}/signin`
})

function shareLink(e) {
    e.preventDefault()
    let url = e.target.id
    let email = document.getElementById(`email${url}`).value

    fetch('/shareBoardToEmail', {
        method: 'post',
        headers: {
            "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            receiver: email,
            url,
            sender: JSON.parse(localStorage.getItem('user')).email
        })
    }).then(res => res.json())
        .then(result => {
            document.querySelector('.toast-head').innerText = result.message ? "Success !" : "Error !"
            document.querySelector('.toast-body').innerText = result.message || result.error
            $(document).ready(() => {
                $('.toast').toast('show')
            })
        })
}


document.addEventListener('change', () => {

    let createRoom = document.getElementById('createRoom')
    let joinRoom = document.getElementById('joinRoom')
    let name = `${JSON.parse(localStorage.getItem('user')).firstName} ${JSON.parse(localStorage.getItem('user')).lastName}`
    let id = `${JSON.parse(localStorage.getItem('user'))._id}`

    document.getElementById('changePic').addEventListener('submit', (e) => {
        e.preventDefault()
        let newPic = document.getElementById('newPic').files[0]
        if (newPic) {
            const data = new FormData()
            data.append("file", newPic)
            data.append("upload_preset", "drawingboard")
            data.append("cloud_name", "instaimagesparnab")

            fetch(`	https://api.cloudinary.com/v1_1/instaimagesparnab/image/upload`, {
                method: "post",
                body: data,
            })
                .then(res => res.json())
                .then(data => {

                    fetch(`/updatepic`, {
                        method: 'put',
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            pic: data.secure_url,
                            pic_id: data.public_id,
                            curr_pic_id: JSON.parse(localStorage.getItem('user')).pic_id
                        })
                    })
                        .then(res => res.json())
                        .then(result => {
                            localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), pic: data.secure_url, pic_id: data.public_id }))
                            console.log(result)
                            window.location.reload()
                        })
                })
                .catch(e => console.log(e))
        }
        else {
            console.log('please select an image')
        }
    })

    createRoom.addEventListener('submit', (e) => {
        e.preventDefault()

        let roomId = document.getElementById('roomIdAdmin').value

        fetch('/createRoom', {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
                'Content-Type': 'application/json',
            },
            method: "post",
            body: JSON.stringify({
                roomId,
                name,
                type: 'admin',
                id
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    document.querySelector('.toast-head').innerText = "Error !"
                    document.querySelector('.toast-body').innerText = data.error
                    $(document).ready(() => {
                        $('.toast').toast('show')
                    })
                }
                else window.location.href = `${window.location.origin}/room/${data.iv}/${data.content}`
            })
            .catch(e => console.log(e))

    })

    joinRoom.addEventListener('submit', (e) => {
        e.preventDefault()

        let roomId = document.getElementById('roomId').value

        fetch('/joinRoom', {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
                'Content-Type': 'application/json',
            },
            method: "post",
            body: JSON.stringify({
                roomId,
                name,
                type: 'user',
                id
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    document.querySelector('.toast-head').innerText = "Error !"
                    document.querySelector('.toast-body').innerText = data.error
                    $(document).ready(() => {
                        $('.toast').toast('show')
                    })
                }
                else window.location.href = `${window.location.origin}/room/${data.iv}/${data.content}`
            })
            .catch(e => console.log(e))
    })

})