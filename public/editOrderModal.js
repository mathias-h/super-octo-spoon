class EditOrderModal {
    constructor() {
        const save = () =>
            this.save().then(() => location.reload()).catch(() => {
                // TODO handle validation error
            });

        this.modal = $("#editOrderModal");
        this.form = $("#orderEditForm");
        const _this = this;

        $("tbody tr").click(function (evt) {
            const orderId = this.getAttribute("data-order-id");
            _this.show(orderId)
        });

        $("#orderEditForm").submit(evt => {
            evt.preventDefault();
            evt.stopPropagation();

            save()
        
            return false;
        });
        $("#orderEditForm").on("keyup", evt => {
            if (evt.key === "Enter") {
                save()
            }
        })

        $("#editOrderModal #inputLandlineNumber").on("input", () => this.validatePhoneNumbers());
        $("#editOrderModal #inputPhoneNumber").on("input", () => this.validatePhoneNumbers());

        this.form[0].classList.add("was-validated")
    }

    validatePhoneNumbers() {
        const landline = $("#editOrderModal #inputLandlineNumber");
        const mobile = $("#editOrderModal #inputPhoneNumber");

        landline[0].setCustomValidity("");
        mobile[0].setCustomValidity("");

        if(!(landline[0].validity.valid && landline.val()) && !(mobile[0].validity.valid && mobile.val())){
            landline[0].setCustomValidity("Mindst et telefonnummer skal angives");
            mobile[0].setCustomValidity("Mindst et telefonnummer skal angives");
        }else{
            landline[0].setCustomValidity("");
            mobile[0].setCustomValidity("");
        }
    }

    setOrder(orderId) {
        function setDate(input, date) {
            if (!date) input.val("")
            else input.val(moment(new Date(date)).format("YYYY-MM-DD"));
        }
        return $.get(`/order/${orderId}`).then(order => {
            this.orderId = orderId;
            $("#editOrderModal #inputConsultant").val(order.consultant);
            setDate($("#editOrderModal #inputSignedDate"), order.signedDate)
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
            setDate($("#editOrderModal #inputMapDate"), order.mapDate)
            setDate($("#editOrderModal #inputMapSample"), order.mapSample)
            $("#editOrderModal #inputSampleTime").val(order.sampleTime);
            $("#editOrderModal #inputMgSamples").val(order.mgSamples);
            $("#editOrderModal #inputCutSamples").val(order.cutSamples);
            $("#editOrderModal #inputOtherSamples").val(order.otherSamples);
            setDate($("#editOrderModal #inputLabDate"), order.labDate)
            setDate($("#editOrderModal #inputFromLabDate"), order.fromLabDate)
            setDate($("#editOrderModal #inputMO"), order.mO)
            setDate($("#editOrderModal #inputReceptApproved"), order.receptApproved)
        });
    }

    save() {
        if (!this.form[0].checkValidity()) {
            throw new Error("form not valid")
        }

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