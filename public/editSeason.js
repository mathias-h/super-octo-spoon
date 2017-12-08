window.addEventListener("load", function () {
    $(".season").each(function () {
        const seasonId = this.getAttribute("data-season-id")
        const saveBtn = this.querySelector(".editSeasonSaveBtn")
        const input = this.querySelector(".editSeasonInput")

        saveBtn.addEventListener("click", async () => {
            const season = input.value

            await $.ajax({
                url: "/season/" + seasonId,
                method: "PUT",
                data: JSON.stringify({ season }),
                contentType: "application/json"
            }).then(() => location.reload()).catch(err => {
                // TODO handle error
            })
        })
    })
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