if (document.referrer === `${window.location.origin}/signin`) {
    document.querySelector('.toast-head').value = "Success !"
    document.querySelector('.toast-body').innerText = "User Saved successfully !"
    $(document).ready(() => {
        $('.toast').toast('show')
    })
}

let loginForm = document.getElementById('login')
loginForm.addEventListener('submit', (e) => {
    e.preventDefault()

    let email = document.getElementById('email').value
    let password = document.getElementById('password').value

    fetch('/signin', {
        method: "post",
        headers: {
            "content-Type": "application/json"
        },
        body: JSON.stringify({
            password,
            email,
        })
    }).then(res => res.json())
        .then(data => {
            if (data.error) {
                document.getElementById('email').value = ""
                document.getElementById('password').value = ""
                document.querySelector('.toast-head').innerText = "Error !"
                document.querySelector('.toast-body').innerText = data.error
                $(document).ready(() => {
                    $('.toast').toast('show')
                })
            }
            else {
                localStorage.setItem("jwt", data.token)
                localStorage.setItem("user", JSON.stringify(data.user))
                window.location.href = `${window.location.origin}/dashboard`
            }

        })
        .catch(e => console.log(e))
})