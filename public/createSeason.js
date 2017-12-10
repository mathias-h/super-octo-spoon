'use strict'

window.addEventListener('load', function () {

    let season = $("#seasonInput");
    const form = document.getElementById('createSeasonForm')
    if (!form) return

    $("#createSeasonCancel").click(() => {
        season.val("");
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();

        var seasonOK = true;
        for (var i = 0; i < $("#season")[0].options.length; i++){
            if (season[0].value === $("#season")[0][i].text.substring(6)){
                seasonOK = false
            }
        }

        if(!seasonOK){
            season[0].setCustomValidity("Sæson er findes allerede");
            $("#smallCreateSeason-season").text("Sæson er findes allerede");
            season.addClass("is-invalid");
        }

        season.keyup(() => {
            season[0].setCustomValidity("");
            $("#smallCreateSeason-season").text("");
            season.removeClass("is-invalid");
        });

        if (form.checkValidity() === true){
            var consultantData = season.val()
            $.ajax({
                url: "/season",
                method: "POST",
                data: JSON.stringify({consultantData}),
                contentType: "application/json"
            })
                .then(() => location.reload())
                .catch(() => {
                if ($(".alert").length === 0){
                $('#alert-season').append('<div class="alert alert-danger" id="errorMessage" role="alert">' +
                        'Sæson er allerede oprettet</div>');
            }});
        }

    },false)

})