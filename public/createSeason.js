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
            var userData = $("#seasonInput").val()
            console.log(userData)
            $.ajax({
                url: "/season",
                method: "POST",
                data: JSON.stringify({userData}),
                headers: {
                    "content-type": "application/json"
                }
            }).then(location.reload());
        }

    },false)

})