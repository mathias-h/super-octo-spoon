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
    new EditOrderModal();

    $("#inputSignedDate").val(moment(new Date()).format("YYYY-MM-DD"));
    $("#inputSignedDate").val(moment(new Date()).format("YYYY-MM-DD"));

    $("#orderCreateCancel").click(() => {
        clearOrderCreate();
    });

    $("#orderCreateClose").click(() => {
        clearOrderCreate();
    });

    $(document).keyup((e) => {
        if(e.which == 27){
            clearOrderCreate();
        }
    });

    function getCurrentDate(){
        var d = new Date();
        var month = d.getMonth()+1;
        var day = d.getDate();

        return d.getFullYear() + '/' + (month<10 ? '0' : '') + month + '/' + (day<10 ? '0' : '') + day;
    }

    const form = document.getElementById('orderCreateForm');
    function clearOrderCreate(){
        // TODO: Sæt konsulent tilbage til bruger
        $("#inputSignedDate").val(getCurrentDate());
        $("#inputName").val("");
        $("#inputFarmName").val("");
        $("#inputStreet").val("");
        $("#inputZip").val("");
        $("#inputCity").val("");
        $("#inputLandlineNumber").val("");
        $("#inputPhoneNumber").val("");
        $("#inputComment").val("");

        $(form).removeClass('was-validated');
    }

    $(form).keypress((e) => {
        if(e.which == 13){
            event.preventDefault();
            event.stopPropagation();

            $("#orderCreateSubmit").click();

            return false;
        }
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();

        const landline = $("#inputLandlineNumber");
        const mobile = $("#inputPhoneNumber");

        landline[0].setCustomValidity("");
        mobile[0].setCustomValidity("");

        if(!(landline[0].validity.valid && landline.val()) && !(mobile[0].validity.valid && mobile.val())){
            landline[0].setCustomValidity("Mindst et telefonnummer skal angives");
            mobile[0].setCustomValidity("Mindst et telefonnummer skal angives");
        }else{
            landline[0].setCustomValidity("");
            mobile[0].setCustomValidity("");
        }

        if (form.checkValidity() === true) {
            const data = convertFormToObject(form);
            $.ajax({
                url: "/order",
                method: "POST",
                data: JSON.stringify(data),
                headers: {
                    "content-type": "application/json"
                }
            }).then(location.reload());
        }

        form.classList.add('was-validated');
    }, false);

    $(".sortable").click(function () {
        var id = $(this).attr("id");
        var ls = location.search;
        var order = (ls.indexOf("order=asc")!==-1) ? "&order=desc" : "&order=asc";
        if (ls.length === 0 || (ls.indexOf("sortBy")!==-1 && ls.indexOf("query") === -1)){
            location.search = "sortBy=" + id + order;
        }
        else if (ls.indexOf("query") !== -1 && ls.indexOf("sortBy") === -1){
            location.search += "&sortBy=" + id + order;
        }else {
            location.search = location.search.substring(0,location.search.indexOf("&")) + "&sortBy=" + id + order;
        }
    })
});