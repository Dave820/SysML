/**
 * SysML v2 Code Generator
 * Generates SysML v2 source code from an Abstract Syntax Tree (AST).
 */

// Import parser AST nodes if using as module (Node.js)
// In browser, Parser and AST node types will be available as globals from parser.js
if (typeof require !== 'undefined' && typeof window === 'undefined') {
  // Node.js environment
  var Parser = require('./parser.js');
}
// In browser, all classes are already global from previous script loads

class Generator {
  constructor(options = {}) {
    this.indentSize = options.indentSize || 2;
    this.indentChar = options.indentChar || ' ';
    this.currentIndent = 0;
    this.output = '';
  }

  indent() {
    this.currentIndent++;
  }

  dedent() {
    this.currentIndent = Math.max(0, this.currentIndent - 1);
  }

  getIndentation() {
    return this.indentChar.repeat(this.indentSize * this.currentIndent);
  }

  write(text) {
    this.output += text;
  }

  writeLine(text = '') {
    if (text) {
      this.output += this.getIndentation() + text + '\n';
    } else {
      this.output += '\n';
    }
  }

  generate(ast) {
    this.output = '';
    this.currentIndent = 0;

    if (ast.nodeType === 'Program') {
      this.generateProgram(ast);
    } else {
      throw new Error(`Unknown AST node type: ${ast.nodeType}`);
    }

    return this.output;
  }

  generateProgram(node) {
    for (let i = 0; i < node.elements.length; i++) {
      this.generateElement(node.elements[i]);

      // Add blank line between top-level elements for readability
      if (i < node.elements.length - 1) {
        this.writeLine();
      }
    }
  }

  generateElement(node) {
    switch (node.nodeType) {
      case 'PackageDeclaration':
        this.generatePackage(node);
        break;
      case 'ImportStatement':
        this.generateImport(node);
        break;
      case 'PartDefinition':
        this.generatePartDefinition(node);
        break;
      case 'PartUsage':
        this.generatePartUsage(node);
        break;
      case 'AttributeDefinition':
        this.generateAttributeDefinition(node);
        break;
      case 'AttributeUsage':
        this.generateAttributeUsage(node);
        break;
      case 'PortDefinition':
        this.generatePortDefinition(node);
        break;
      case 'PortUsage':
        this.generatePortUsage(node);
        break;
      case 'ConnectionDefinition':
        this.generateConnectionDefinition(node);
        break;
      case 'ConnectionUsage':
        this.generateConnectionUsage(node);
        break;
      case 'InterfaceDefinition':
        this.generateInterfaceDefinition(node);
        break;
      case 'ActionDefinition':
        this.generateActionDefinition(node);
        break;
      case 'ActionUsage':
        this.generateActionUsage(node);
        break;
      default:
        throw new Error(`Unknown element type: ${node.nodeType}`);
    }
  }

  generatePackage(node) {
    this.writeLine(`package ${this.generateQualifiedName(node.name)} {`);
    this.indent();

    for (let i = 0; i < node.elements.length; i++) {
      this.generateElement(node.elements[i]);
      if (i < node.elements.length - 1) {
        this.writeLine();
      }
    }

    this.dedent();
    this.writeLine('}');
  }

  generateImport(node) {
    let importStr = `import ${this.generateQualifiedName(node.importedNamespace)}`;
    if (node.importAll) {
      importStr += '::*';
    }
    this.writeLine(importStr + ';');
  }

  generatePartDefinition(node) {
    let line = '';

    if (node.isAbstract) {
      line += 'abstract ';
    }

    line += 'part def ' + node.name;

    if (node.specializations.length > 0) {
      line += ' ' + this.generateSpecializations(node.specializations);
    }

    if (node.body.length > 0) {
      this.writeLine(line + ' {');
      this.indent();
      this.generateBody(node.body);
      this.dedent();
      this.writeLine('}');
    } else {
      this.writeLine(line + ';');
    }
  }

  generatePartUsage(node) {
    let line = 'part';

    if (node.name) {
      line += ' ' + node.name;
    }

    if (node.type) {
      line += ' : ' + this.generateQualifiedName(node.type);
    }

    if (node.multiplicity) {
      line += ' [' + node.multiplicity + ']';
    }

    if (node.specializations.length > 0) {
      line += ' ' + this.generateSpecializations(node.specializations);
    }

    if (node.body.length > 0) {
      this.writeLine(line + ' {');
      this.indent();
      this.generateBody(node.body);
      this.dedent();
      this.writeLine('}');
    } else {
      this.writeLine(line + ';');
    }
  }

  generateAttributeDefinition(node) {
    let line = 'attribute def ' + node.name;

    if (node.specializations.length > 0) {
      line += ' ' + this.generateSpecializations(node.specializations);
    }

    if (node.body.length > 0) {
      this.writeLine(line + ' {');
      this.indent();
      this.generateBody(node.body);
      this.dedent();
      this.writeLine('}');
    } else {
      this.writeLine(line + ';');
    }
  }

  generateAttributeUsage(node) {
    let line = 'attribute';

    if (node.name) {
      line += ' ' + node.name;
    }

    if (node.type) {
      line += ' : ' + this.generateQualifiedName(node.type);
    }

    if (node.specializations.length > 0) {
      line += ' ' + this.generateSpecializations(node.specializations);
    }

    if (node.multiplicity) {
      line += ' [' + node.multiplicity + ']';
    }

    if (node.defaultValue) {
      line += ' = ' + this.generateLiteral(node.defaultValue);
    }

    this.writeLine(line + ';');
  }

