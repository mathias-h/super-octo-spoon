class EditOrderModal {
    constructor() {
        this.modal = $("#editOrderModal")
        this.form = $("#orderEditForm")
        const _this = this

        $("tbody tr").click(function (evt) {
            const orderId = this.getAttribute("data-order-id")
            _this.show(orderId)
        })

        $("#orderEditForm").submit(evt => {
            evt.preventDefault()
            evt.stopPropagation()

            this.save().then(() => location.reload())
        
            return false
        })
    }

    setOrder(orderId) {
        return $.get(`/order/${orderId}`).then(order => {
            this.orderId = orderId
            $("#editOrderModal #inputConsultant").val(order.consultant)
            $("#editOrderModal #inputSignedDate").val(moment(new Date(order.signedDate)).format("YYYY-MM-DD"));
            $("#editOrderModal #inputName").val(order.name)
            $("#editOrderModal #inputFarmName").val(order.farmName)
            $("#editOrderModal #inputStreet").val(order.address.street)
            $("#editOrderModal #inputCity").val(order.address.city)
            $("#editOrderModal #inputZip").val(order.address.zip)
            $("#editOrderModal #inputLandlineNumber").val(order.landlineNumber)
            $("#editOrderModal #inputPhoneNumber").val(order.phoneNumber)
            $("#editOrderModal #inputComment").val(order.comment)
            $("#editOrderModal #inputSampleDensity").val(order.sampleDensity)
            console.log(document.body)
            $("#editOrderModal #inputSamePlanAsLast")[0].checked = order.samePlanAsLast
            $("#editOrderModal #inputTakeOwnSamples")[0].checked = order.takeOwnSamples
            $("#editOrderModal #inputArea").val(order.area)
        })
    }

    save() {
        const order = convertFormToObject(this.form[0])
        order._id = this.orderId

        order.samePlanAsLast = $("#editOrderModal #inputSamePlanAsLast")[0].checked
        order.takeOwnSamples = $("#editOrderModal #inputTakeOwnSamples")[0].checked

        order.address = {
            street: order.street,
            city: order.city,
            zip: order.zip
        }

        delete order.street
        delete order.city
        delete order.zip

        return $.ajax({
            type: 'POST',
            url: '/order',
            data: JSON.stringify(order),
            contentType: "application/json"
        })
    }

    show(orderId) {
        return this.setOrder(orderId).then(() => this.modal.modal("show"))
    }
}