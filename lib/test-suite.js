const { generateReports } = require('./test-analysis')
const { evaluateExpression } = require('./utils')

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
            let input = await evaluateExpression(options.inputExpression, context)
            if (options.skip) return input
            let output = await this.testFunction(input)
            let valid = await evaluateExpression(options.evaluateExpression, output)
            if (!valid) throw `Expression [${options.evaluateExpression}] is false for obtained output`
            return output
        } catch (error) {
            throw { error: error.message || error, roundIndex }
        }
    }

}

TestSuite.getDefaultConfig = () => ({
})

module.exports = TestSuite