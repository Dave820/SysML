# SysML v2 Lexer, Parser, and Code Generator

A comprehensive JavaScript implementation of a lexical analyzer (lexer), parser, and code generator for SysML v2 (Systems Modeling Language version 2).

## Features

### Lexer (`lexer.js`)
- **Tokenization**: Converts SysML v2 source code into a stream of tokens
- **Source Location Tracking**: Every token includes precise location information (file, line, column, start/end indices)
- **Comprehensive Token Support**:
  - Keywords (package, part, def, attribute, connection, etc.)
  - Operators (:>, :>>, ::>, =>, :=, etc.)
  - Identifiers and qualified names
  - String and numeric literals
  - Comments (line and block)
  - Punctuation and symbols

### Parser (`parser.js`)
- **AST Generation**: Builds a complete Abstract Syntax Tree from tokens
- **Supported Constructs**:
  - Package declarations
  - Part definitions and usages
  - Attribute definitions and usages
  - Port definitions and usages
  - Connection definitions and usages
  - Interface definitions
  - Action definitions and usages
  - Import statements
  - Specialization relationships (:>, :>>, subsets, references)
  - Qualified names and literals

### Generator (`generator.js`)
- **Code Generation**: Reconstructs SysML v2 source code from AST
- **Formatting Options**: Configurable indentation (size and character)
- **Readable Output**: Automatic spacing and formatting for clean, readable code
- **Round-trip Support**: Generated code can be parsed back to produce an equivalent AST

## Installation

No external dependencies required. All modules are pure JavaScript.

```bash
# Clone or download the repository
# All you need are these files:
# - lexer.js
# - parser.js
# - generator.js
```

## Web Interface

An interactive web interface is provided for easy visualization and testing.

### Local Usage

```bash
# Start the local web server
node serve.js

# Or specify a custom port
node serve.js 3000
```

Then open your browser to `http://localhost:8080` (or your custom port).

You can also open `index.html` directly in your browser (works without a server).

### GitHub Pages Deployment

Deploy the web interface to GitHub Pages for public access:

```bash
# Deploy to GitHub Pages (one command)
./deploy-gh-pages.sh
```

Then configure GitHub Pages in your repository settings to use the `gh-pages` branch.

See [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md) for detailed deployment instructions.

### Web Interface Features

The interface displays:
- **Input Panel**: Enter or edit SysML v2 code
- **AST Panel**: View the generated Abstract Syntax Tree in JSON format
- **Output Panel**: See the reconstructed SysML v2 code
- **Statistics**: Token count, AST node count, processing time, and round-trip validation

## Usage

### Basic Example

```javascript
const { Lexer } = require('./lexer.js');
const { Parser } = require('./parser.js');
const { Generator } = require('./generator.js');

// Your SysML v2 source code
const source = `
package Example {
  part def Vehicle {
    attribute mass : ISQ::mass;
  }
}
`;

// Step 1: Tokenize
const lexer = new Lexer(source, 'example.sysml');
const tokens = lexer.tokenize();

// Step 2: Parse
const parser = new Parser(tokens);
const ast = parser.parse();

// Step 3: Generate code
const generator = new Generator({ indentSize: 2 });
const output = generator.generate(ast);

console.log(output);
```

### Lexer Only

```javascript
const { Lexer } = require('./lexer.js');

const lexer = new Lexer('part def Vehicle;', 'test.sysml');
const tokens = lexer.tokenize();

tokens.forEach(token => {
  console.log(token.toString());
});
```

### Parser Only

```javascript
const { Lexer } = require('./lexer.js');
const { Parser } = require('./parser.js');

const lexer = new Lexer('part def Vehicle;', 'test.sysml');
const tokens = lexer.tokenize();

const parser = new Parser(tokens);
const ast = parser.parse();

console.log(JSON.stringify(ast, null, 2));
```

### Generator Only

```javascript
const { Generator } = require('./generator.js');

// Assuming you have an AST
const generator = new Generator({
  indentSize: 4,
  indentChar: ' '
});

const code = generator.generate(ast);
console.log(code);
```

