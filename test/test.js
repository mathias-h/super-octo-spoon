const { expect } = require("chai")

describe("tests", () => {
    it("should pass", () => {
        expect(true).to.be.true
    })
    it("should fail", () => {
        expect(true).to.be.false
    })
})