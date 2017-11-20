module.exports.sort = function (orders, sortBy) {
    if (sortBy == "address"){
        return orders.sort(function (a,b) {
            if (a.address.zip - b.address.zip != 0 ){
                return a.address.zip - b.address.zip;
            }else if (a.address.city.localeCompare(b.address.city) != 0){
                return a.address.city.localeCompare(b.address.city);
            }else {
                return a.address.street.localeCompare(b.address.street)
            }
        })
    }else if (sortBy == ""){

    };
}