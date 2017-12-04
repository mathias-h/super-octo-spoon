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
    $("#createUserCancel").click(() => {
        clearCreateUser();
    });

    $("#createUserClose").click(() => {

        clearCreateUser();
    });

    $(document).keyup((e) => {
        if(e.which == 27){
            clearCreateUser();
        }
    });

    function clearCreateUser(){
        $("#inputCreateUser-consultant").val("");
        $("#inputCreateUser-isSuperUser").prop('checked', false);
        $("#inputCreateUser-password").val("");
        $("#inputCreateUser-passwordRepeat").val("");

        $('#createUserForm').removeClass('was-validated');
        $('#passwordFields').removeClass('was-validated');
    }

    var password = $('#inputCreateUser-password');
    var passwordRepeat = $('#inputCreateUser-passwordRepeat');

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

    $('#inputCreateUser-password').keyup(() => {
        matchPasswords();
    });

    $('#inputCreateUser-passwordRepeat').keyup(() => {
        matchPasswords();
    });

    const form = document.getElementById('createUserForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();

        matchPasswords();

        if (form.checkValidity() === true) {
            const data = convertFormToObject(form);
            const userData = {name: data.consultant, password: data.password, isAdmin: data.isSuperUser == "on"};
            $.ajax({
                url: "/user",
                method: "POST",
                data: JSON.stringify(userData),
                headers: {
                    "content-type": "application/json"
                }
            }).then(location.reload());
        }

        form.classList.add('was-validated');
    }, false);

});