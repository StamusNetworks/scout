import { type Diagnostic, linter } from '@codemirror/lint';
import type { Extension } from '@codemirror/state';

const BOOLEAN_OPERATORS = new Set(['AND', 'OR', 'NOT']);

function lintLucene(doc: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  // Track unmatched delimiters
  const parenStack: number[] = [];
  const bracketStack: { pos: number; char: string }[] = [];
  let i = 0;

  while (i < doc.length) {
    const ch = doc[i];

    // Skip quoted strings
    if (ch === '"') {
      const start = i;
      i++;
      let closed = false;
      while (i < doc.length) {
        if (doc[i] === '\\') {
          i += 2;
          continue;
        }
        if (doc[i] === '"') {
          closed = true;
          i++;
          break;
        }
        i++;
      }
      if (!closed) {
        diagnostics.push({
          from: start,
          to: doc.length,
          severity: 'error',
          message: 'Unmatched quote',
        });
      }
      continue;
    }

    // Skip regex
    if (ch === '/') {
      const start = i;
      i++;
      let closed = false;
      while (i < doc.length) {
        if (doc[i] === '\\') {
          i += 2;
          continue;
        }
        if (doc[i] === '/') {
          closed = true;
          i++;
          break;
        }
        i++;
      }
      if (!closed) {
        diagnostics.push({
          from: start,
          to: doc.length,
          severity: 'error',
          message: 'Unmatched regex delimiter',
        });
      }
      continue;
    }

    // Parentheses
    if (ch === '(') {
      parenStack.push(i);
      i++;
      continue;
    }
    if (ch === ')') {
      if (parenStack.length === 0) {
        diagnostics.push({
          from: i,
          to: i + 1,
          severity: 'error',
          message: 'Unmatched closing parenthesis',
        });
      } else {
        parenStack.pop();
      }
      i++;
      continue;
    }

    // Square/curly brackets (ranges)
    if (ch === '[' || ch === '{') {
      bracketStack.push({ pos: i, char: ch });
      i++;
      continue;
    }
    if (ch === ']' || ch === '}') {
      const expected = ch === ']' ? '[' : '{';
      const last = bracketStack[bracketStack.length - 1];
      if (!last || last.char !== expected) {
        diagnostics.push({
          from: i,
          to: i + 1,
          severity: 'error',
          message: `Unmatched closing ${ch === ']' ? 'bracket' : 'brace'}`,
        });
      } else {
        bracketStack.pop();
      }
      i++;
      continue;
    }

    i++;
  }

  // Report unmatched opening delimiters
  for (const pos of parenStack) {
    diagnostics.push({
      from: pos,
      to: pos + 1,
      severity: 'error',
      message: 'Unmatched opening parenthesis',
    });
  }
  for (const { pos, char } of bracketStack) {
    diagnostics.push({
      from: pos,
      to: pos + 1,
      severity: 'error',
      message: `Unmatched opening ${char === '[' ? 'bracket' : 'brace'}`,
    });
  }

  // Token-level checks: split on whitespace (outside quotes) and check patterns
  const tokens = tokenize(doc);

  for (let t = 0; t < tokens.length; t++) {
    const token = tokens[t];
    const word = doc.slice(token.from, token.to);

    // Empty field value: "field:" followed by nothing or a boolean operator
    if (word.endsWith(':') && word.length > 1) {
      const next = tokens[t + 1];
      if (
        !next ||
        BOOLEAN_OPERATORS.has(doc.slice(next.from, next.to)) ||
        doc.slice(next.from, next.to) === ')' ||
        doc.slice(next.from, next.to) === ''
      ) {
        diagnostics.push({
          from: token.from,
          to: token.to,
          severity: 'warning',
          message: 'Empty field value',
        });
      }
    }

    // Dangling boolean operator at start or end
    if (BOOLEAN_OPERATORS.has(word)) {
      if (t === 0) {
        diagnostics.push({
          from: token.from,
          to: token.to,
          severity: 'warning',
          message: `Dangling operator "${word}" at start of query`,
        });
      }
      if (t === tokens.length - 1) {
        diagnostics.push({
          from: token.from,
          to: token.to,
          severity: 'warning',
          message: `Dangling operator "${word}" at end of query`,
        });
      }
    }

    // Invalid boost/proximity: ^ or ~ not followed by a number
    if (/^[~^]$/.test(word)) {
      diagnostics.push({
        from: token.from,
        to: token.to,
        severity: 'warning',
        message: `"${word}" should be followed by a number`,
      });
    }

    // Missing operator between two expressions
    // "field:" followed by a value is a single field:value pair, not two expressions.
    // Only warn when two complete expressions appear without AND/OR/NOT between them.
    if (t > 0) {
      const prev = tokens[t - 1];
      const prevWord = doc.slice(prev.from, prev.to);

      // Previous token ends with ":" → current token is its value, not a separate expression
      if (prevWord.endsWith(':')) continue;

      const NON_EXPR_END = new Set([
        '(',
        '[',
        '{',
        '&&',
        '||',
        ...BOOLEAN_OPERATORS,
      ]);
      const NON_EXPR_START = new Set([
        ')',
        ']',
        '}',
        '&&',
        '||',
        ...BOOLEAN_OPERATORS,
      ]);

      if (!NON_EXPR_END.has(prevWord) && !NON_EXPR_START.has(word)) {
        diagnostics.push({
          from: prev.to,
          to: token.from,
          severity: 'warning',
          message: 'Missing operator between expressions (AND, OR)',
        });
      }
    }
  }

  return diagnostics;
}

interface Token {
  from: number;
  to: number;
}

function tokenize(doc: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < doc.length) {
    // Skip whitespace
    if (/\s/.test(doc[i])) {
      i++;
      continue;
    }

    const start = i;

    // Quoted string — treat as single token
    if (doc[i] === '"') {
      i++;
      while (i < doc.length) {
        if (doc[i] === '\\') {
          i += 2;
          continue;
        }
        if (doc[i] === '"') {
          i++;
          break;
        }
        i++;
      }
      tokens.push({ from: start, to: i });
      continue;
    }

    // Regex — treat as single token
    if (doc[i] === '/') {
      i++;
      while (i < doc.length) {
        if (doc[i] === '\\') {
          i += 2;
          continue;
        }
        if (doc[i] === '/') {
          i++;
          break;
        }
        i++;
      }
      tokens.push({ from: start, to: i });
      continue;
    }

    // Single-char delimiters
    if ('()[]{}'.includes(doc[i])) {
      tokens.push({ from: start, to: i + 1 });
      i++;
      continue;
    }

    // Word token (including field:value as one token)
    while (i < doc.length && !/[\s()[\]{}]/.test(doc[i])) {
      if (doc[i] === '"') break;
      i++;
    }
    if (i > start) {
      tokens.push({ from: start, to: i });
    }
  }

  return tokens;
}

export function luceneLinter(
  onResults?: (diagnostics: Diagnostic[]) => void,
): Extension {
  return [
    linter(
      (view) => {
        const doc = view.state.doc.toString();
        if (!doc.trim()) return [];
        const diagnostics = lintLucene(doc);
        onResults?.(diagnostics);
        return diagnostics;
      },
      { delay: 300 },
    ),
  ];
}
