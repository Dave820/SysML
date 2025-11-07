/**
 * SysML v2 Tools - Main Entry Point
 * Exports all modules: Lexer, Parser, and Generator
 */

const { Lexer, Token, SourceLocation } = require('./lexer.js');
const {
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
  Specialization,
  ImportStatement,
  Comment,
  Literal,
  QualifiedName
} = require('./parser.js');
const { Generator } = require('./generator.js');

module.exports = {
  // Lexer exports
  Lexer,
  Token,
  SourceLocation,

  // Parser exports
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
  Specialization,
  ImportStatement,
  Comment,
  Literal,
  QualifiedName,

  // Generator exports
  Generator
};
