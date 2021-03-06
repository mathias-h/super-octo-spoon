function convertFormToObject(form) {
    const data = {};
    const f = new FormData(form);
    for (const [key,value] of f.entries()) {
        data[key] = value;
    }
    return data;
}

window.addEventListener('load', function() {
    const form = document.getElementById('login-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();

        const data = convertFormToObject(form);
        $.ajax({
            statusCode: {
                401: () => {
                    if ($(".alert").length === 0) {
                        $('#alert-box').append('<div class="alert alert-danger alert-dismissible" id="errorMessage" role="alert">Brugernavn eller kodeord er ikke korrekt. <br>Husk at brugernavn er case sensitive.<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');
                    }
                }
            },
            url: "/login",
            method: "POST",
            data: JSON.stringify(data),
            headers: {
                "content-type": "application/json"
            },

            success: () => {
                location.replace('/');
            }
        })
            .catch(() => {
                if ($(".alert").length === 0) {
                    $('#alert-box').append('<div class="alert alert-danger alert-dismissible" id="errorMessage" role="alert">Fatal fejl, kontakt system administrator<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');
                }
            });
    }, false);
});