const token = window.location.href.replace(`${window.location.origin}/reset/`, '')
let password = document.getElementById('password')

document.getElementById('updatePassword').addEventListener('submit', (e) => {
    e.preventDefault()
    fetch(`/new-password`, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token,
            password: password.value
        })
    }).then(res => res.json())
        .then(data => {
            document.querySelector('.toast-head').innerText = data.message ? "Success !" : "Error !"
            document.querySelector('.toast-body').innerText = data.error || data.message
            $(document).ready(() => {
                $('.toast').toast('show')
            })
            setTimeout(() => {
                if (data.error) {
                    window.location.href = `${window.location.origin}/resetPassword`
                }
                else {
                    window.location.href = `${window.location.origin}/signin`
                }
            }, 4000);
        }).catch(e => {
            console.log(e)
        })
})