## Running the Example

```bash
node example.js
```

This will run a complete demonstration including:
1. Tokenization of sample SysML v2 code
2. AST generation
3. Code generation
4. Round-trip validation
5. Location tracking demonstration

## API Reference

### Lexer

```javascript
const lexer = new Lexer(sourceCode, filename);
const tokens = lexer.tokenize();
```

**Methods:**
- `tokenize()`: Returns array of Token objects
- `filterComments()`: Returns tokens without comments

**Token Structure:**
```javascript
{
  type: 'KEYWORD' | 'IDENTIFIER' | 'OPERATOR' | 'STRING' | 'NUMBER' | 'PUNCTUATION' | 'COMMENT' | 'EOF',
  value: string,
  location: {
    file: string,
    line: number,
    column: number,
    startIndex: number,
    endIndex: number
  }
}
```

### Parser

```javascript
const parser = new Parser(tokens);
const ast = parser.parse();
```

**AST Node Types:**
- `Program`: Root node containing all elements
- `PackageDeclaration`: Package with nested elements
- `PartDefinition` / `PartUsage`: Part definitions and usages
- `AttributeDefinition` / `AttributeUsage`: Attribute definitions and usages
- `PortDefinition` / `PortUsage`: Port definitions and usages
- `ConnectionDefinition` / `ConnectionUsage`: Connection definitions and usages
- `InterfaceDefinition`: Interface definitions
- `ActionDefinition` / `ActionUsage`: Action definitions and usages
- `Specialization`: Relationship (specializes, redefines, subsets, references)
- `ImportStatement`: Import declarations
- `QualifiedName`: Namespace-qualified names
- `Literal`: String, number, or boolean literals

### Generator

```javascript
const generator = new Generator(options);
const code = generator.generate(ast);
```

**Options:**
- `indentSize`: Number of indent characters per level (default: 2)
- `indentChar`: Character to use for indentation (default: ' ')

## SysML v2 Language Support

This implementation supports core SysML v2 textual notation features:

### Keywords
- **Declarations**: package, library, standard, def, abstract, variation, metadata
- **Types**: attribute, enum, occurrence, individual, item, part, port, connection, interface, allocation, flow, action, calculation, constraint, requirement, concern, case, analysis, verification, view, viewpoint, rendering
- **Usage**: ref, binding, connect, message, perform, accept, send, assign, if, while, for, loop, fork, join, merge, decide, state, transition, entry, do, exit, exhibit, include, satisfy, assert
- **Structural**: import, all, alias, filter, expose, subject, actor, stakeholder, objective, assume, require, frame, verify, render

### Operators
- `:>` (specializes)
- `:>>` (redefines)
- `::>` (references)
- `=>` (crosses)
- `:` (typing)
- `:=` (assignment)
- `=` (default value)
- `..` (range)

## Limitations

This is a simplified implementation focused on core SysML v2 features. Some advanced features are not fully implemented:
- Complex expressions
- Full multiplicity syntax parsing
- Some specialized element types
- Constraint expressions
- Calculation bodies

## Example SysML v2 Code

```sysml
package VehicleExample {

  import ISQ::*;

  part def Vehicle {
    attribute mass : ISQ::mass;
    port powerPort : PowerInterface;
  }

  part def Engine :> Vehicle {
    attribute horsepower : ISQ::power;
  }

  port def PowerInterface {
    in powerInput : ISQ::power;
    out powerOutput : ISQ::power;
  }

  part myVehicle : Vehicle {
    part engine : Engine;

    connection powerConnection
      connect engine.powerPort to powerPort;
  }
}
```

## License

MIT License - Feel free to use and modify as needed.

## Contributing

This is a basic implementation. Contributions to add more SysML v2 features are welcome!

## References

- [SysML v2 Official Repository](https://github.com/Systems-Modeling/SysML-v2-Release)
- [OMG SysML v2 Specification](https://www.omg.org/sysml/sysmlv2/)
- [SysML v2 Pilot Implementation](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation)
