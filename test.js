/**
 * Test Suite for SysML v2 Lexer, Parser, and Generator
 */

const { Lexer, Parser, Generator } = require('./index.js');

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  Error: ${error.message}`);
    testsFailed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected} but got ${actual}`);
  }
}

console.log('=== SysML v2 Tools Test Suite ===\n');

// Lexer Tests
console.log('Lexer Tests:');
console.log('------------');

test('Lexer tokenizes keywords', () => {
  const lexer = new Lexer('part def attribute');
  const tokens = lexer.tokenize();
  assert(tokens[0].type === 'KEYWORD' && tokens[0].value === 'part');
  assert(tokens[1].type === 'KEYWORD' && tokens[1].value === 'def');
  assert(tokens[2].type === 'KEYWORD' && tokens[2].value === 'attribute');
});

test('Lexer tokenizes identifiers', () => {
  const lexer = new Lexer('Vehicle myVehicle');
  const tokens = lexer.tokenize();
  assert(tokens[0].type === 'IDENTIFIER' && tokens[0].value === 'Vehicle');
  assert(tokens[1].type === 'IDENTIFIER' && tokens[1].value === 'myVehicle');
});

test('Lexer tokenizes operators', () => {
  const lexer = new Lexer(':> :>> ::> =>');
  const tokens = lexer.tokenize();
  assert(tokens[0].type === 'OPERATOR' && tokens[0].value === ':>');
  assert(tokens[1].type === 'OPERATOR' && tokens[1].value === ':>>');
  assert(tokens[2].type === 'OPERATOR' && tokens[2].value === '::>');
  assert(tokens[3].type === 'OPERATOR' && tokens[3].value === '=>');
});

test('Lexer tokenizes strings', () => {
  const lexer = new Lexer('"hello world"');
  const tokens = lexer.tokenize();
  assert(tokens[0].type === 'STRING' && tokens[0].value === 'hello world');
});

test('Lexer tokenizes numbers', () => {
  const lexer = new Lexer('123 45.67 1.5e-10');
  const tokens = lexer.tokenize();
  assert(tokens[0].type === 'NUMBER' && tokens[0].value === '123');
  assert(tokens[1].type === 'NUMBER' && tokens[1].value === '45.67');
  assert(tokens[2].type === 'NUMBER' && tokens[2].value === '1.5e-10');
});

test('Lexer tracks source locations', () => {
  const lexer = new Lexer('part\ndef', 'test.sysml');
  const tokens = lexer.tokenize();
  assert(tokens[0].location.line === 1 && tokens[0].location.column === 1);
  assert(tokens[1].location.line === 2 && tokens[1].location.column === 1);
  assertEquals(tokens[0].location.file, 'test.sysml');
});

test('Lexer handles line comments', () => {
  const lexer = new Lexer('part // this is a comment\ndef');
  const tokens = lexer.tokenize();
  assert(tokens.some(t => t.type === 'COMMENT'));
});

test('Lexer handles block comments', () => {
  const lexer = new Lexer('part /* block comment */ def');
  const tokens = lexer.tokenize();
  assert(tokens.some(t => t.type === 'BLOCK_COMMENT'));
});

// Parser Tests
console.log('\nParser Tests:');
console.log('-------------');

test('Parser creates AST for simple part definition', () => {
  const lexer = new Lexer('part def Vehicle;');
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  assert(ast.nodeType === 'Program');
  assert(ast.elements.length === 1);
  assert(ast.elements[0].nodeType === 'PartDefinition');
  assertEquals(ast.elements[0].name, 'Vehicle');
});

test('Parser handles part with specialization', () => {
  const lexer = new Lexer('part def Car :> Vehicle;');
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const partDef = ast.elements[0];
  assert(partDef.specializations.length === 1);
  assertEquals(partDef.specializations[0].kind, 'specializes');
});

test('Parser handles attribute usage', () => {
  const lexer = new Lexer('attribute mass : Real = 100;');
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const attr = ast.elements[0];
  assert(attr.nodeType === 'AttributeUsage');
  assertEquals(attr.name, 'mass');
  assert(attr.defaultValue !== null);
});

test('Parser handles package declaration', () => {
  const lexer = new Lexer('package Test { part def A; }');
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  assert(ast.elements[0].nodeType === 'PackageDeclaration');
  assert(ast.elements[0].elements.length === 1);
});

