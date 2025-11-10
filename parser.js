/**
 * SysML v2 Parser
 * Generates an Abstract Syntax Tree (AST) from tokens produced by the lexer.
 */

// AST Node Types
class ASTNode {
  constructor(type, location) {
    this.nodeType = type;
    this.location = location;
  }
}

class Program extends ASTNode {
  constructor(elements, location) {
    super('Program', location);
    this.elements = elements; // Array of top-level elements (packages, definitions, etc.)
  }
}

class PackageDeclaration extends ASTNode {
  constructor(name, elements, location) {
    super('PackageDeclaration', location);
    this.name = name;
    this.elements = elements; // Array of elements within the package
  }
}

class PartDefinition extends ASTNode {
  constructor(name, specializations, body, isAbstract, location) {
    super('PartDefinition', location);
    this.name = name;
    this.specializations = specializations; // Array of specialization relationships
    this.body = body; // Array of body elements
    this.isAbstract = isAbstract;
  }
}

class PartUsage extends ASTNode {
  constructor(name, type, multiplicity, specializations, body, location) {
    super('PartUsage', location);
    this.name = name;
    this.type = type;
    this.multiplicity = multiplicity;
    this.specializations = specializations;
    this.body = body;
  }
}

class AttributeDefinition extends ASTNode {
  constructor(name, specializations, body, location) {
    super('AttributeDefinition', location);
    this.name = name;
    this.specializations = specializations;
    this.body = body;
  }
}

class AttributeUsage extends ASTNode {
  constructor(name, type, specializations, defaultValue, multiplicity, location) {
    super('AttributeUsage', location);
    this.name = name;
    this.type = type;
    this.specializations = specializations;
    this.defaultValue = defaultValue;
    this.multiplicity = multiplicity;
  }
}

class PortDefinition extends ASTNode {
  constructor(name, specializations, body, location) {
    super('PortDefinition', location);
    this.name = name;
    this.specializations = specializations;
    this.body = body;
  }
}

class PortUsage extends ASTNode {
  constructor(name, type, direction, specializations, body, location) {
    super('PortUsage', location);
    this.name = name;
    this.type = type;
    this.direction = direction; // 'in', 'out', 'inout'
    this.specializations = specializations;
    this.body = body;
  }
}

class ConnectionDefinition extends ASTNode {
  constructor(name, specializations, body, location) {
    super('ConnectionDefinition', location);
    this.name = name;
    this.specializations = specializations;
    this.body = body;
  }
}

class ConnectionUsage extends ASTNode {
  constructor(name, ends, specializations, location) {
    super('ConnectionUsage', location);
    this.name = name;
    this.ends = ends; // Array of connection endpoints
    this.specializations = specializations;
  }
}

class InterfaceDefinition extends ASTNode {
  constructor(name, specializations, body, location) {
    super('InterfaceDefinition', location);
    this.name = name;
    this.specializations = specializations;
    this.body = body;
  }
}

class ActionDefinition extends ASTNode {
  constructor(name, specializations, body, location) {
    super('ActionDefinition', location);
    this.name = name;
    this.specializations = specializations;
    this.body = body;
  }
}

class ActionUsage extends ASTNode {
  constructor(name, type, specializations, body, location) {
    super('ActionUsage', location);
    this.name = name;
    this.type = type;
    this.specializations = specializations;
    this.body = body;
  }
}

class RequirementDefinition extends ASTNode {
  constructor(name, specializations, body, location) {
    super('RequirementDefinition', location);
    this.name = name;
    this.specializations = specializations;
    this.body = body;
  }
}

class RequirementUsage extends ASTNode {
  constructor(name, type, specializations, body, location) {
    super('RequirementUsage', location);
    this.name = name;
    this.type = type;
    this.specializations = specializations;
    this.body = body;
  }
}

class Specialization extends ASTNode {
  constructor(kind, target, location) {
    super('Specialization', location);
    this.kind = kind; // 'specializes' (:>), 'redefines' (:>>), 'subsets', 'references' (::>)
    this.target = target; // Qualified name
  }
}

class ImportStatement extends ASTNode {
  constructor(importedNamespace, importAll, location) {
    super('ImportStatement', location);
    this.importedNamespace = importedNamespace;
    this.importAll = importAll;
  }
}

class Comment extends ASTNode {
  constructor(text, location) {
    super('Comment', location);
    this.text = text;
  }
}