  generatePortDefinition(node) {
    let line = 'port def ' + node.name;

    if (node.specializations.length > 0) {
      line += ' ' + this.generateSpecializations(node.specializations);
    }

    if (node.body.length > 0) {
      this.writeLine(line + ' {');
      this.indent();
      this.generateBody(node.body);
      this.dedent();
      this.writeLine('}');
    } else {
      this.writeLine(line + ';');
    }
  }

  generatePortUsage(node) {
    let line = 'port';

    if (node.name) {
      line += ' ' + node.name;
    }

    if (node.direction) {
      line += ' ' + node.direction;
    }

    if (node.type) {
      line += ' : ' + this.generateQualifiedName(node.type);
    }

    if (node.specializations.length > 0) {
      line += ' ' + this.generateSpecializations(node.specializations);
    }

    if (node.body.length > 0) {
      this.writeLine(line + ' {');
      this.indent();
      this.generateBody(node.body);
      this.dedent();
      this.writeLine('}');
    } else {
      this.writeLine(line + ';');
    }
  }

  generateConnectionDefinition(node) {
    let line = 'connection def ' + node.name;

    if (node.specializations.length > 0) {
      line += ' ' + this.generateSpecializations(node.specializations);
    }

    if (node.body.length > 0) {
      this.writeLine(line + ' {');
      this.indent();
      this.generateBody(node.body);
      this.dedent();
      this.writeLine('}');
    } else {
      this.writeLine(line + ';');
    }
  }

  generateConnectionUsage(node) {
    let line = 'connection';

    if (node.name) {
      line += ' ' + node.name;
    }

    if (node.specializations.length > 0) {
      line += ' ' + this.generateSpecializations(node.specializations);
    }

    if (node.ends.length > 0) {
      line += ' connect ';
      line += node.ends.map(e => this.generateQualifiedName(e)).join(' to ');
    }

    this.writeLine(line + ';');
  }

  generateInterfaceDefinition(node) {
    let line = 'interface def ' + node.name;

    if (node.specializations.length > 0) {
      line += ' ' + this.generateSpecializations(node.specializations);
    }

    if (node.body.length > 0) {
      this.writeLine(line + ' {');
      this.indent();
      this.generateBody(node.body);
      this.dedent();
      this.writeLine('}');
    } else {
      this.writeLine(line + ';');
    }
  }

  generateActionDefinition(node) {
    let line = 'action def ' + node.name;

    if (node.specializations.length > 0) {
      line += ' ' + this.generateSpecializations(node.specializations);
    }

    if (node.body.length > 0) {
      this.writeLine(line + ' {');
      this.indent();
      this.generateBody(node.body);
      this.dedent();
      this.writeLine('}');
    } else {
      this.writeLine(line + ';');
    }
  }

  generateActionUsage(node) {
    let line = 'action';

    if (node.name) {
      line += ' ' + node.name;
    }

    if (node.type) {
      line += ' : ' + this.generateQualifiedName(node.type);
    }

    if (node.specializations.length > 0) {
      line += ' ' + this.generateSpecializations(node.specializations);
    }

    if (node.body.length > 0) {
      this.writeLine(line + ' {');
      this.indent();
      this.generateBody(node.body);
      this.dedent();
      this.writeLine('}');
    } else {
      this.writeLine(line + ';');
    }
  }

  generateSpecializations(specializations) {
    return specializations.map(spec => {
      const operator = this.getSpecializationOperator(spec.kind);
      return operator + ' ' + this.generateQualifiedName(spec.target);
    }).join(', ');
  }

  getSpecializationOperator(kind) {
    switch (kind) {
      case 'specializes': return ':>';
      case 'redefines': return ':>>';
      case 'subsets': return 'subsets';
      case 'references': return '::>';
      default: return ':>';
    }
  }

  generateBody(body) {
    for (let i = 0; i < body.length; i++) {
      this.generateElement(body[i]);

      // Add spacing between body elements
      if (i < body.length - 1 && this.shouldAddSpacing(body[i], body[i + 1])) {
        this.writeLine();
      }
    }
  }

  shouldAddSpacing(current, next) {
    // Add spacing between definitions but not between simple usages
    const isDefinition = node => node.nodeType.endsWith('Definition');
    return isDefinition(current) || isDefinition(next);
  }

  generateQualifiedName(node) {
    if (typeof node === 'string') {
      return node;
    }
    if (node.nodeType === 'QualifiedName') {
      return node.parts.join('::');
    }
    throw new Error(`Expected QualifiedName but got ${node.nodeType}`);
  }

  generateLiteral(node) {
    if (node.literalType === 'string') {
      return `"${node.value}"`;
    }
    if (node.literalType === 'number') {
      return node.value;
    }
    if (node.literalType === 'boolean') {
      return node.value ? 'true' : 'false';
    }
    return String(node.value);
  }
}

// Export for Node.js module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Generator };
}

// Export for browser usage
if (typeof window !== 'undefined') {
  console.log('Generator.js: Exporting to window object');
  window.Generator = Generator;
  console.log('Generator.js: Export complete. Generator type:', typeof window.Generator);
}
