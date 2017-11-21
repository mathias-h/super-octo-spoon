const { expect } = require("chai")
const { sort } = require("../models/sort")

describe("Sorting tests", () => {
    var correctAnswer = [];
    var sortingArray = [];
    beforeEach(function () {
       sortingArray = [
           {
               consultant: "CONSULANT7",
               createdDate: new Date("2017-02-24"),
               tlf: "88888888",
               name: "Niels Hansen",
               address: {
                   farm: "Bondegården",
                   street: "Markvejen 1",
                   city: "Bondeby",
                   zip: "8123"
               },
               comment: "Ring efter høst"
           },
           {
               consultant: "CONSULANT2",
               createdDate: new Date("2017-02-23"),
               tlf: "88888889",
               name: "Alan Jensen",
               address: {
                   farm: "Bondegården",
                   street: "Markvejen 2",
                   city: "Bondeby",
                   zip: "8123"
               },
               comment: "Ring før høst"
           },
           {
               consultant: "CONSULANT4",
               createdDate: new Date("2017-01-23"),
               tlf: "88888888",
               name: "Niels Adamsen",
               address: {
                   farm: "Bondegården",
                   street: "Markvejen 12",
                   city: "TestAArhus",
                   zip: "8000"
               },
               comment: "Ring under høst"
           },
           {
               consultant: "CONSULANT5",
               createdDate: new Date("2017-06-23"),
               tlf: "88888888",
               name: "Lars A. Adamsen",
               address: {
                   farm: "Bondegården",
                   street: "Markvejen 12",
                   city: "Arhus",
                   zip: "8000"
               },
               comment: "Ring under høst"
           },
           {
               consultant: "CONSULANT1",
               createdDate: new Date("2017-02-15"),
               tlf: "88888888",
               name: "Bo Adamsen",
               address: {
                   farm: "Bondegården",
                   street: "Markvejen 3",
                   city: "Bondeby",
                   zip: "8123"
               },
               comment: "Ring under høst"
           }
       ]
    });
    it("should pass, sorted by address", () => {
        correctAnswer = [sortingArray[3],sortingArray[2],sortingArray[0],sortingArray[1],sortingArray[4]]
        expect(sort(sortingArray, "address")).to.deep.eq(correctAnswer)
    });
    it("should pass, sorted by consultant", () => {
        correctAnswer = [sortingArray[4], sortingArray[1],sortingArray[2], sortingArray[3], sortingArray[0]];
        expect(sort(sortingArray, "consultant")).to.deep.eq(correctAnswer)
    });
    it("should pass, sorted by date", () => {
       correctAnswer = [sortingArray[2], sortingArray[4],sortingArray[1], sortingArray[0], sortingArray[3]];
        expect(sort(sortingArray, "date")).to.deep.eq(correctAnswer);
    });
    it("should pass, sorted by name", () => {
        correctAnswer =[sortingArray[4], sortingArray[3],sortingArray[2], sortingArray[0], sortingArray[1]];
        expect(sort(sortingArray, "name")).to.deep.eq(correctAnswer);
        console.log(sort(sortingArray, "name"))
    })
    it("should fail", () => {
        expect(false).to.be.false
    })
})