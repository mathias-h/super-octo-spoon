class EditOrderModal {
    constructor() {

        function updateTotal() {
            const mgSamples = +$("#editOrderModal #inputMgSamples").val()
            const cutSamples = +$("#editOrderModal #inputCutSamples").val()
            const otherSamples = +$("#editOrderModal #inputOtherSamples").val()
            const total = mgSamples + cutSamples + otherSamples

            $("#totalSamplesTaken span").text(total)
        }

        this.modal = $("#editOrderModal");
        this.form = $("#orderEditForm");
        const _this = this;

        $("tbody tr").click(function (evt) {
            const orderId = this.getAttribute("data-order-id");
            _this.show(orderId).then(updateTotal)
        });

        $("#orderEditForm").submit(evt => {
            evt.preventDefault();
            evt.stopPropagation();

            this.save().then(() => location.reload());
        
            return false;
        });
        $("#orderEditForm").on("keyup", evt => {
            if (evt.key === "Enter") {
                this.save().then(() => location.reload());
            }
        })

        $("#editOrderModal #inputMgSamples").on("change", updateTotal);
        $("#editOrderModal #inputCutSamples").on("change", updateTotal);
        $("#editOrderModal #inputOtherSamples").on("change", updateTotal);
    }

    setOrder(orderId) {
        return $.get(`/order/${orderId}`).then(order => {
            this.orderId = orderId;
            $("#editOrderModal #inputConsultant").val(order.consultant);
            $("#editOrderModal #inputSignedDate").val(moment(new Date(order.signedDate)).format("YYYY-MM-DD"));
            $("#editOrderModal #inputName").val(order.name);
            $("#editOrderModal #inputFarmName").val(order.farmName);
            $("#editOrderModal #inputStreet").val(order.address.street);
            $("#editOrderModal #inputCity").val(order.address.city);
            $("#editOrderModal #inputZip").val(order.address.zip);
            $("#editOrderModal #inputLandlineNumber").val(order.landlineNumber);
            $("#editOrderModal #inputPhoneNumber").val(order.phoneNumber);
            $("#editOrderModal #inputComment").val(order.comment);
            $("#editOrderModal #inputSampleDensity").val(order.sampleDensity);
            $("#editOrderModal #inputSamePlanAsLast")[0].checked = order.samePlanAsLast;
            $("#editOrderModal #inputTakeOwnSamples")[0].checked = order.takeOwnSamples;
            $("#editOrderModal #inputArea").val(order.area);
            $("#editOrderModal #inputMapDate").val(moment(new Date(order.mapDate)).format("YYYY-MM-DD"));
            $("#editOrderModal #inputMapSample").val(moment(new Date(order.mapSample)).format("YYYY-MM-DD"));
            $("#editOrderModal #inputSampleTime").val(order.sampleTime);
            $("#editOrderModal #inputMgSamples").val(order.mgSamples);
            $("#editOrderModal #inputCutSamples").val(order.cutSamples);
            $("#editOrderModal #inputOtherSamples").val(order.otherSamples);
            $("#editOrderModal #inputLabDate").val(moment(new Date(order.labDate)).format("YYYY-MM-DD"));
            $("#editOrderModal #inputFromLabDate").val(moment(new Date(order.fromLabDate)).format("YYYY-MM-DD"));
            $("#editOrderModal #inputMO").val(moment(new Date(order.mO)).format("YYYY-MM-DD"));
            $("#editOrderModal #inputReceptApproved").val(moment(new Date(order.receptApproved)).format("YYYY-MM-DD"));
            $("#editOrderModal #inputMO").val(moment(new Date(order.mO)).format("YYYY-MM-DD"));
        });
    }

    save() {
        const order = convertFormToObject(this.form[0]);
        order._id = this.orderId;

        order.samePlanAsLast = $("#editOrderModal #inputSamePlanAsLast")[0].checked;
        order.takeOwnSamples = $("#editOrderModal #inputTakeOwnSamples")[0].checked;

        order.address = {
            street: order.street,
            city: order.city,
            zip: order.zip
        };

        delete order.street;
        delete order.city;
        delete order.zip;

        return $.ajax({
            type: 'POST',
            url: '/order',
            data: JSON.stringify(order),
            contentType: "application/json"
        });
    }

    show(orderId) {
        return this.setOrder(orderId).then(() => this.modal.modal("show"));
    }
}