const { VM } = require('vm2')

async function evaluateExpression(expression, context) {
    let vm = new VM({ timeout: 1000, sandbox: context })
    let result = vm.run(`_=${expression}`)
    return result
}

module.exports = {
    evaluateExpression
}