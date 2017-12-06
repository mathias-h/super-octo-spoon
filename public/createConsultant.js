'use strict';

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
        if (password.val() != passwordRepeat.val()) {
            passwordRepeat[0].setCustomValidity('Kodeord ikke ens');
            passwordRepeat.addClass('is-invalid');
        } else {
            passwordRepeat[0].setCustomValidity('');
            passwordRepeat.removeClass('is-invalid');
            const result = validatePassword(password.val());

            console.log(result);
            if (result === true) {
                password[0].setCustomValidity('');
                password.removeClass('is-invalid');
            }
            else password[0].setCustomValidity(result);
        }
    }

    function validatePassword(passedPassword) {
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

    password.keyup(() => {
        const result = validatePassword(password.val());

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
            })
                .done(location.reload())
                .catch(() => {
                    // TODO: Error handling når server side validering fejler
                });
        }

        form.classList.add('was-validated');
    }, false);

});