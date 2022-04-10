document.getElementById('resetPassword').addEventListener('submit', (e) => {
    e.preventDefault()

    let email = document.getElementById('email').value

    fetch(`/reset-password`, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email
        })
    }).then(res => res.json())
        .then(data => {
            document.querySelector('.toast-head').innerText = data.message ? "Success !" : "Error !"
            document.querySelector('.toast-body').innerText = data.error || data.message
            $(document).ready(() => {
                $('.toast').toast('show')
            })
            setTimeout(() => {
                if (data.message) window.location.href = `${window.location.origin}/signin`
            }, 4000);
        }).catch(e => {
            console.log(e)
        })

})