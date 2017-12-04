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