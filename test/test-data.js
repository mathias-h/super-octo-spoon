const testOrders = [
    {
        consultant: "MH",
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
        comment: "Ring efter høst",
        sampleDensity: 1,
        samePlanAsLast: true,
        takeOwnSamples: true,
        area: 100
    },
    {
        consultant: "MJ",
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
        comment: "Ring før høst",
        sampleDensity: 1,
        samePlanAsLast: true,
        takeOwnSamples: true,
        area: 100
    },
    {
        consultant: "NL",
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
        comment: "Ring under høst",
        sampleDensity: 1,
        samePlanAsLast: true,
        takeOwnSamples: true,
        area: 100
    },
    {
        consultant: "MHL",
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
        comment: "Ring under høst",
        sampleDensity: 1,
        samePlanAsLast: true,
        takeOwnSamples: true,
        area: 100
    },
    {
        consultant: "NK",
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
        comment: "Ring under høst",
        smapleDensity: 1,
        samePlanAsLast: true,
        takeOwnSamples: true,
        area: 100
    }
]

module.exports = testOrders;