import { parser } from "./syntax.grammar";
import { indentation } from "./indentation";
import { LRLanguage, LanguageSupport } from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";

export const ZwirnLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      styleTags({
        Identifier: t.variableName,
        Number: t.number,
        String: t.string,
        Silence: t.string,
        Punctuation: t.punctuation,
        Command: t.keyword,
        Keyword: t.keyword,
        Equals: t.keyword,
        SingleOp: t.operator,
        MultiOp: t.operator,
        LineComment: t.lineComment,
        "( )": t.paren,
        "[ ]": t.bracket,
        "< >": t.angleBracket,
      }),
    ],
  }),
  languageData: {
    commentTokens: { line: "--" },
    closeBrackets: { brackets: ["(", "[", '"'], before: ')]"' },
  },
});

export function zwirn() {
  return new LanguageSupport(ZwirnLanguage, indentation());
}
