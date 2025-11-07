/**
 * Example usage of the SysML v2 Lexer, Parser, and Generator
 */

const { Lexer } = require('./lexer.js');
const { Parser } = require('./parser.js');
const { Generator } = require('./generator.js');

// Example SysML v2 source code
const sysmlSource = `
package VehicleExample {

  // Import standard library
  import ISQ::*;

  // Define a vehicle part with attributes
  part def Vehicle {
    attribute mass : ISQ::mass;
    attribute length : ISQ::length;

    port powerPort : PowerInterface;
  }

  // Define an engine part
  part def Engine :> Vehicle {
    attribute horsepower : ISQ::power;
    attribute fuelType : String = "gasoline";
  }

  // Port interface definition
  port def PowerInterface;

  // Connection definition
  connection def PowerConnection;

  // Action definition
  action def StartEngine;

  // Concrete vehicle usage
  part myVehicle : Vehicle {
    part engine : Engine;
  }
}
`;

console.log('=== SysML v2 Lexer, Parser, and Generator Example ===\n');

// Step 1: Lexical Analysis
console.log('Step 1: Lexical Analysis (Tokenization)');
console.log('----------------------------------------');

const lexer = new Lexer(sysmlSource, 'VehicleExample.sysml');
const tokens = lexer.tokenize();

// Display first 20 tokens
console.log(`Generated ${tokens.length} tokens. First 20 tokens:\n`);
tokens.slice(0, 20).forEach((token, i) => {
  console.log(`${i + 1}. ${token.toString()}`);
});

// Step 2: Parsing (Generate AST)
console.log('\n\nStep 2: Parsing (Generate AST)');
console.log('--------------------------------');

const parser = new Parser(tokens);
const ast = parser.parse();

console.log('AST Root Node:', ast.nodeType);
console.log('Top-level elements:', ast.elements.length);
console.log('\nAST Structure:');
console.log(JSON.stringify(ast, null, 2).substring(0, 1000) + '...\n');

// Step 3: Code Generation
console.log('\nStep 3: Code Generation (AST to SysML v2)');
console.log('------------------------------------------');

const generator = new Generator({ indentSize: 2 });
const generatedCode = generator.generate(ast);

console.log('Generated SysML v2 code:\n');
console.log(generatedCode);

// Step 4: Round-trip test
console.log('\n\nStep 4: Round-trip Test');
console.log('------------------------');

// Parse the generated code again
const lexer2 = new Lexer(generatedCode, 'generated.sysml');
const tokens2 = lexer2.tokenize();
const parser2 = new Parser(tokens2);
const ast2 = parser2.parse();

// Generate code again
const generator2 = new Generator({ indentSize: 2 });
const generatedCode2 = generator2.generate(ast2);

console.log('Round-trip successful:', generatedCode === generatedCode2);

// Step 5: Token location tracking demo
console.log('\n\nStep 5: Token Location Tracking Demo');
console.log('--------------------------------------');

// Find a specific token and display its location
const vehicleToken = tokens.find(t => t.value === 'Vehicle' && t.type === 'IDENTIFIER');
if (vehicleToken) {
  console.log('Found "Vehicle" identifier:');
  console.log(`  File: ${vehicleToken.location.file}`);
  console.log(`  Line: ${vehicleToken.location.line}`);
  console.log(`  Column: ${vehicleToken.location.column}`);
  console.log(`  Range: [${vehicleToken.location.startIndex}, ${vehicleToken.location.endIndex}]`);
}

console.log('\n=== Example Complete ===');
