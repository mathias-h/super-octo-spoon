var _ = require("lodash")
module.exports.sort = function (orders, sortBy, order = "asc") {
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
            return order.createdDate
        }, [order]);
    }else if (sortBy == "name") {
        return _.orderBy(orders, function (order) {
            var names = order.name.split(" ");
            return names[names.length-1] + names[0];
        }, [order]);
    }else if (sortBy == "xxx"){

    }else if (sortBy == "xxx"){

 }
}