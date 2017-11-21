var _ = require("lodash")
module.exports.sort = function (orders, sortBy) {
    if (sortBy == "address"){
        return _.orderBy(orders, function (order) {
            return order.address.zip + order.address.city + order.address.street
        });

    }else if (sortBy == "consultant"){
        return _.orderBy(orders, function (order) {
            return order.consultant
        });
    }else if (sortBy == "date"){
        return _.orderBy(orders, function (order) {
            return order.createdDate
        });
    }else if (sortBy == "name") {
        return _.orderBy(orders, function (order) {
            var names = order.name.split(" ");
            return names[names.length-1] + names[0];
        });

    }else if (sortBy == "xxx"){

    }else if (sortBy == "xxx"){

 }
}