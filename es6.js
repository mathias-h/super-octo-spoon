(function destructuringObject() {
    const o = { a: 1, b: 1 }

    /*
    const a = o.a
    const b = o.b
    */
    const { a, b } = o
})();

(function destructuringArray() {
    const a = [1,2]

    /*
    const one = a[0]
    const two = a[1]
    */
    const [one,two] = a
})();

(function Const() {
    console.log("const")
    var a = 0
    a = 1
    
    try {
        const b = 0
        b = 1
    } catch (error) {
        console.log(error.message)
    }
})();

(function Let() {
        for (var i = 0; i < 10; i++) {
            console.log("var loop", i)
            setTimeout(() => console.log("var loop later", i))
        }
        
        for (let i = 0; i < 10; i++) {
            console.log("let loop", i)
            setTimeout(() => console.log("let loop later", i))
        }
})();

(function arrowFunction() {
    console.log("arrow function")
    /*
    function f() { return 1 }
    */
    const f = () => 1
    f()

    function f1() { console.log("function this", this) }
    const f2 = () => console.log("arrow this", this)
    f1.apply({ test: 1 })
    f2.apply({ test: 1 })
}).apply({ test: 2 });

(function asyncAwait() {
    console.log("async await")
    const p = Promise.resolve(1)

    /*
        function f() {
            p.then(x => console.log(x))
        }
    */

    async function f() {
        const x = await p
        console.log(x)
    }

    f()
})();