class Literal extends ASTNode {
  constructor(literalType, value, location) {
    super('Literal', location);
    this.literalType = literalType; // 'string', 'number', 'boolean'
    this.value = value;
  }
}

class QualifiedName extends ASTNode {
  constructor(parts, location) {
    super('QualifiedName', location);
    this.parts = parts; // Array of identifier strings
  }

  toString() {
    return this.parts.join('::');
  }
}

// Parser class
class Parser {
  constructor(tokens) {
    this.tokens = tokens.filter(t => t.type !== 'COMMENT' && t.type !== 'BLOCK_COMMENT');
    this.position = 0;
    this.current = this.tokens[0];
  }

  peek(offset = 0) {
    const pos = this.position + offset;
    return pos < this.tokens.length ? this.tokens[pos] : this.tokens[this.tokens.length - 1];
  }

  advance() {
    if (this.position < this.tokens.length - 1) {
      this.position++;
      this.current = this.tokens[this.position];
    }
    return this.current;
  }

  expect(type, value = null) {
    if (this.current.type !== type) {
      throw new Error(
        `Expected token type ${type} but got ${this.current.type} at ${this.current.location.line}:${this.current.location.column}`
      );
    }
    if (value !== null && this.current.value !== value) {
      throw new Error(
        `Expected token value '${value}' but got '${this.current.value}' at ${this.current.location.line}:${this.current.location.column}`
      );
    }
    const token = this.current;
    this.advance();
    return token;
  }

  match(type, value = null) {
    if (this.current.type !== type) return false;
    if (value !== null && this.current.value !== value) return false;
    return true;
  }

  matchKeyword(keyword) {
    return this.match('KEYWORD', keyword);
  }

  // Parse the entire program
  parse() {
    const elements = [];
    const startLocation = this.current.location;

    while (this.current.type !== 'EOF') {
      elements.push(this.parseTopLevelElement());
    }

    return new Program(elements, startLocation);
  }

  parseTopLevelElement() {
    if (this.matchKeyword('package')) {
      return this.parsePackage();
    }
    if (this.matchKeyword('import')) {
      return this.parseImport();
    }
    return this.parseElement();
  }

  parsePackage() {
    const startLocation = this.current.location;
    this.expect('KEYWORD', 'package');
    const name = this.parseQualifiedName();

    this.expect('PUNCTUATION', '{');

    const elements = [];
    while (!this.match('PUNCTUATION', '}') && this.current.type !== 'EOF') {
      // Allow import statements in packages
      if (this.matchKeyword('import')) {
        elements.push(this.parseImport());
      } else {
        elements.push(this.parseElement());
      }
    }

    this.expect('PUNCTUATION', '}');

    return new PackageDeclaration(name, elements, startLocation);
  }

  parseImport() {
    const startLocation = this.current.location;
    this.expect('KEYWORD', 'import');

    const namespace = this.parseQualifiedName();
    let importAll = false;

    if (this.match('OPERATOR', '::')) {
      this.advance();
      if (this.match('OPERATOR', '*')) {
        this.advance();
        importAll = true;
      }
    }

    this.expect('PUNCTUATION', ';');

    return new ImportStatement(namespace, importAll, startLocation);
  }

  parseElement() {
    const startLocation = this.current.location;
    let isAbstract = false;

    // Check for abstract modifier
    if (this.matchKeyword('abstract')) {
      isAbstract = true;
      this.advance();
    }

    // Parse different element types
    if (this.matchKeyword('part')) {
      this.advance();
      if (this.matchKeyword('def')) {
        return this.parsePartDefinition(isAbstract, startLocation);
      }
      return this.parsePartUsage(startLocation);
    }

    if (this.matchKeyword('attribute')) {
      this.advance();
      if (this.matchKeyword('def')) {
        return this.parseAttributeDefinition(startLocation);
      }
      return this.parseAttributeUsage(startLocation);
    }

    if (this.matchKeyword('port')) {
      this.advance();
      if (this.matchKeyword('def')) {
        return this.parsePortDefinition(startLocation);
      }
      return this.parsePortUsage(startLocation);
    }

    if (this.matchKeyword('connection')) {
      this.advance();
      if (this.matchKeyword('def')) {
        return this.parseConnectionDefinition(startLocation);
      }
      return this.parseConnectionUsage(startLocation);
    }

    if (this.matchKeyword('interface')) {
      this.advance();
      if (this.matchKeyword('def')) {
        return this.parseInterfaceDefinition(startLocation);
      }
    }

    if (this.matchKeyword('action')) {
      this.advance();
      if (this.matchKeyword('def')) {
        return this.parseActionDefinition(startLocation);
      }
      return this.parseActionUsage(startLocation);
    }

    if (this.matchKeyword('requirement')) {
      this.advance();
      if (this.matchKeyword('def')) {
        return this.parseRequirementDefinition(startLocation);
      }
      return this.parseRequirementUsage(startLocation);
    }

    throw new Error(
      `Unexpected token at ${this.current.location.line}:${this.current.location.column}: ${this.current.value}`
    );
  }

