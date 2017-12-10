window.addEventListener("load", () => {
    function validatePassword(password) {
        if (!password){
            return "Kodeord er ikke udfyldt";
        }else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)){
            return "Kodeord skal indeholde mindst et tal, et stort bogstav og et lille bogstav, og være mindst 8 karaktere langt";
        }else{
            return true;
        }
    }

    function setAlertBox(text){
        let alertBox = $(".alert", "#alert-createConsultant");
        if(alertBox.length === 0){
            $("#alert-createConsultant").prepend("<div class='alert alert-danger alert-dismissible' role='alert'>" + text + "</div>");
        }else{
            alertBox.text(text);
        }
    }

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

        if (password) {
            const result = validatePassword(password)
            
            if (result !== true) {
                setAlertBox(result);

                return;
            }
            if (passwordInput) {
                passwordInput.parentElement.removeChild(passwordInput)
            }
        }

        await $.ajax({
            statusCode: {
                500: () => { setAlertBox("Brugernavnet bliver allerede brugt"); },
                403: () => { setAlertBox("Kan ikke ændre superbruger status for egen bruger"); }
            },
            url: "/consultant/" + consultantId,
            method: "PUT",
            data: JSON.stringify(consultant),
            contentType: "application/json"
        })
            .then(() => location.reload());
    }
    
    async function deleteConsultant(btn) {

        const row = btn.parentElement.parentElement;
        const consultantId = row.getAttribute("data-consultant-id");

        await $.ajax({
            statusCode: {
                403: () => { setAlertBox("Kan ikke slette egen bruger"); }
            },
            url: '/consultant/' + consultantId,
            method: 'DELETE'
        }).then(() => {
            row.parentElement.removeChild(row);
        });
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