const { expect } = require("chai")
const { search } = require("../models/search")
const testOrders = [
    {
        consultant: "CONSULTANT1",
        signedDate: new Date("1/1/2017"),
        phone: "88888888",
        name: "NN1 Bondegården",
        address: {
            street: "Markvejen 1",
            city: "aarhus",
            zip: "8123"
        },
        comment: "Ring efter høst"
    },
    {
        consultant: "CONSULTANT1",
        signedDate: new Date("1/1/2017"),
        phone: "88888889",
        name: "NN2 Bondegården",
        address: {
            street: "parkvejen 2",
            city: "galten",
            zip: "8124"
        },
        comment: "Ring før høst"
    },
    {
        consultant: "CONSULTANT2",
        signedDate: new Date("1/1/2017"),
        phone: "88888887",
        name: "NN3 Bondegården",
        address: {
            street: "parkvejen 3",
            city: "galten",
            zip: "8124"
        },
        comment: "Ring under høst"
    }
]

describe("search", () => {
    it("should search by consultant", () => {
        const results = search(testOrders, "CONSULTANT1")

        expect(results).to.deep.eq([testOrders[0],testOrders[1]])
    })
    it("should search by zip", () => {
        const results = search(testOrders, "8124")
        
        expect(results).to.deep.eq([testOrders[1],testOrders[2]])
    })
    it("should search by city", () => {
        const results = search(testOrders, "galten")
        
        expect(results).to.deep.eq([testOrders[1],testOrders[2]])
    })
    it("should search by street", () => {
        const results = search(testOrders, "markvejen")
        
        expect(results).to.deep.eq([testOrders[0]])
    })
    it("should search by phone", () => {
        const results = search(testOrders, "88888887")
        
        expect(results).to.deep.eq([testOrders[2]])
    })
    it("should search by name", () => {
        const results = search(testOrders, "NN1")
        
        expect(results).to.deep.eq([testOrders[0]])
    })
    it("should order after relevance", () => {
        const results = search(testOrders, "CONSULTANT1 NN1")

        expect(results).to.deep.eq([testOrders[0],testOrders[1]])
    })
    it("should handle no query", () => {
        const results = search(testOrders, null)

        expect(results).to.eq(testOrders)
    })
})