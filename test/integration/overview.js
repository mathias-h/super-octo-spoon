const mock = require('mock-require');
const request = require('supertest');
const { expect } = require("chai")

describe("overview view", () => {
    it("should get view", () => {
        const order = { name: "ORDER_NAME" }

        mock("../models/order", {
            find() {
                return this
            },
            sort(order) {
                expect(order).to.eq({ signedDate: -1 })

                return this
            },
            lean() {
                return this
            },
            exec(f) {
                f(null, [order])
            }
        })

        const { app } = require("../index")

        request(app)
            .get("/")
            .expect("Content-Type", "text/html")
            .expect(200)
            .expect(/ORDER_NAME/)
    })
})