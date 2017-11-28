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
        return _.orderBy(orders, function (o) {
            return [((order == "asc") ? !o.takeOwnSamples : o.takeOwnSamples), o.signedDate.getTime()];
        }, "desc");
    } else if (sortBy == "area"){
      return _.orderBy(orders, function (o) {
          return o.area
      }, [order])
    } else if (sortBy == "sameAsLast"){
        return _.orderBy(orders, function (o) {
            return [((order == "asc") ? !o.samePlanAsLast : o.samePlanAsLast), o.signedDate.getTime()];
        }, "desc")
    } else if (sortBy == "mobile"){
        return _.orderBy(orders, function (order) {
            return order.phoneNumber
        }, [order])
    }else if (sortBy == "landline"){
        return _.orderBy(orders, function (order) {
            return order.landlineNumber
        }, [order])
    } else if (sortBy == "fase") {
        return _.orderBy(orders, function(order) {
            return [order.fase, order.signedDate]
        }, [order, "desc"])
    }

    else {
        throw new TypeError("Illegal sorting parameter: " + sortBy)
    }
}