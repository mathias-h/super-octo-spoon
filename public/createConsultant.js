"use strict";

function validatePassword(passedPassword, password = { addClass: () => {} }) {
    if (!passedPassword){
        password.addClass('is-invalid');
        return "Kodeord er ikke udfyldt.";
    }

    if (passedPassword.length < 8) {
        password.addClass('is-invalid');
        return "Kodeord er for kort.";
    }

    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(passedPassword)){
        password.addClass('is-invalid');
        return "Kode skal indeholde midst et tal, et stort og et lille bogstav.";
    }

    return true;
}

function convertFormToObject(form) {
    const data = {};
    const f = new FormData(form);
    for (const [key,value] of f.entries()) {
        data[key] = value;
    }
    return data;
}

$(() => {
    const form = document.getElementById('createConsultantForm');
    if (!form) return

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
            passwordRepeat[0].setCustomValidity('');
            passwordRepeat.removeClass('is-invalid');
            const result = validatePassword(password.val(), password);

            console.log(result);
            if (result === true) {
                password[0].setCustomValidity('');
                password.removeClass('is-invalid');
            }
            else password[0].setCustomValidity(result);
        }
    }

    password.keyup(() => {
        const result = validatePassword(password.val(), password);

        if(result !== true){
            password[0].setCustomValidity(result);

            if(password.parent().find('small').length == 1){
                password.parent().find('small').text(result);
            }else{
                password.parent().append('<small class="text-danger">' + result + '</small>');
            }

        }else{
            password[0].setCustomValidity(result);
            password.removeClass('is-invalid');
            password.parent().find('small').remove();
        }

        matchPasswords();
    });

    passwordRepeat.keyup(() => {
        matchPasswords();
    });

    form.addEventListener('submit', function(event) {
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
                .then(() => location.reload())
                .catch(() => {
                    // TODO: Error handling når server side validering fejler
                });
        }

        form.classList.add("was-validated");
    }, false);
});