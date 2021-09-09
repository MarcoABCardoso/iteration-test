
/**
 * @module iteration-test
 */

declare class TestSuite {
    constructor(options: TestSuiteOptions)
    run(): Promise<TestResults>
}

interface TestSuiteOptions {
    testFunction: () => any
    tests: Test[]

    VERBOSE?: Number
}

interface Test {
    name: string
    rounds: Round[]
}

interface Round {
    inputExpression: string
    evaluateExpression?: string
    skip?: boolean
}

interface TestResults {
    success: boolean
    passed: number
    failed: number
    details: ResultDetail[]
}

interface ResultDetail {
    name: string
    success: boolean
    error?: any
}

export = TestSuite