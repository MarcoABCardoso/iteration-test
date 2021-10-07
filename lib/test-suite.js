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
                                return this.executeRound(round, currentContext, roundIndex)
                            },
                            null
                        )
                        .then(() => ({ name: test.name, success: true }))
                        .catch(failure => ({ name: test.name, success: false, error: failure.error, index: failure.roundIndex }))
                )
        )
        this.log('[ITERATION TEST] ALL DONE')
        return generateReports(testData)
    }

    async executeRound(options, context, roundIndex) {
        try {
            let input = SpelExpressionEvaluator.eval(options.inputExpression, context)
            if (options.skip) return context
            let output = await this.testFunction(input)
            let valid = SpelExpressionEvaluator.eval(options.evaluateExpression, output)
            if (!valid) throw `Expression [${options.evaluateExpression}] is false for obtained output`
            return output
        } catch (error) {
            throw { error, roundIndex }
        }
    }

}

TestSuite.getDefaultConfig = () => ({
})

module.exports = TestSuite