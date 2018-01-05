if (!("entires" in Object)) {
    Object.entires = function(obj) {
        const entries = []
        
        for (const key in obj) {
            entries.push([key, obj[key]])
        }
        
        return entries
    }
}