const { expect } = require("chai")
const { sort } = require("../models/sort")

describe("Sorting tests", () => {
    var correctAnswer = [];
    var sortingArray = [];
    beforeEach(function () {
       sortingArray = [
           {
               consultant: "CONSULANT7",
               signedDate: new Date("2017-02-24"),
               landlineNumber: "28888888",
               phoneNumber: "22222222",
               name: "Niels Hansen",
               farmName: "Bondegården",
               address: {
                   street: "Markvejen 1",
                   city: "Bondeby",
                   zip: "8123"
               },
               comment: "Ring efter høst",
               takeOwnSamples: false,
               samePlanAsLast: true,
               fase: 2
           },
           {
               consultant: "CONSULANT2",
               signedDate: new Date("2017-02-23"),
               landlineNumber: "18888889",
               phoneNumber: "3222222",
               name: "Alan Jensen",
               farmName: "Bondegården",
               address: {
                   street: "Markvejen 2",
                   city: "Bondeby",
                   zip: "8123"
               },
               comment: "Ring før høst",
               takeOwnSamples: false,
               samePlanAsLast: false,
               fase: 2
           },
           {
               consultant: "CONSULANT4",
               signedDate: new Date("2017-01-23"),
               landlineNumber: "48888888",
               phoneNumber: "1122222",
               name: "Niels Adamsen",
               farmName: "Bondegården",
               address: {
                   street: "Markvejen 12",
                   city: "TestAArhus",
                   zip: "8000"
               },
               comment: "Ring under høst",
               takeOwnSamples: true,
               samePlanAsLast: false,
               fase: 3
           },
           {
               consultant: "CONSULANT5",
               signedDate: new Date("2017-06-23"),
               landlineNumber: "11888888",
               phoneNumber: "2888222",
               name: "Lars A. Adamsen",
               farmName: "Bondegården",
               address: {
                   street: "Markvejen 12",
                   city: "Arhus",
                   zip: "8000"
               },
               comment: "Ring under høst",
               takeOwnSamples: false,
               samePlanAsLast: true,
               fase: 3
           },
           {
               consultant: "CONSULANT1",
               signedDate: new Date("2017-02-15"),
               landlineNumber: "98888888",
               phoneNumber: "11111111",
               name: "Bo Adamsen",
               farmName: "Bondegården",
               address: {
                   street: "Markvejen 3",
                   city: "Bondeby",
                   zip: "8123"
               },
               comment: "Ring under høst",
               takeOwnSamples: true,
               samePlanAsLast: false,
               fase: 1
           }
       ]
    });
    it("should pass, sorted by address", () => {
        correctAnswer = [sortingArray[3],sortingArray[2],sortingArray[0],sortingArray[1],sortingArray[4]]
        expect(sort(sortingArray, "address", "asc")).to.deep.eq(correctAnswer)
    });
    it("should pass, sorted by consultant", () => {
        correctAnswer = [sortingArray[4], sortingArray[1],sortingArray[2], sortingArray[3], sortingArray[0]];
        expect(sort(sortingArray, "consultant", "asc")).to.deep.eq(correctAnswer)
    });
    it("should pass, sorted by date", () => {
       correctAnswer = [sortingArray[2], sortingArray[4],sortingArray[1], sortingArray[0], sortingArray[3]];
        expect(sort(sortingArray, "date", "asc")).to.deep.eq(correctAnswer);
    });
    it("should pass, sorted by name", () => {
        correctAnswer =[sortingArray[4], sortingArray[3],sortingArray[2], sortingArray[0], sortingArray[1]];
        expect(sort(sortingArray, "name", "asc")).to.deep.eq(correctAnswer);
    })
    it("should pass, sorted by name (firstName test)", () => {
        farmerBo = {
            consultant: "CONSULANT1",
            createdDate: new Date("2017-02-15"),
            landlineNumber: "88888888",
            name: "Bo",
            farmName: "Bondegården",
            address: {
                street: "Markvejen 3",
                city: "Bondeby",
                zip: "8123"
            }
        }
        sortingArray.push(farmerBo);
        correctAnswer = [sortingArray[4], sortingArray[3], sortingArray[2], sortingArray[5], sortingArray[0], sortingArray[1]];
        expect(sort(sortingArray, "name", "asc")).to.deep.eq(correctAnswer);
    });
    it("should pass, empty list", () => {
        correctAnswer = [];
        sortingArray = [];
        expect(sort(sortingArray, "name", "asc")).to.deep.eq(correctAnswer)
    })
    it("should pass, throws exception", () => {
        expect(function () {
            sort(sortingArray, "failss", "asc")
        }).to.throw()
    })
    it("should pass - no sorting if no order", () => {
        correctAnswer = [sortingArray[0], sortingArray[1], sortingArray[2], sortingArray[3], sortingArray[4]];
        expect(sort(sortingArray, "name")).to.deep.eq(correctAnswer)
    } )
    it ("should pass, sort by self sampling", () => {
        correctAnswer = [sortingArray[4], sortingArray[2], sortingArray[3], sortingArray[0], sortingArray[1]];
        expect(sort(sortingArray, "self", "desc")).to.deep.eq(correctAnswer);
    })
    it("should pass, sort by same plan as last year", () => {
        correctAnswer = [sortingArray[3], sortingArray[0], sortingArray[1], sortingArray[4], sortingArray[2]]
        expect(sort(sortingArray, "sameAsLast", "desc")).to.deep.eq(correctAnswer)
    })
    it ("should pass, sort by landline", () => {
        correctAnswer = [sortingArray[3], sortingArray[1], sortingArray[0], sortingArray[2], sortingArray[4]]
        expect(sort(sortingArray, "landline", "asc")).to.deep.eq(correctAnswer)
    })
    it ("should pass, sort by mobile", () => {
        correctAnswer = [sortingArray[4], sortingArray[2], sortingArray[0], sortingArray[3], sortingArray[1]]
        expect(sort(sortingArray, "mobile", "asc")).to.deep.eq(correctAnswer)
    })
    it("should pass - last Method - can remove", () => {
        expect(false).to.be.false
    })
    it("should sort by fase", () => {
        correctAnswer = [sortingArray[4],sortingArray[0],sortingArray[1],sortingArray[3],sortingArray[2]]
        expect(sort(sortingArray, "fase", "asc")).to.deep.eq(correctAnswer)
    })
})