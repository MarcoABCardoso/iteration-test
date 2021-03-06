const TestSuite = require('../lib')

let passingTestOptions = {
    testFunction: payload => payload.input.text == 'hello' ? { output: { text: 'Hello, there!' } } : { output: { text: 'Goodbye, now.' } },
    tests: [
        {
            name: 'foo_passing_test_1',
            rounds: [
                { inputExpression: '{ input: { text: "hello" } }', evaluateExpression: 'output.text == "Hello, there!"' },
                { inputExpression: '{ input: { text: "hello" } }', evaluateExpression: 'output.text == "Hello, there!"' },
            ]
        },
        {
            name: 'foo_passing_test_2',
            rounds: [
                { inputExpression: '{ input: { text: "goodbye" } }', evaluateExpression: 'output.text == "Goodbye, now."' },
                { inputExpression: '{ input: { text: "goodbye" } }', evaluateExpression: 'output.text == "Goodbye, now."' },
            ]
        }
    ]
}

let failingTestOptions = {
    testFunction: payload => payload.input.text == 'hello' ? { output: { text: 'Hello, there!' }, context: payload.context || { initial: 'context' } } : { output: { text: 'Goodbye, now.' }, context: payload.context },
    tests: [
        {
            name: 'foo_passing_test',
            rounds: [
                { inputExpression: '{ input: { text: "hello" } }', evaluateExpression: 'output.text == "Hello, there!"' },
                { inputExpression: 'context.foo = "bar"; _={ context }', skip: true },
                { inputExpression: '{ input: { text: "goodbye" }, context: context }', evaluateExpression: 'output.text == "Goodbye, now." && context.foo == "bar"' },
            ]
        },
        {
            name: 'foo_failing_test',
            rounds: [
                { inputExpression: '{ input: { text: "hello" } }', evaluateExpression: 'output.text == "Hello, there!"' },
                { inputExpression: '{ input: { text: "goodbye" } }', evaluateExpression: 'output.text == "Something incorrect"' },
            ]
        },
        {
            name: 'foo_broken_test_input',
            rounds: [
                { inputExpression: 'invalidSyntax', evaluateExpression: 'output.text == "Hello, there!"' },
            ]
        },
        {
            name: 'foo_broken_test_output',
            rounds: [
                { inputExpression: '{ input: { text: "hello" } }', evaluateExpression: 'invalidSyntax' },
            ]
        },
        {
            name: 'foo_malicious_test_1',
            rounds: [
                { inputExpression: 'this.constructor.constructor("return process.exit()")()', evaluateExpression: 'this tries to crash the test' },
            ]
        },
        {
            name: 'foo_malicious_test_2',
            rounds: [
                { inputExpression: 'new Proxy({}, {\n  get: function(me, key) { return (arguments.callee.caller.constructor(\'return process.exit()\'))() }\n})', evaluateExpression: 'this tries to crash the test' },
            ]
        }
    ]
}


describe('TestSuite', () => {
    describe('#constructor', () => {
        it('Creates an instance of TestSuite', () => {
            let testSuite = new TestSuite(passingTestOptions)
            expect(testSuite).toBeInstanceOf(TestSuite)
        })
        it('Sets this.log when verbose is enabled', () => {
            let testSuite = new TestSuite({ ...passingTestOptions, VERBOSE: true })
            expect(testSuite.log).toEqual(console.log)
        })
    })

    describe('#run', () => {
        it('Generates success report when it succeeds', (done) => {
            let testSuite = new TestSuite(passingTestOptions)
            testSuite.run()
                .then(results => {
                    expect(results).toEqual({ details: [{ name: 'foo_passing_test_1', success: true }, { name: 'foo_passing_test_2', success: true }], failed: 0, passed: 2, success: true })
                    done()
                })
        })
        it('Generates failure report when it fails', (done) => {
            let testSuite = new TestSuite(failingTestOptions)
            testSuite.run()
                .then(results => {
                    delete results.details[4].error
                    delete results.details[5].error
                    expect(results).toEqual({ details: [
                        { name: 'foo_passing_test', success: true }, 
                        { error: 'Expression [output.text == "Something incorrect"] is false for obtained output', name: 'foo_failing_test', success: false, index: 1 }, 
                        { error: 'invalidSyntax is not defined', name: 'foo_broken_test_input', success: false, index: 0 }, 
                        { error: 'invalidSyntax is not defined', name: 'foo_broken_test_output', success: false, index: 0 },
                        { name: 'foo_malicious_test_1', success: false, index: 0 },
                        { name: 'foo_malicious_test_2', success: false, index: 0 },
                    ], failed: 5, passed: 1, success: false })
                    done()
                })
        })
    })
})