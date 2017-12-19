const request = require("supertest");
const { expect } = require("chai");
const {createApp} = require("../../app.js");

describe("dynamic server tests", () => {
    describe("create dynamic", () => {
        it("should create dynamic", () => {
            const name = "NAME"
            const fase = 1
            const DynamicMock = {
                createDynamic: (n, f) => {
                    expect(n).to.eq(name);
                    expect(f).to.eq(fase);

                    return Promise.resolve()
                }
            }

            const app = createApp({
                Consultant: new class {
                    count() {
                        return Promise.resolve(1);
                    }
                },
                Dynamic: DynamicMock,
                session: () => (req,_,next) => {
                    req.session = { isLoggedIn: true };
    
                    next();
                }
            });

            return request(app)
                .post("/dynamic")
                .send({ name, fase })
                .expect(200)
                .expect("OK")
        })

        it("should handle error", () => {
            const DynamicMock = {
                createDynamic: () => Promise.reject()
            }
            const app = createApp({
                Consultant: new class {
                    count() {
                        return Promise.resolve(1);
                    }
                },
                Dynamic: DynamicMock,
                session: () => (req,_,next) => {
                    req.session = { isLoggedIn: true };
    
                    next();
                }
            });

            return request(app)
                .post("/dynamic")
                .send({ name: null, fase: null })
                .expect(500)
                .expect("ERROR");
        });
    });
    describe("delete dynamic", () => {
        it("should delete dynamic", () => {
            const id = "ID"
            const DynamicMock = {
                deleteDynamic: (i) => {
                    expect(i).to.eq(id);

                    return Promise.resolve()
                }
            }

            const app = createApp({
                Consultant: new class {
                    count() {
                        return Promise.resolve(1);
                    }
                },
                Dynamic: DynamicMock,
                session: () => (req,_,next) => {
                    req.session = { isLoggedIn: true };
    
                    next();
                }
            });

            return request(app)
                .delete("/dynamic/" + id)
                .expect(200)
                .expect("OK");
        });

        it("should handle error", () => {
            const DynamicMock = {
                deleteDynamic: () => Promise.reject()
            }

            const app = createApp({
                Consultant: new class {
                    count() {
                        return Promise.resolve(1);
                    }
                },
                Dynamic: DynamicMock,
                session: () => (req,_,next) => {
                    req.session = { isLoggedIn: true };
    
                    next();
                }
            });

            return request(app)
                .delete("/dynamic/ID")
                .expect(500)
                .expect("ERROR");
        });
    })
})