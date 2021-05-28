function passedCount(tests) {
    return tests.filter(test => test.success).length
}

function failedCount(tests) {
    return tests.length - passedCount(tests)
}

function generateReports(tests) {
    return {
        success: failedCount(tests) == 0,
        passed: passedCount(tests),
        failed: failedCount(tests),
        details: tests
    }
}

module.exports = {
    generateReports
}