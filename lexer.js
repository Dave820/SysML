/**
 * SysML v2 Lexer
 * Performs lexical analysis on SysML v2 source code and generates tokens with source location tracking.
 */

class Token {
  constructor(type, value, location) {
    this.type = type;
    this.value = value;
    this.location = location; // { file, line, column, startIndex, endIndex }
  }

  toString() {
    return `Token(${this.type}, '${this.value}', line ${this.location.line}, col ${this.location.column})`;
  }
}

class SourceLocation {
  constructor(file, line, column, startIndex, endIndex) {
    this.file = file;
    this.line = line;
    this.column = column;
    this.startIndex = startIndex;
    this.endIndex = endIndex;
  }
}

class Lexer {
  constructor(sourceCode, filename = '<unknown>') {
    this.sourceCode = sourceCode;
    this.filename = filename;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];

    // SysML v2 Keywords
    this.keywords = new Set([
      // Declaration keywords
      'package', 'library', 'standard', 'def', 'abstract', 'variation',
      'metadata',
      // Type definition keywords
      'attribute', 'enum', 'occurrence', 'individual',
      'item', 'part', 'port', 'connection',
      'interface', 'allocation', 'flow', 'action',
      'calculation', 'constraint', 'requirement', 'concern', 'case',
      'analysis', 'verification', 'viewpoint', 'rendering',
      'view',
      // Usage keywords
      'ref', 'binding', 'connect', 'message',
      'perform', 'accept', 'send', 'assign',
      'if', 'while', 'for', 'loop', 'fork', 'join', 'merge', 'decide',
      'state', 'transition', 'entry', 'do', 'exit',
      'exhibit', 'include', 'satisfy', 'assert',
      // Structural keywords
      'import', 'all', 'alias', 'filter', 'expose',
      'subject', 'actor', 'stakeholder', 'objective',
      'assume', 'require', 'frame', 'verify', 'render',
      // Additional keywords
      'specializes', 'redefines', 'subsets', 'references',
      'ordered', 'nonunique', 'defined', 'by',
      'from', 'to', 'default', 'in', 'out', 'inout',
      'end', 'crosses', 'conjugate', 'readonly',
      'derived', 'composite', 'succession', 'first', 'then',
      'use', 'doc', 'language', 'comment', 'about',
      'individual', 'snapshot', 'timeslice', 'variant',
      'inv', 'pre', 'post', 'private', 'protected', 'public'
    ]);

