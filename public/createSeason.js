'use strict'

window.addEventListener('load', function () {

    $("#createSeasonCancel").click(() => {
        $("#seasonInput").val("");
    });

    const form = document.getElementById('createSeasonForm')
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity() === true){
            var consultantData = $("#seasonInput").val()
            $.ajax({
                url: "/season",
                method: "POST",
                data: JSON.stringify({consultantData}),
                contentType: "application/json"
            }).then(() => location.reload());
        }

    },false)

})