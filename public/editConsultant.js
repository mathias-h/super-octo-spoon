window.addEventListener("load", () => {
    async function updateConsultant(btn) {
        const row = btn.parentElement.parentElement
        const consultantId = row.getAttribute("data-consultant-id")

        const name = row.querySelector(".editConsultantName").value
        const isAdmin = row.querySelector(".editConsultantIsAdmin").checked
        const passwordInput = row.querySelector(".editConsultantPassword")
        const password = passwordInput ? passwordInput.value : undefined

        const consultant = {
            name,
            isAdmin,
            password
        }

        function validatePassword(password) {
            if (!password){
                return "Kodeord er ikke udfyldt";
            }else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)){
                console.log(password);
                return "Kodeord skal indeholde mindst et tal, et stort bogstav og et lille bogstav, og være mindst 8 karaktere langt";
            }else{
                return true;
            }
        }

        const result = validatePassword(password);

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

        const row = btn.parentElement.parentElement;
        const consultantId = row.getAttribute("data-consultant-id");

        await $.ajax({
            url: '/consultant/' + consultantId,
            method: 'DELETE'
        });
        row.parentElement.removeChild(row)
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