  parsePartDefinition(isAbstract, startLocation) {
    this.expect('KEYWORD', 'def');
    const name = this.expect('IDENTIFIER').value;

    const specializations = this.parseSpecializations();

    let body = [];
    if (this.match('PUNCTUATION', '{')) {
      this.advance();
      body = this.parseBody();
      this.expect('PUNCTUATION', '}');
    } else if (this.match('PUNCTUATION', ';')) {
      this.advance();
    }

    return new PartDefinition(name, specializations, body, isAbstract, startLocation);
  }

  parsePartUsage(startLocation) {
    const name = this.match('IDENTIFIER') ? this.expect('IDENTIFIER').value : null;

    let type = null;
    if (this.match('PUNCTUATION', ':')) {
      this.advance();
      type = this.parseQualifiedName();
    }

    const multiplicity = this.parseMultiplicity();
    const specializations = this.parseSpecializations();

    let body = [];
    if (this.match('PUNCTUATION', '{')) {
      this.advance();
      body = this.parseBody();
      this.expect('PUNCTUATION', '}');
    } else if (this.match('PUNCTUATION', ';')) {
      this.advance();
    }

    return new PartUsage(name, type, multiplicity, specializations, body, startLocation);
  }

  parseAttributeDefinition(startLocation) {
    this.expect('KEYWORD', 'def');
    const name = this.expect('IDENTIFIER').value;

    const specializations = this.parseSpecializations();

    let body = [];
    if (this.match('PUNCTUATION', '{')) {
      this.advance();
      body = this.parseBody();
      this.expect('PUNCTUATION', '}');
    } else if (this.match('PUNCTUATION', ';')) {
      this.advance();
    }

    return new AttributeDefinition(name, specializations, body, startLocation);
  }

  parseAttributeUsage(startLocation) {
    const name = this.match('IDENTIFIER') ? this.expect('IDENTIFIER').value : null;

    let type = null;
    if (this.match('PUNCTUATION', ':')) {
      this.advance();
      type = this.parseQualifiedName();
    }

    const specializations = this.parseSpecializations();
    const multiplicity = this.parseMultiplicity();

    let defaultValue = null;
    if (this.match('OPERATOR', '=')) {
      this.advance();
      defaultValue = this.parseLiteral();
    }

    if (this.match('PUNCTUATION', ';')) {
      this.advance();
    }

    return new AttributeUsage(name, type, specializations, defaultValue, multiplicity, startLocation);
  }

  parsePortDefinition(startLocation) {
    this.expect('KEYWORD', 'def');
    const name = this.expect('IDENTIFIER').value;

    const specializations = this.parseSpecializations();

    let body = [];
    if (this.match('PUNCTUATION', '{')) {
      this.advance();
      body = this.parseBody();
      this.expect('PUNCTUATION', '}');
    } else if (this.match('PUNCTUATION', ';')) {
      this.advance();
    }

    return new PortDefinition(name, specializations, body, startLocation);
  }

  parsePortUsage(startLocation) {
    const name = this.match('IDENTIFIER') ? this.expect('IDENTIFIER').value : null;

    let type = null;
    let direction = null;

    // Check for direction keywords
    if (this.matchKeyword('in') || this.matchKeyword('out') || this.matchKeyword('inout')) {
      direction = this.current.value;
      this.advance();
    }

    if (this.match('PUNCTUATION', ':')) {
      this.advance();
      type = this.parseQualifiedName();
    }

    const specializations = this.parseSpecializations();

    let body = [];
    if (this.match('PUNCTUATION', '{')) {
      this.advance();
      body = this.parseBody();
      this.expect('PUNCTUATION', '}');
    } else if (this.match('PUNCTUATION', ';')) {
      this.advance();
    }

    return new PortUsage(name, type, direction, specializations, body, startLocation);
  }

