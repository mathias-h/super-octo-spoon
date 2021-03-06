module.exports.search = function search(orders, query) {
    if (!query) return orders;
    
    const words = query.split(" ");

    return orders
        .map(order => {
            let matches = 0;
            for (const word of words) {
                const reg = new RegExp(word, "i");
                if (order.consultant.name.match(reg)) {
                    matches += 1
                }
                if (order.address.zip.toString().match(reg)) {
                    matches += 1
                }
                if (order.address.city.match(reg)) {
                    matches += 1
                }
                if (order.address.street.match(reg)) {
                    matches += 1
                }
                if (order.landlineNumber && order.landlineNumber.match(reg)) {
                    matches += 1
                }
                if (order.phoneNumber && order.phoneNumber.match(reg)) {
                    matches += 1
                }
                if (order.name.match(reg)) {
                    matches += 1
                }
                if (order.farmName.match(reg)) {
                    matches += 1
                }
            }

            return { order, matches }
        })
        .filter(({matches}) => matches >= 1)
        .sort((a,b) => b.matches-a.matches)
        .map(({ order }) => order);
};   