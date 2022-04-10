let signupForm = document.getElementById('signup')
signupForm.addEventListener('submit', (e) => {
    e.preventDefault()

    let firstName = document.getElementById('firstName').value
    let lastName = document.getElementById('lastName').value
    let email = document.getElementById('email').value
    let password = document.getElementById('password').value
    let confirmPassword = document.getElementById('confirmPassword').value
    let pic = document.getElementById('pic').files[0]
    let pic_url = undefined
    let pic_id = undefined

    if (password !== confirmPassword) {
        document.querySelector('.toast-head').innerText = "Error !"
        document.querySelector('.toast-body').innerText = "Password and confirm password does not match each other !"
        $(document).ready(() => {
            $('.toast').toast('show')
        })
    }
    else {
        if (pic) {
            const data = new FormData()
            data.append("file", pic)
            data.append("upload_preset", "drawingboard")
            data.append("cloud_name", "instaimagesparnab")

            fetch(`https://api.cloudinary.com/v1_1/instaimagesparnab/image/upload`, {
                method: "post",
                body: data,
            })
                .then(res => res.json())
                .then(data => {
                    pic_url = data.secure_url
                    pic_id = data.public_id
                    fetchSignUp(firstName, lastName, password, email, pic_url, pic_id)
                })
                .catch(e => console.log(e))
        }
        else fetchSignUp(firstName, lastName, password, email, pic_url, pic_id)
    }
})

function fetchSignUp(firstName, lastName, password, email, url, id) {
    fetch('/signup', {
        method: "post",
        headers: {
            "content-Type": "application/json"
        },
        body: JSON.stringify({
            firstName,
            lastName,
            password,
            email,
            pic: url,
            pic_id: id
        })
    }).then(res => res.json())
        .then(data => {
            if (data.error) {
                document.getElementById('firstName').value = ""
                document.getElementById('lastName').value = ""
                document.getElementById('email').value = ""
                document.getElementById('password').value = ""
                document.getElementById('confirmPassword').value = ""
                document.querySelector('.toast-head').innerText = "Error !"
                document.querySelector('.toast-body').innerText = data.error
                $(document).ready(() => {
                    $('.toast').toast('show')
                })
            }
            else {
                window.location.href = `${window.location.origin}/signin`
            }

        })
        .catch(e => console.log(e))
}