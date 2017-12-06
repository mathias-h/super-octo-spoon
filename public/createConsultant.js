'use strict';

function validatePassword(password) {
    if (!password) return "Kodeord er ikke udfyldt."
    if (password.length < 8) return "Kodeord er for kort."
    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)) return "Kode skal indeholde midst et tal, et stort og et lille bogstav."
    return true
}

function convertFormToObject(form) {
    const data = {};
    const f = new FormData(form);
    for (const [key,value] of f.entries()) {
        data[key] = value;
    }
    return data;
}

window.addEventListener('load', function() {
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

    function clearCreateConsultant(){
        $("#inputCreateConsultant-consultant").val("");
        $("#inputCreateConsultant-isSuperConsultant").prop('checked', false);
        $("#inputCreateConsultant-password").val("");
        $("#inputCreateConsultant-passwordRepeat").val("");

        $('#createConsultantForm').removeClass('was-validated');
        $('#passwordFields').removeClass('was-validated');
    }

    var password = $('#inputCreateConsultant-password');
    var passwordRepeat = $('#inputCreateConsultant-passwordRepeat');

    function matchPasswords() {
        console.log(password.val(), passwordRepeat.val())
        if (password.val() != passwordRepeat.val()) {
            passwordRepeat[0].setCustomValidity('Kodeord ikke ens');
        } else {
            passwordRepeat[0].setCustomValidity('');
            const result = validatePassword(password.val());

            if (result === true) password[0].setCustomValidity('');
            else password[0].setCustomValidity(result);
        }
    }

    $('#inputCreateConsultant-password').keyup(() => {
        matchPasswords();
    });

    $('#inputCreateConsultant-passwordRepeat').keyup(() => {
        matchPasswords();
    });

    const form = document.getElementById('createConsultantForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();

        matchPasswords();

        if (form.checkValidity() === true) {
            const data = convertFormToObject(form);
            const consultantData = {name: data.consultant, password: data.password, isAdmin: data.isSuperUser == "on"};
            $.ajax({
                url: "/consultant",
                method: "POST",
                data: JSON.stringify(consultantData),
                headers: {
                    "content-type": "application/json"
                }
            }).then(() => location.reload());
        }

        form.classList.add('was-validated');
    }, false);

});