"use strict";

function convertFormToObject(form) {
    const data = {};
    const f = new FormData(form);
    for (const [key,value] of f.entries()) {
        data[key] = value;
    }
    return data;
}

$(document).ready(() => {
    $("#createConsultantCancel").click(() => {
        clearCreateConsultant();
    });

    $("#createConsultantClose").click(() => {
        clearCreateConsultant();
    });

    $(document).keyup((e) => {
        if(e.which == 27){
            clearCreateConsultant();
        }
    });

    let consultant = $("#inputCreateConsultant-consultant");
    let password = $("#inputCreateConsultant-password");
    let passwordRepeat = $("#inputCreateConsultant-passwordRepeat");

    function clearCreateConsultant(){
        consultant.val("");
        $("#inputCreateConsultant-isSuperConsultant").prop("checked", false);
        password.val("");
        passwordRepeat.val("");

        $("#createConsultantForm").removeClass("was-validated");
        $("#passwordFields").removeClass("was-validated");
    }

    function validatePassword() {
        if (!password.val()){
            password.addClass("is-invalid");
            password[0].setCustomValidity("Kodeord er ikke udfyldt");
            $("#smallCreateConsultant-password").text("Kodeord er ikke udfyldt")
        }else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password.val())){
            password.addClass("is-invalid");
            password[0].setCustomValidity("Kodeord skal indeholde mindst et tal, et stort bogstav og et lille bogstav, og være mindst 8 karaktere langt");
            $("#smallCreateConsultant-password").text("Kodeord skal indeholde mindst et tal, et stort bogstav og et lille bogstav, og være mindst 8 karaktere langt");
        }else{
            password.removeClass("is-invalid");
            password[0].setCustomValidity("");
            $("#smallCreateConsultant-password").text("");
        }
    }

    function matchPasswords() {
        if (password.val() !== passwordRepeat.val()) {
            passwordRepeat[0].setCustomValidity("Kodeord ikke ens");
            $("#smallCreateConsultant-passwordRepeat").text("Kodeord er ikke ens");
            passwordRepeat.addClass("is-invalid");
        }else if (passwordRepeat.val().length === 0) {
            passwordRepeat[0].setCustomValidity("Kodeord er ikke udfyldt");
            $("#smallCreateConsultant-passwordRepeat").text("");
            passwordRepeat.addClass("is-invalid");
        } else {
            passwordRepeat[0].setCustomValidity("");
            $("#smallCreateConsultant-passwordRepeat").text("");
            passwordRepeat.removeClass("is-invalid");
        }
    }

    consultant.keyup(() => {
        consultant[0].setCustomValidity("");
        $("#smallCreateConsultant-consultant").text("");
        consultant.removeClass("is-invalid");
    });

    password.keyup(() => {
        validatePassword();
        matchPasswords();
    });

    passwordRepeat.keyup(() => {
        matchPasswords();
    });

    const form = document.getElementById("createConsultantForm");
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        event.stopPropagation();

        matchPasswords();

        if (form.checkValidity() === true) {
            const data = convertFormToObject(form);
            const consultantData = {name: data.consultant, password: data.password, isAdmin: data.isSuperUser == "on"};
            $.ajax({
                statusCode: {
                    409: () => {
                        consultant[0].setCustomValidity("Initialerne bliver allerede brugt");
                        $("#smallCreateConsultant-consultant").text("Initialerne bliver allerede brugt");
                        consultant.addClass("is-invalid");
                    }
                },
                url: "/consultant",
                method: "POST",
                data: JSON.stringify(consultantData),
                headers: {
                    "content-type": "application/json"
                }
            })
                .then(() => location.reload());
        }

        form.classList.add("was-validated");
    }, false);

});