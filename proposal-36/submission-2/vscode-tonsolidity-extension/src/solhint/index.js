const fs = require('fs')
const glob = require('glob')
const ignore = require('ignore')
const astParents = require('ast-parents')
const { applyExtends } = require('./config/config-file')
const Reporter = require('./reporter')
const TreeListener = require('./tree-listener')
const checkers = require('./rules/index')
import {Parser} from '../parser/tonsolidity';
const parser = new Parser();

function parseInput(inputStr) {
  try {
    // first we try to parse the string as we normally do
    return parser.parse(inputStr, "tonsolidity", false, { loc: true, range: true })
  } catch (e) {
    // using 'loc' may throw when inputStr is empty or only has comments
    return parser.parse(inputStr, "tonsolidity", false, {})
  }
}

function processStr(inputStr, config = {}, fileName = '') {
  config = applyExtends(config)

  let ast
  try {
    ast = parseInput(inputStr)
  } catch (e) {
    if (e instanceof parser.ParserError) {
      const reporter = new Reporter([], config)
      for (const error of e.errors) {
        reporter.addReport(
          error.line,
          error.column,
          Reporter.SEVERITY.ERROR,
          `Parse error: ${error.message}`
        )
      }
      return reporter
    } else {
      throw e
    }
  }

  const tokens = parser.tokenize(inputStr, { loc: true })
  const reporter = new Reporter(tokens, config)
  const listener = new TreeListener(checkers(reporter, config, inputStr, tokens, fileName))

  astParents(ast)
  parser.visit(ast, listener)

  return reporter
}

function processFile(file, config) {
  const report = processStr(fs.readFileSync(file).toString(), config, file)
  report.file = file

  return report
}

function processPath(path, config) {
  const ignoreFilter = ignore().add(config.excludedFiles)

  const allFiles = glob.sync(path, {})
  const files = ignoreFilter.filter(allFiles)

  return files.map(curFile => processFile(curFile, config))
}

module.exports = { processPath, processFile, processStr }
