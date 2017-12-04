const request = require('supertest');
const { expect } = require("chai");
const { createApp } = require("../../app");

describe("overview view", () => {
    it("should get view", () => {
        const order = { name: "ORDER_NAME" };
        const OrderMock = {
            getAll(queryParams) {
                expect(queryParams).to.deep.eq({ query: "test" });
                return Promise.resolve([order])
            },
            sampleTotals() {
                return Promise.resolve({ totalSamples: 0, totalTaken: 0 })
            }
        };
        const ConsultantMock = {
            find: () => Promise.resolve({})
        }
        const SeasonMock = {
            find: () => Promise.resolve({})
        }
        const DynamicMock = {
            find: () => Promise.resolve({})
        }
        const app = createApp({
            Order: OrderMock,
            Consultant: ConsultantMock,
            Season: SeasonMock,
            Dynamic: DynamicMock,
            session: function sessionMock(req,res,next) {
                return (req,res,next) => {
                    req.session = {
                        isLoggedIn: true
                    }
            
                    next()
                }
            }
        });
        
        return request(app)
            .get("/?query=test")
            .expect("Content-Type", /text\/html/)
            .expect(200)
            .expect(/ORDER_NAME/)
    })
});