//TODO editSeason ala editConsultant

//click button - for each season default=false | this.default=true

window.addEventListener("load", function () {
    $("#setDefaultSeasonBtn").click(async function () {
        const seasonID = $("#seasonDefaultSelect").val()

        await $.ajax({
            url: "/season/default/"+ seasonID,
            method: "PUT",
            data: JSON.stringify({seasonID}),
            contentType: "application/json"
        }).catch(function (error) {
            throw error
        })

        $("#defaultSeasonSat").show()
    })

    $("#seasonDefaultSelect").change(function () {
        $("#defaultSeasonSat").hide()
    })
    $("#editSeason-tab").on("hidden.bs.tab", function () {
        $("#defaultSeasonSat").hide()
    })
    $("#adminModal").on("hidden.bs.modal", function () {
        $("#defaultSeasonSat").hide()
    })
})