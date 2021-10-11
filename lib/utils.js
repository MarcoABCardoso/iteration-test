const vm = require('vm')

async function evaluateExpression(expression, context) {
    let script = new vm.Script(`__result=${expression}`)
    let result = script.runInNewContext(context || {})
    return result
}

module.exports = {
    evaluateExpression
}