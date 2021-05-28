const { generateReports } = require('./test-analysis')
const { SpelExpressionEvaluator } = require('spel2js')

class TestSuite {
    constructor(options) {
        this.testFunction = options.testFunction

        this.config = {
            ...TestSuite.getDefaultConfig(),
            ...options
        }

        this.log = this.config.VERBOSE ? console.log : () => { }
    }

    async run() {
        this.log('[ITERATION TEST] STARTING TEST')
        let testData = await Promise.all(
            this.config.tests
                .map(async (test, testIndex) =>
                    test.rounds
                        .reduce(
                            async (currentContextPromise, round, roundIndex) => {
                                let currentContext = await currentContextPromise
                                this.log(`[ITERATION TEST] EXECUTING TEST ${testIndex} ROUND ${roundIndex}`)
                                return this.executeRound(round, currentContext)
                            },
                            null
                        )
                        .then(() => ({ name: test.name, success: true }))
                        .catch(err => ({ name: test.name, success: false, error: err }))
                )
        )
        this.log('[ITERATION TEST] ALL DONE')
        return generateReports(testData)
    }

    async executeRound(options, context) {
        let input = SpelExpressionEvaluator.eval(options.inputExpression, context)
        let output = await this.testFunction(input)
        let valid = SpelExpressionEvaluator.eval(options.evaluateExpression, output)
        if (!valid) throw `Expression [${options.evaluateExpression}] is false for obtained output ${JSON.stringify(output)}`
        return output
    }

}

TestSuite.getDefaultConfig = () => ({
})

module.exports = TestSuite