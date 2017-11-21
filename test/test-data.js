const testOrders = [
    {
        consultant: "CONSULANT1",
        signedDate: new Date("1/1/2017"),
        landlineNumber: "88888888",
        phoneNumber: "20202020",
        name: "NN1",
        farmName: "Bondegården",
        address: {
            street: "Markvejen 1",
            city: "Bondeby",
            zip: "8123"
        },
        comment: "Ring efter høst"
    },
    {
        consultant: "CONSULANT1",
        signedDate: new Date("1/1/2017"),
        landlineNumber: "88888889",
        phoneNumber: "20202020",
        name: "NN1",
        farmName: "Bondegården",
        address: {
            street: "Markvejen 2",
            city: "Bondeby",
            zip: "8123"
        },
        comment: "Ring før høst"
    },
    {
        consultant: "CONSULANT2",
        signedDate: new Date("1/1/2017"),
        landlineNumber: "88888888",
        phoneNumber: "20202020",
        name: "NN1",
        farmName: "Bondegården",
        address: {
            street: "Markvejen 12",
            city: "TestAArhus",
            zip: "8000"
        },
        comment: "Ring under høst"
    },
    {
        consultant: "CONSULANT2",
        signedDate: new Date("1/1/2017"),
        landlineNumber: "88888888",
        phoneNumber: "20202020",
        name: "NN1",
        farmName: "Bondegården",
        address: {
            street: "Markvejen 12",
            city: "Aarhus",
            zip: "8000"
        },
        comment: "Ring under høst"
    },
    {
        consultant: "CONSULANT2",
        signedDate: new Date("1/1/2017"),
        landlineNumber: "88888888",
        phoneNumber: "20202020",
        name: "NN1",
        farmName: "Bondegården",
        address: {
            street: "Markvejen 3",
            city: "Bondeby",
            zip: "8123"
        },
        comment: "Ring under høst"
    }
]

module.exports = testOrders;