import type { StringStream } from '@codemirror/language';
import { LanguageSupport, StreamLanguage } from '@codemirror/language';

const BOOLEAN_OPERATORS = new Set(['AND', 'OR', 'NOT', 'TO']);

interface LuceneState {
  inString: boolean;
  inRegex: boolean;
}

const luceneStreamParser = {
  startState(): LuceneState {
    return { inString: false, inRegex: false };
  },

  token(stream: StringStream, state: LuceneState): string | null {
    // Continue quoted string
    if (state.inString) {
      while (!stream.eol()) {
        const ch = stream.next();
        if (ch === '\\') {
          stream.next(); // skip escaped char
        } else if (ch === '"') {
          state.inString = false;
          return 'string';
        }
      }
      return 'string';
    }

    // Continue regex
    if (state.inRegex) {
      while (!stream.eol()) {
        const ch = stream.next();
        if (ch === '\\') {
          stream.next(); // skip escaped char
        } else if (ch === '/') {
          state.inRegex = false;
          return 'regexp';
        }
      }
      return 'regexp';
    }

    // Skip whitespace
    if (stream.eatSpace()) return null;

    const ch = stream.peek();

    // Quoted string start
    if (ch === '"') {
      stream.next();
      state.inString = true;
      while (!stream.eol()) {
        const c = stream.next();
        if (c === '\\') {
          stream.next();
        } else if (c === '"') {
          state.inString = false;
          return 'string';
        }
      }
      return 'string';
    }

    // Regex start
    if (ch === '/') {
      stream.next();
      state.inRegex = true;
      while (!stream.eol()) {
        const c = stream.next();
        if (c === '\\') {
          stream.next();
        } else if (c === '/') {
          state.inRegex = false;
          return 'regexp';
        }
      }
      return 'regexp';
    }

    // Range brackets
    if (ch === '[' || ch === ']' || ch === '{' || ch === '}') {
      stream.next();
      return 'bracket';
    }

    // Parentheses
    if (ch === '(' || ch === ')') {
      stream.next();
      return 'paren';
    }

    // Wildcards
    if (ch === '*' || ch === '?') {
      stream.next();
      return 'special(string)';
    }

    // && and || operators
    if (ch === '&' && stream.match('&&', false)) {
      stream.next();
      stream.next();
      return 'keyword';
    }
    if (ch === '|' && stream.match('||', false)) {
      stream.next();
      stream.next();
      return 'keyword';
    }

    // Boost/proximity: ^ or ~ followed by optional number
    if (ch === '^' || ch === '~') {
      stream.next();
      stream.match(/^\d+(\.\d+)?/);
      return 'number';
    }

    // Word-like tokens: field names, keywords, plain terms, numbers
    if (stream.match(/^[^\s"/[\]{}()*?^~&|\\:]+/)) {
      const word = stream.current();

      // Check if followed by colon (field name)
      if (stream.peek() === ':') {
        stream.next(); // consume the colon
        return 'propertyName';
      }

      // Boolean operators
      if (BOOLEAN_OPERATORS.has(word)) {
        return 'keyword';
      }

      // Numbers
      if (/^-?\d+(\.\d+)?$/.test(word)) {
        return 'number';
      }

      return 'name';
    }

    // Colon by itself (e.g. after consuming field name in a previous pass)
    if (ch === ':') {
      stream.next();
      return 'propertyName';
    }

    // Fallback: consume one character
    stream.next();
    return null;
  },
};

const luceneStreamLanguage = StreamLanguage.define(luceneStreamParser);

export function luceneLanguage() {
  return new LanguageSupport(luceneStreamLanguage);
}