  parseConnectionDefinition(startLocation) {
    this.expect('KEYWORD', 'def');
    const name = this.expect('IDENTIFIER').value;

    const specializations = this.parseSpecializations();

    let body = [];
    if (this.match('PUNCTUATION', '{')) {
      this.advance();
      body = this.parseBody();
      this.expect('PUNCTUATION', '}');
    } else if (this.match('PUNCTUATION', ';')) {
      this.advance();
    }

    return new ConnectionDefinition(name, specializations, body, startLocation);
  }

  parseConnectionUsage(startLocation) {
    const name = this.match('IDENTIFIER') ? this.expect('IDENTIFIER').value : null;

    const specializations = this.parseSpecializations();

    // Parse connection ends (simplified)
    const ends = [];
    if (this.matchKeyword('connect')) {
      this.advance();
      // Simple connection: connect a to b
      ends.push(this.parseQualifiedName());
      if (this.matchKeyword('to')) {
        this.advance();
        ends.push(this.parseQualifiedName());
      }
    }

    if (this.match('PUNCTUATION', ';')) {
      this.advance();
    }

    return new ConnectionUsage(name, ends, specializations, startLocation);
  }

  parseInterfaceDefinition(startLocation) {
    this.expect('KEYWORD', 'def');
    const name = this.expect('IDENTIFIER').value;

    const specializations = this.parseSpecializations();

    let body = [];
    if (this.match('PUNCTUATION', '{')) {
      this.advance();
      body = this.parseBody();
      this.expect('PUNCTUATION', '}');
    } else if (this.match('PUNCTUATION', ';')) {
      this.advance();
    }

    return new InterfaceDefinition(name, specializations, body, startLocation);
  }

  parseActionDefinition(startLocation) {
    this.expect('KEYWORD', 'def');
    const name = this.expect('IDENTIFIER').value;

    const specializations = this.parseSpecializations();

    let body = [];
    if (this.match('PUNCTUATION', '{')) {
      this.advance();
      body = this.parseBody();
      this.expect('PUNCTUATION', '}');
    } else if (this.match('PUNCTUATION', ';')) {
      this.advance();
    }

    return new ActionDefinition(name, specializations, body, startLocation);
  }

  parseActionUsage(startLocation) {
    const name = this.match('IDENTIFIER') ? this.expect('IDENTIFIER').value : null;

    let type = null;
    if (this.match('PUNCTUATION', ':')) {
      this.advance();
      type = this.parseQualifiedName();
    }

    const specializations = this.parseSpecializations();

    let body = [];
    if (this.match('PUNCTUATION', '{')) {
      this.advance();
      body = this.parseBody();
      this.expect('PUNCTUATION', '}');
    } else if (this.match('PUNCTUATION', ';')) {
      this.advance();
    }

    return new ActionUsage(name, type, specializations, body, startLocation);
  }

  parseRequirementDefinition(startLocation) {
    this.expect('KEYWORD', 'def');
    const name = this.expect('IDENTIFIER').value;

    const specializations = this.parseSpecializations();

    let body = [];
    if (this.match('PUNCTUATION', '{')) {
      this.advance();
      body = this.parseBody();
      this.expect('PUNCTUATION', '}');
    } else if (this.match('PUNCTUATION', ';')) {
      this.advance();
    }

    return new RequirementDefinition(name, specializations, body, startLocation);
  }

  parseRequirementUsage(startLocation) {
    const name = this.match('IDENTIFIER') ? this.expect('IDENTIFIER').value : null;

    let type = null;
    if (this.match('PUNCTUATION', ':')) {
      this.advance();
      type = this.parseQualifiedName();
    }

    const specializations = this.parseSpecializations();

    let body = [];
    if (this.match('PUNCTUATION', '{')) {
      this.advance();
      body = this.parseBody();
      this.expect('PUNCTUATION', '}');
    } else if (this.match('PUNCTUATION', ';')) {
      this.advance();
    }

    return new RequirementUsage(name, type, specializations, body, startLocation);
  }

