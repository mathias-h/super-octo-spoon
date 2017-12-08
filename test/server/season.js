const request = require('supertest');
const { expect } = require("chai");
const { createApp } = require("../../app");



describe("season server testing", () => {
    function sessionMock(consultantId) {
        return () => (req,res,next) => {
            req.session = {
                isLoggedIn: true,
                consultantId: consultantId
            }

            next()
        }
    }
    it("should create season", () => {
        const SeasonMock = {
            createSeason(s) {
                expect(s).to.deep.eq("17/18");
                return Promise.resolve();
            }
        };

        const app = createApp({
            Season : SeasonMock,
            session: sessionMock()
        });

        return request(app)
            .post("/season")
            .send({ consultantData: "17/18" })
            .expect(200)
            .expect("season created");
    });

    it("should update season")
})