<h1 align="center">iteration-test</h1>
<p>
  <a href="https://www.npmjs.com/package/iteration-test" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/iteration-test.svg">
  </a>
  <a href="#" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/badge/License-ISC-yellow.svg" />
  </a>
  <a href='https://coveralls.io/github/MarcoABCardoso/iteration-test?branch=master'>
    <img src='https://coveralls.io/repos/github/MarcoABCardoso/iteration-test/badge.svg?branch=master' alt='Coverage Status' />
  </a>
  <a href="#" target="_blank">
    <img alt="Node.js CI" src="https://github.com/MarcoABCardoso/iteration-test/workflows/Node.js%20CI/badge.svg" />
  </a>
</p>

> Runs automated testing for a given function to be run iteratively.

## Install

```sh
npm install iteration-test
```

## Usage

```js
const TestSuite = require('iteration-test')

let testSuite = new TestSuite({
    testFunction: payload => ({ output: payload.current + payload.previous }),
    tests: [
        {
            name: 'Adds current and previous fields at each turn',
            rounds: [
                { inputExpression: '{ current: 3, previous: 0 }', evaluateExpression: 'output == 3' },
                { inputExpression: '{ current: 4, previous: output }', evaluateExpression: 'output == 7' },
                { inputExpression: '{ current: 5, previous: output }', evaluateExpression: 'output == 11' }, // Fails
            ]
        }
    ]
})

let results = await testSuite.run()
```

## Sample results

```json
{
  "success": false,
  "passed": 0,
  "failed": 1,
  "details": [
    {
      "name": "Adds current and previous fields at each turn",
      "success": false,
      "error": "Expression [output == 11] is false for obtained output {\"output\":12}"
    }
  ]
}

## Run tests

```sh
npm run test
```

## Author

👤 **Marco Cardoso**

* Github: [@MarcoABCardoso](https://github.com/MarcoABCardoso)
* LinkedIn: [@marco-cardoso](https://linkedin.com/in/marco-cardoso)

## Show your support

Give a ⭐️ if this project helped you!