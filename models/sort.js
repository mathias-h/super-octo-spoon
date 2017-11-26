var _ = require("lodash")
var type = require("type-detect")
module.exports.sort = function (orders, sortBy, order) {
    if (!order){
        return orders;
    }
    if (sortBy == "address"){
        return _.orderBy(orders, function (order) {
            return order.address.zip + order.address.city + order.address.street
        }, [order]);

    }else if (sortBy == "consultant"){
        return _.orderBy(orders, function (order) {
            return order.consultant
        }, [order]);
    }else if (sortBy == "date"){
        return _.orderBy(orders, function (order) {
            return order.signedDate.getTime();
        }, [order]);
    }else if (sortBy == "name") {
        return _.orderBy(orders, function (order) {
            var names = order.name.split(" ");
            return names[names.length-1] + names[0];
        }, [order]);
    } else if (sortBy == "self") {
        //TODO FIX, doesn't work properly atm -> May have been fixed by getTime()!
        return _.orderBy(orders, function (o) {
            // console.log(type(o.signedDate) === 'Date')
            // console.log(o.signedDate.toString())
            // console.log(new Date("2017-03-23") < new Date("2017-02-24"))
            // console.log(o.signedDate.getTime()) // Testing printouts
            return [((order == "asc") ? !o.takeOwnSamples : o.takeOwnSamples), o.signedDate.getTime()];
        }, "desc");
    } else if (sortBy == "area"){
      return _.orderBy(orders, function (o) {
          return o.area
      }, [order])
    } else if (sortBy == "sameAsLast"){
        return _.orderBy(orders, function (order) {
            return ((order == "asc") ? !order.samePlanAsLast : order.samePlanAsLast) + order.signedDate.getTime();
        }, "desc")
    } else if (sortBy == "mobile"){
        return _.orderBy(orders, function (order) {
            return order.mobile
        })
    }else if (sortBy == "landline"){
        return _.orderBy(orders, function (order) {
            return order.landlineNumber
        })
    }

    else {
        throw new TypeError("Illegal sorting parameter: " + sortBy)
    }
}