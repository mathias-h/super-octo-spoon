window.addEventListener("load", () => {
    async function updateConsultant(btn) {
        const row = btn.parentElement.parentElement
        const consultantId = row.getAttribute("data-consultant-id")

        const name = row.querySelector(".editConsultantName").value
        const isAdmin = row.querySelector(".editConsultantIsAdmin").checked
        const passwordInput = row.querySelector(".editConsultantPassword")
        const password = passwordInput ? passwordInput.value : undefined

        const consultant = {
            name: name,
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
            url: "/consultant/" + consultantId,
            method: "PUT",
            data: JSON.stringify(consultant),
            contentType: "application/json"
        })
    }

    async function deleteConsultant(btn) {
        const row = btn.parentElement.parentElement
        const consultantId = row.getAttribute("data-consultant-id")

        await $.ajax({
            url: "/consultant/" + consultantId,
            method: "PUT",
            data: JSON.stringify({ dummy: true }),
            contentType: "application/json"
        })

        row.parentElement.removeChild(row)

        // TODO - skal ændres så det stemmer overens med delete
        // Forslag til ny kode:

        /*
        const row = btn.parentElement.parentElement
        const consultantId = row.getAttribute("data-consultant-id")

        await $.ajax({
            url: '/consultant/' + consultantId,
            method: 'DELETE',
            sucess: function () {
                row.parentElement.removeChild(row)
            }
        });
        // Der mangler muligvis noget fejlhåndtering her.
        */
    }

    function changePassword(btn) {
        const th = btn.parentElement
        $(th).append($('<input class="form-control editConsultantPassword" type="password" name="skift kode" placeholder="Nyt kodeord"/>'))
    }

    $(".consultant").each(function () {
        this.querySelector(".editConsultantDeleteBtn").addEventListener("click", function() {
            deleteConsultant(this)
        })
        this.querySelector(".editConsultantSaveBtn").addEventListener("click", function() {
            updateConsultant(this)
        })
        this.querySelector(".editConsultantPasswordBtn").addEventListener("click", function() {
            changePassword(this)
        })
    })
})