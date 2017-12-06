'use strict'

window.addEventListener('load', function () {

    
    const form = document.getElementById('createSeasonForm')
    if (!form) return

    $("#createSeasonCancel").click(() => {
        $("#seasonInput").val("");
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();

        var seasonOK = true;
        for (var i = 0; i < $("#season")[0].options.length; i++){
            if ($("#seasonInput")[0].value === $("#season")[0][i].text.substring(6)){
                seasonOK = false
            }
        }

        if(!seasonOK){
            $('#alert-season').append('<div class="alert alert-danger alert-dismissible" id="errorMessage" role="alert">Sæson er allerede oprettet<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');
        }

        if (form.checkValidity() === true){
            var consultantData = $("#seasonInput").val()
            $.ajax({
                url: "/season",
                method: "POST",
                data: JSON.stringify({consultantData}),
                contentType: "application/json"
            })
                .then(() => location.reload())
                .catch(() => {
                if ($(".alert").length === 0){
                $('#alert-season').append('<div class="alert alert-danger alert-dismissible" id="errorMessage" role="alert">' +
                        'Sæson er allerede oprettet<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
                        '<span aria-hidden="true">&times;</span></button></div>');
            }});
        }

    },false)

})