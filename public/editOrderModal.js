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

        $("#editOrderModal #editInputLandlineNumber").on("input", () => this.validatePhoneNumbers());
        $("#editInputPhoneNumber").on("input", () => this.validatePhoneNumbers());

        this.form[0].classList.add("was-validated")
    }

    validatePhoneNumbers() {
        const landline = $("#editInputLandlineNumber");
        const mobile = $("#editInputPhoneNumber");

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
            $("#editInputConsultant").val(order.consultant);
            setDate($("#editInputSignedDate"), order.signedDate)
            $("#editInputName").val(order.name);
            $("#editInputFarmName").val(order.farmName);
            $("#editInputStreet").val(order.address.street);
            $("#editInputCity").val(order.address.city);
            $("#editInputZip").val(order.address.zip);
            $("#editInputLandlineNumber").val(order.landlineNumber);
            $("#editInputPhoneNumber").val(order.phoneNumber);
            $("#editInputComment").val(order.comment);
            $("#editInputSampleDensity").val(order.sampleDensity);
            $("#editInputSamePlanAsLast")[0].checked = order.samePlanAsLast;
            $("#editInputTakeOwnSamples")[0].checked = order.takeOwnSamples;
            $("#editInputArea").val(order.area);
            setDate($("#inputMapDate"), order.mapDate)
            setDate($("#inputSampleDate"), order.sampleDate)
            $("#inputSampleTime").val(order.sampleTime);
            $("#inputMgSamples").val(order.mgSamples);
            $("#inputCutSamples").val(order.cutSamples);
            $("#inputOtherSamples").val(order.otherSamples);
            setDate($("#inputLabDate"), order.labDate)
            setDate($("#inputFromLabDate"), order.fromLabDate)
            setDate($("#inputMO"), order.mO)
            setDate($("#inputReceptApproved"), order.receptApproved)

            const names = {
                name: "Navn",
                farmName: "Gårdnavn",
                street: "Adresse",
                city: "By",
                zip: "Postnummer",
                landlineNumber: "Fastnet tlf.",
                phoneNumber: "Mobil tlf.",
                comment: "Kommentar",
                sampleDensity: "Prøvetæthed",
                area: "Areal",
                samePlanAsLast: "Samme plan som sidst",
                takeOwnSamples: "Prøver selvudtaget",
                mapDate: "Kort til udtagning",
                sampleDate: "Udtagning dato",
                sampleTime: "Uptagning timer",
                mgSamples: "Mg prøver",
                cutSamples: "Cut prøver",
                otherSamples: "Andre prøver",
                labDate: "Sendt til lab",
                fromLabDate: "Modtaget fra lab",
                mO: "Sendt til markanalyse",
                receptApproved: "Kvitering godkendt"
            }

            $("#log").html("<h2>Log</h2>" +
            order.log.map(({ changes, time }) => `
                <div class="form-row">
                    <h3>${moment(time).format("DD-MM-YYYY HH:MM")}</h3>
                </div>
                ${Object.entries(changes).map(([k,v])=> `
                    <div class="form-row">
                    <p>${names[k]}</p>=<p>${v}</p>
                    </div>
                `).join("")}
            `).join(""))
        });
    }

    save() {
        if (!this.form[0].checkValidity()) {
            throw new Error("form not valid")
        }

        const order = convertFormToObject(this.form[0]);
        order._id = this.orderId;

        order.samePlanAsLast = $("#editInputSamePlanAsLast")[0].checked;
        order.takeOwnSamples = $("#editInputTakeOwnSamples")[0].checked;

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