  parseSpecializations() {
    const specializations = [];

    while (true) {
      let kind = null;
      let operator = null;

      if (this.match('OPERATOR', ':>>')) {
        operator = ':>>';
        kind = 'redefines';
        this.advance();
      } else if (this.match('OPERATOR', ':>')) {
        operator = ':>';
        kind = 'specializes';
        this.advance();
      } else if (this.match('OPERATOR', '::>')) {
        operator = '::>';
        kind = 'references';
        this.advance();
      } else if (this.matchKeyword('specializes')) {
        kind = 'specializes';
        this.advance();
      } else if (this.matchKeyword('redefines')) {
        kind = 'redefines';
        this.advance();
      } else if (this.matchKeyword('subsets')) {
        kind = 'subsets';
        this.advance();
      } else if (this.matchKeyword('references')) {
        kind = 'references';
        this.advance();
      } else {
        break;
      }

      const target = this.parseQualifiedName();
      specializations.push(new Specialization(kind, target, this.current.location));

      // Check for comma-separated multiple specializations
      if (!this.match('PUNCTUATION', ',')) {
        break;
      }
      this.advance();
    }

    return specializations;
  }

  parseMultiplicity() {
    if (this.match('PUNCTUATION', '[')) {
      this.advance();
      // For now, just skip the multiplicity content
      while (!this.match('PUNCTUATION', ']') && this.current.type !== 'EOF') {
        this.advance();
      }
      this.expect('PUNCTUATION', ']');
      return 'multiplicity'; // Simplified
    }
    return null;
  }

  parseBody() {
    const body = [];

    while (!this.match('PUNCTUATION', '}') && this.current.type !== 'EOF') {
      body.push(this.parseElement());
    }

    return body;
  }

  parseQualifiedName() {
    const parts = [];
    const startLocation = this.current.location;

    parts.push(this.expect('IDENTIFIER').value);

    while (this.match('OPERATOR', '::') || this.match('PUNCTUATION', '.')) {
      // Check if next token after :: or . is an identifier
      if (this.peek(1).type !== 'IDENTIFIER') {
        break;
      }
      this.advance();
      parts.push(this.expect('IDENTIFIER').value);
    }

    return new QualifiedName(parts, startLocation);
  }

  parseLiteral() {
    const startLocation = this.current.location;

    if (this.match('STRING')) {
      const value = this.current.value;
      this.advance();
      return new Literal('string', value, startLocation);
    }

    if (this.match('NUMBER')) {
      const value = this.current.value;
      this.advance();
      return new Literal('number', value, startLocation);
    }

    if (this.match('KEYWORD', 'true') || this.match('KEYWORD', 'false')) {
      const value = this.current.value === 'true';
      this.advance();
      return new Literal('boolean', value, startLocation);
    }

    throw new Error(
      `Expected literal at ${this.current.location.line}:${this.current.location.column}`
    );
  }
}

// Export for Node.js module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Parser,
    ASTNode,
    Program,
    PackageDeclaration,
    PartDefinition,
    PartUsage,
    AttributeDefinition,
    AttributeUsage,
    PortDefinition,
    PortUsage,
    ConnectionDefinition,
    ConnectionUsage,
    InterfaceDefinition,
    ActionDefinition,
    ActionUsage,
    RequirementDefinition,
    RequirementUsage,
    Specialization,
    ImportStatement,
    Comment,
    Literal,
    QualifiedName
  };
}

// Export for browser usage
if (typeof window !== 'undefined') {
  console.log('Parser.js: Exporting to window object');
  window.Parser = Parser;
  window.ASTNode = ASTNode;
  window.Program = Program;
  window.PackageDeclaration = PackageDeclaration;
  window.PartDefinition = PartDefinition;
  window.PartUsage = PartUsage;
  window.AttributeDefinition = AttributeDefinition;
  window.AttributeUsage = AttributeUsage;
  window.PortDefinition = PortDefinition;
  window.PortUsage = PortUsage;
  window.ConnectionDefinition = ConnectionDefinition;
  window.ConnectionUsage = ConnectionUsage;
  window.InterfaceDefinition = InterfaceDefinition;
  window.ActionDefinition = ActionDefinition;
  window.ActionUsage = ActionUsage;
  window.RequirementDefinition = RequirementDefinition;
  window.RequirementUsage = RequirementUsage;
  window.Specialization = Specialization;
  window.ImportStatement = ImportStatement;
  window.Comment = Comment;
  window.Literal = Literal;
  window.QualifiedName = QualifiedName;
  console.log('Parser.js: Export complete. Parser type:', typeof window.Parser);
}
