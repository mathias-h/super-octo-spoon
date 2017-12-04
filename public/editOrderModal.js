class EditOrderModal {
    constructor() {
        const save = () =>
            this.save().then(() => location.reload()).catch(() => {
                // TODO handle validation error
            });

        this.modal = $("#editOrderModal");
        this.form = $("#orderEditForm");
        const _this = this;
        this.nameMap = {
            consultant: "Konsulent",
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
            sampleTime: "Udtagning timer",
            mgSamples: "Mg prøver",
            cutSamples: "Cut prøver",
            otherSamples: "Andre prøver",
            labDate: "Sendt til lab",
            fromLabDate: "Modtaget fra lab",
            mO: "Sendt til markanalyse",
            receptApproved: "Faktura godkendt"
        }
        // TODO add fase 3 to nameMap
        

        $("#contentData tbody tr").click(function (evt) {
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

        $("#deleteOrderButton").click(() => {
            this.deleteOrder().then(() => location.reload())
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

        if (!(landline[0].validity.valid && landline.val()) && !(mobile[0].validity.valid && mobile.val())) {
            landline[0].setCustomValidity("Mindst et telefonnummer skal angives");
            mobile[0].setCustomValidity("Mindst et telefonnummer skal angives");
        } else {
            landline[0].setCustomValidity("");
            mobile[0].setCustomValidity("");
        }
    }

    setOrder(orderId) {
        return $.get(`/order/${orderId}`).then(order => {
            this.orderId = orderId;
            
            this.setValues(order);

            this.setLog(order);

            this.setDynamic(order);
        });
    }

    setDynamic(order) {
        for (const [fase, keys] of Object.entries(order.dynamics)) {
            $("#editOrderModal .dynamic.fase-" + fase)
                .html(Object.entries(keys).map(([key,value]) => {
                    const id = `dynamic-fase-${fase}-${key}`
                    return `
                        <label for="${id}">${key}</label>
                        <input class="form-control" id="${id}" type="text" placeholder="${key}" name="${id}" value="${value || ""}">
                    `
                }).join(""))
        }
    }

    setValues(order) {
        function setDate(input, date) {
            if (!date) input.val("")
            else input.val(moment(new Date(date)).format("YYYY-MM-DD"));
        }

        $("#editOrderSeason").val(order.season._id);
        $("#editInputConsultant").val(order.consultant._id);
        setDate($("#editInputSignedDate"), order.signedDate);
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
    }

    setLog(order) {
        

        function valueToString(value) {
            if (value === null || value === undefined) return "NULL";
            const str = value.toString();
            if (str.endsWith("T00:00:00.000Z")) return moment(new Date(str)).format("DD-MM-YYYY");
            else return str
        }

        const logs = []
        const properties = {}

        for (const log of order.log) {
            for (const [k,v] of Object.entries(log.changes)) {
                if (!properties[k]) properties[k] = []

                properties[k].push({
                    time: log.time,
                    consultant: log.consultant,
                    value: v
                })
            }
        }

        $("#logElement").html(`
            <div class="col form-group">
                <label for="inputLogProperty">Værdi</label>
                <select name="logProperty" id="inputLogProperty" class="form-control">
                    ${Object.entries(properties).filter(([_,value]) => value.length > 1).map(([name]) => `<option value="${name}">${name}</option>`)}
                </select>
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th scope="Konsulent">Konsulent</th>
                        <th scope="Ændring">Ændring</th>
                        <th scope="Dato">Dato</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `)

        function updateLogValues() {
            const name = $("#inputLogProperty").val()

            if (!name) return

            const changes = properties[name]

            if (!changes) {
                throw new Error("no logs for " + name)
                // TODO handle no log
                return
            }

            $("#logElement tbody").html(changes.map(c => `
                <tr>
                    <td>${c.consultant.username}</td>
                    <td>${valueToString(c.value)}</td>
                    <td>${moment(c.time).format("DD-MM-YYYY HH:MM")}</td>
                </tr>
            `).join(""))
        }

        $("#inputLogConsultant").change(updateLogValues)

        updateLogValues()
    }

    deleteOrder() {
        if (!$("#deleteOrderCheck").prop("checked")) {
            // TODO show you must check
            throw new Error("you must check")
        }

        return $.ajax({
            url: "/order/" + this.orderId,
            method: "DELETE"
        })
    }

    save() {
        if (!this.form[0].checkValidity()) {
            throw new Error("form not valid")
        }

        const order = convertFormToObject(this.form[0])

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

        const dynamics = {}

        for (const [k,value] of Object.entries(order).filter(([k]) => k.startsWith("dynamic"))) {
            const [_,fase,key] = k.match(/fase-(\d+)-(.+)$/)
            
            if (!dynamics[fase]) dynamics[fase] = {}
            dynamics[fase][key] = value
            delete order[k]
        }

        order.dynamics = dynamics

        return $.ajax({
            type: 'PUT',
            url: '/order',
            data: JSON.stringify(order),
            contentType: "application/json"
        });
    }

    show(orderId) {
        return this.setOrder(orderId).then(() => this.modal.modal("show"));
    }
}