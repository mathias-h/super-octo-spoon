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

    function matchPasswords(){
        if(password.val() != passwordRepeat.val()){
            passwordRepeat[0].setCustomValidity('Kodeord ikke ens');
        }else if(!passwordRepeat.val()){
            passwordRepeat[0].setCustomValidity('Kodeord er ikke udfyldt');
        }else if(passwordRepeat.val().length < 8) {
            passwordRepeat[0].setCustomValidity('Kodeord er for kort');
        }else{
            passwordRepeat[0].setCustomValidity('');
        }

        $('#passwordFields').addClass('was-validated');
    }

    $('#inputCreateUser-password').keyup(() => {
        if(!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password.val())){
            password[0].setCustomValidity('Usikkert kodeord');
        }else{
            password[0].setCustomValidity('');
        }

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
            const userData = {username: data.consultant, password: data.password, isAdmin: data.isSuperUser == "on"};
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