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
    }else if (sortBy == "xxx"){

    }else if (sortBy == "xxx"){

    }else if (sortBy == "xxx"){

    }else if (sortBy == "xxx"){

    };
}