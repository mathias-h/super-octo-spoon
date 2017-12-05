window.addEventListener("load", () => {
    async function updateUser(btn) {
        const row = btn.parentElement.parentElement
        const userId = row.getAttribute("data-user-id")

        const name = row.querySelector(".editUserUsername").value
        const isAdmin = row.querySelector(".editUserIsAdmin").checked
        const passwordInput = row.querySelector(".editUserPassword")
        const password = passwordInput ? passwordInput.value : undefined

        const user = {
            name,
            isAdmin,
            password
        }

        const result = validatePassword(password)

        if (result !== true) {
            throw new Error(result)
            // TODO show error message
        }

        if (passwordInput) {
            passwordInput.parentElement.removeChild(passwordInput)
        }

        await $.ajax({
            url: "/user/" + userId,
            method: "PUT",
            data: JSON.stringify(user),
            contentType: "application/json"
        })
    }

    async function deleteUser(btn) {
        const row = btn.parentElement.parentElement
        const userId = row.getAttribute("data-user-id")

        await $.ajax({
            url: "/user/" + userId,
            method: "DELETE",
            contentType: "application/json"
        })
        
        row.parentElement.removeChild(row)
    }

    function changePassword(btn) {
        const th = btn.parentElement
        $(th).append($('<input class="form-control editUserPassword" type="password" name="skift kode" placeholder="Nyt kodeord"/>'))
    }

    $(".user").each(function () {
        this.querySelector(".editUserDeleteBtn").addEventListener("click", function() {
            deleteUser(this)
        })
        this.querySelector(".editUserSaveBtn").addEventListener("click", function() {
            updateUser(this)
        })
        this.querySelector(".editUserPasswordBtn").addEventListener("click", function() {
            changePassword(this)
        })
    })
})