    // Multi-character operators (must be checked before single chars)
    // Note: Order matters! Longer operators must come before shorter ones that are prefixes
    this.multiCharOperators = [
      '::>', ':>>', ':>', ':=', '::', '=>', '..', '==', '!=',
      '<=', '>=', '&&', '||', '**', '//', '->', '??', '?.'
    ];
  }

  isWhitespace(char) {
    return /\s/.test(char);
  }

  isDigit(char) {
    return /[0-9]/.test(char);
  }

  isAlpha(char) {
    return /[a-zA-Z_]/.test(char);
  }

  isAlphaNumeric(char) {
    return this.isAlpha(char) || this.isDigit(char);
  }

  peek(offset = 0) {
    const pos = this.position + offset;
    return pos < this.sourceCode.length ? this.sourceCode[pos] : null;
  }

  advance() {
    const char = this.sourceCode[this.position];
    this.position++;

    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }

    return char;
  }

  skipWhitespace() {
    while (this.peek() && this.isWhitespace(this.peek())) {
      this.advance();
    }
  }

  skipLineComment() {
    // Skip '//'
    this.advance();
    this.advance();

    const startLine = this.line;
    const startColumn = this.column - 2;
    const startIndex = this.position - 2;
    let commentText = '';

    while (this.peek() && this.peek() !== '\n') {
      commentText += this.advance();
    }

    return new Token(
      'COMMENT',
      commentText,
      new SourceLocation(this.filename, startLine, startColumn, startIndex, this.position)
    );
  }

  skipBlockComment() {
    // Skip '/*'
    this.advance();
    this.advance();

    const startLine = this.line;
    const startColumn = this.column - 2;
    const startIndex = this.position - 2;
    let commentText = '';

    while (this.peek()) {
      if (this.peek() === '*' && this.peek(1) === '/') {
        this.advance(); // consume '*'
        this.advance(); // consume '/'
        break;
      }
      commentText += this.advance();
    }

    return new Token(
      'BLOCK_COMMENT',
      commentText,
      new SourceLocation(this.filename, startLine, startColumn, startIndex, this.position)
    );
  }

  readString() {
    const startLine = this.line;
    const startColumn = this.column;
    const startIndex = this.position;

    const quote = this.advance(); // consume opening quote
    let value = '';

    while (this.peek() && this.peek() !== quote) {
      if (this.peek() === '\\') {
        this.advance(); // consume backslash
        const escaped = this.advance();
        // Handle escape sequences
        switch (escaped) {
          case 'n': value += '\n'; break;
          case 't': value += '\t'; break;
          case 'r': value += '\r'; break;
          case '\\': value += '\\'; break;
          case quote: value += quote; break;
          default: value += escaped;
        }
      } else {
        value += this.advance();
      }
    }

    if (this.peek() === quote) {
      this.advance(); // consume closing quote
    } else {
      throw new Error(`Unterminated string at line ${startLine}, column ${startColumn}`);
    }

    return new Token(
      'STRING',
      value,
      new SourceLocation(this.filename, startLine, startColumn, startIndex, this.position)
    );
  }

  readNumber() {
    const startLine = this.line;
    const startColumn = this.column;
    const startIndex = this.position;
    let value = '';

    // Handle negative numbers
    if (this.peek() === '-') {
      value += this.advance();
    }

    // Read integer part
    while (this.peek() && this.isDigit(this.peek())) {
      value += this.advance();
    }

    // Read decimal part
    if (this.peek() === '.' && this.isDigit(this.peek(1))) {
      value += this.advance(); // consume '.'
      while (this.peek() && this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    // Read exponent part
    if (this.peek() && (this.peek() === 'e' || this.peek() === 'E')) {
      value += this.advance();
      if (this.peek() === '+' || this.peek() === '-') {
        value += this.advance();
      }
      while (this.peek() && this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    return new Token(
      'NUMBER',
      value,
      new SourceLocation(this.filename, startLine, startColumn, startIndex, this.position)
    );
  }

  readIdentifier() {
    const startLine = this.line;
    const startColumn = this.column;
    const startIndex = this.position;
    let value = '';

    while (this.peek() && this.isAlphaNumeric(this.peek())) {
      value += this.advance();
    }

    // Check if it's a keyword
    const type = this.keywords.has(value) ? 'KEYWORD' : 'IDENTIFIER';

    return new Token(
      type,
      value,
      new SourceLocation(this.filename, startLine, startColumn, startIndex, this.position)
    );
  }

  readOperator() {
    const startLine = this.line;
    const startColumn = this.column;
    const startIndex = this.position;

    // Try to match multi-character operators first
    for (const op of this.multiCharOperators) {
      let match = true;
      for (let i = 0; i < op.length; i++) {
        if (this.peek(i) !== op[i]) {
          match = false;
          break;
        }
      }
      if (match) {
        for (let i = 0; i < op.length; i++) {
          this.advance();
        }
        return new Token(
          'OPERATOR',
          op,
          new SourceLocation(this.filename, startLine, startColumn, startIndex, this.position)
        );
      }
    }

    // Single character operator or punctuation
    const char = this.advance();
    const type = this.isPunctuation(char) ? 'PUNCTUATION' : 'OPERATOR';

    return new Token(
      type,
      char,
      new SourceLocation(this.filename, startLine, startColumn, startIndex, this.position)
    );
  }

  isPunctuation(char) {
    return [';', ',', '{', '}', '(', ')', '[', ']', '.', ':'].includes(char);
  }

  tokenize() {
    this.tokens = [];

    while (this.position < this.sourceCode.length) {
      this.skipWhitespace();

      if (this.position >= this.sourceCode.length) {
        break;
      }

      const char = this.peek();

      // Comments
      if (char === '/' && this.peek(1) === '/') {
        this.tokens.push(this.skipLineComment());
        continue;
      }

      if (char === '/' && this.peek(1) === '*') {
        this.tokens.push(this.skipBlockComment());
        continue;
      }

      // Strings
      if (char === '"' || char === "'") {
        this.tokens.push(this.readString());
        continue;
      }

      // Numbers
      if (this.isDigit(char) || (char === '-' && this.isDigit(this.peek(1)))) {
        this.tokens.push(this.readNumber());
        continue;
      }

      // Identifiers and keywords
      if (this.isAlpha(char)) {
        this.tokens.push(this.readIdentifier());
        continue;
      }

      // Operators and punctuation
      this.tokens.push(this.readOperator());
    }

    // Add EOF token
    this.tokens.push(new Token(
      'EOF',
      '',
      new SourceLocation(this.filename, this.line, this.column, this.position, this.position)
    ));

    return this.tokens;
  }

  // Utility method to filter out comments if desired
  filterComments() {
    return this.tokens.filter(token =>
      token.type !== 'COMMENT' && token.type !== 'BLOCK_COMMENT'
    );
  }
}

// Export for Node.js module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Lexer, Token, SourceLocation };
}
