/*
function deleteDynamicColumn(row) {
    const id = row.getAttribute("data-id");

    row.parentElement.removeChild(row);
    
    return $.ajax({
        url: "/dynamic/" + id,
        method: "DELETE"
    });
}

function addDynamicColumn() {
    const name = $("#dynamicColumnName").val();
    const fase = +$("#dynamicColumnFase").val();

    $.ajax({
        statusCode: {
            500: () => {
                $("#alert-createDynamic").text("Ugyldig handling");
            }
        },
        url: "/dynamic",
        method: "POST",
        data: JSON.stringify({ name, fase }),
        contentType: "application/json"
    }).then(res => location.reload())
}

window.addEventListener("load", () => {
    $("#dynamicColumn table tbody tr").each(function() {
        this.querySelector(".sletDynamicColumn").addEventListener("click", () => deleteDynamicColumn(this))
    })

    $("#dynamicColumnBtn").click(addDynamicColumn)
})
*/

/**
 * New shizzle
 */
function deleteDynamicColumn(row) {
    const id = row.getAttribute("data-id");

    row.parentElement.removeChild(row);

    return $.ajax({
        url: "/dynamic/" + id,
        method: "DELETE"
    });
}

$(document).ready(() => {
    $("#dynamicColumn table tbody tr").each(function() {    
        this.querySelector(".sletDynamicColumn").addEventListener("click", () => deleteDynamicColumn(this))
    })

    const form = document.getElementById("createDynamicForm");
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        event.stopPropagation();

        const name = $("#dynamicColumnName").val();
        const fase = +$("#dynamicColumnFase").val();

        $.ajax({
            statusCode: {
                500: () => {
                    let alertBox = $(".alert", "#alert-createDynamic");
                    if(alertBox.length === 0){
                        $("#alert-createDynamic").prepend("<div class='alert alert-danger alert-dismissible' role='alert'>Ugyldig handling</div>");
                    }else{
                        alertBox.text("Ugyldig handling");
                    }
                }
            },
            url: "/dynamic",
            method: "POST",
            data: JSON.stringify({ name, fase }),
            contentType: "application/json"
        }).then(res => location.reload());
    })
});