test('Parser handles import statement', () => {
  const lexer = new Lexer('import ISQ::mass;');
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  assert(ast.elements[0].nodeType === 'ImportStatement');
});

test('Parser handles qualified names', () => {
  const lexer = new Lexer('attribute x : ISQ::mass;');
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const attr = ast.elements[0];
  assert(attr.type.nodeType === 'QualifiedName');
  assert(attr.type.parts.length === 2);
});

test('Parser handles nested parts', () => {
  const lexer = new Lexer('part def Vehicle { part engine; }');
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const partDef = ast.elements[0];
  assert(partDef.body.length === 1);
  assert(partDef.body[0].nodeType === 'PartUsage');
});

// Generator Tests
console.log('\nGenerator Tests:');
console.log('----------------');

test('Generator outputs simple part definition', () => {
  const source = 'part def Vehicle;';
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const generator = new Generator();
  const output = generator.generate(ast);
  assert(output.includes('part def Vehicle'));
});

test('Generator handles indentation', () => {
  const source = 'part def Vehicle { part engine; }';
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const generator = new Generator({ indentSize: 2 });
  const output = generator.generate(ast);
  assert(output.includes('  part engine'));
});

test('Generator outputs specializations', () => {
  const source = 'part def Car :> Vehicle;';
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const generator = new Generator();
  const output = generator.generate(ast);
  assert(output.includes(':> Vehicle'));
});

test('Generator outputs attributes with default values', () => {
  const source = 'attribute mass : Real = 100;';
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const generator = new Generator();
  const output = generator.generate(ast);
  assert(output.includes('= 100'));
});

test('Generator outputs packages', () => {
  const source = 'package Test { part def A; }';
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const generator = new Generator();
  const output = generator.generate(ast);
  assert(output.includes('package Test'));
});

// Round-trip Tests
console.log('\nRound-trip Tests:');
console.log('-----------------');

test('Round-trip: simple part definition', () => {
  const source = 'part def Vehicle;';
  const lexer1 = new Lexer(source);
  const tokens1 = lexer1.tokenize();
  const parser1 = new Parser(tokens1);
  const ast1 = parser1.parse();
  const generator1 = new Generator();
  const output1 = generator1.generate(ast1);

  const lexer2 = new Lexer(output1);
  const tokens2 = lexer2.tokenize();
  const parser2 = new Parser(tokens2);
  const ast2 = parser2.parse();
  const generator2 = new Generator();
  const output2 = generator2.generate(ast2);

  assertEquals(output1.trim(), output2.trim());
});

test('Round-trip: complex structure', () => {
  const source = `package Test {
  part def Vehicle {
    attribute mass : Real;
  }
}`;
  const lexer1 = new Lexer(source);
  const tokens1 = lexer1.tokenize();
  const parser1 = new Parser(tokens1);
  const ast1 = parser1.parse();
  const generator1 = new Generator({ indentSize: 2 });
  const output1 = generator1.generate(ast1);

  const lexer2 = new Lexer(output1);
  const tokens2 = lexer2.tokenize();
  const parser2 = new Parser(tokens2);
  const ast2 = parser2.parse();
  const generator2 = new Generator({ indentSize: 2 });
  const output2 = generator2.generate(ast2);

  assertEquals(output1, output2);
});

// Integration Tests
console.log('\nIntegration Tests:');
console.log('------------------');

test('Full pipeline: tokenize -> parse -> generate', () => {
  const source = `
package VehicleExample {
  import ISQ::*;

  part def Vehicle {
    attribute mass : ISQ::mass;
    port powerPort : PowerInterface;
  }

  part def Engine :> Vehicle {
    attribute horsepower : ISQ::power;
  }
}`;

  const lexer = new Lexer(source, 'test.sysml');
  const tokens = lexer.tokenize();
  assert(tokens.length > 0);

  const parser = new Parser(tokens);
  const ast = parser.parse();
  assert(ast.nodeType === 'Program');
  assert(ast.elements.length > 0);

  const generator = new Generator({ indentSize: 2 });
  const output = generator.generate(ast);
  assert(output.includes('package VehicleExample'));
  assert(output.includes('part def Vehicle'));
  assert(output.includes('part def Engine'));
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log('='.repeat(50));

if (testsFailed === 0) {
  console.log('\n✓ All tests passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed.');
  process.exit(1);
}
