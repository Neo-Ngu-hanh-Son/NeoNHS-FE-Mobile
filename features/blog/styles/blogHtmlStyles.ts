import {
  cssRulesFromSpecs,
  defaultTableStylesSpecs,
  TableStyleSpecs,
} from '@native-html/table-plugin';
import { Platform } from 'react-native';
import type { MixedStyleDeclaration } from 'react-native-render-html';

/**
 * Base style applied to all text
 */
export const baseStyle: MixedStyleDeclaration = {
  fontSize: 16,
  lineHeight: 26,
  color: '#1e293b',
};

/**
 * Styles for HTML tags (tag name → React Native style)
 */
export const tagsStyles: Record<string, MixedStyleDeclaration> = {
  h1: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 20,
    marginBottom: 12,
    lineHeight: 38,
  },
  h2: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 18,
    marginBottom: 10,
    lineHeight: 34,
  },
  h3: {
    fontSize: 21,
    fontWeight: '600',
    color: '#334155',
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 30,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginTop: 14,
    marginBottom: 6,
    lineHeight: 28,
  },
  h5: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
    marginBottom: 4,
    lineHeight: 26,
  },

  p: {
    marginTop: 0,
    marginBottom: 8,
  },

  blockquote: {
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#137fec',
    backgroundColor: '#f0f7ff',
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 26,
  },

  ul: {
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 22,
  },
  ol: {
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 22,
  },
  li: {
    marginTop: 4,
    marginBottom: 4,
    lineHeight: 26,
  },

  a: {
    color: '#137fec',
    textDecorationLine: 'underline',
  },

  img: {
    width: '100%',
    marginVertical: 16,
    alignSelf: 'center',
  },
};

/**
 * Styles keyed by HTML class names
 */
export const classesStyles: Record<string, MixedStyleDeclaration> = {
  // Headings
  'blog-editor-h1': tagsStyles.h1,
  'blog-editor-h2': tagsStyles.h2,
  'blog-editor-h3': tagsStyles.h3,
  'blog-editor-h4': tagsStyles.h4,
  'blog-editor-h5': tagsStyles.h5,

  // Paragraph
  'blog-editor-paragraph': {
    marginTop: 0,
    marginBottom: 8,
  },

  // Quote
  'blog-editor-quote': tagsStyles.blockquote,

  // Lists
  'blog-editor-list-ol': {
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 22,
  },
  'blog-editor-list-ul': {
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 22,
  },
  'blog-editor-listitem': tagsStyles.li,

  // Link
  'blog-editor-link': {
    color: '#137fec',
    textDecorationLine: 'underline',
  },

  // Inline code
  'blog-editor-text-code': {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 14,
    backgroundColor: '#f1f5f9',
    color: '#e11d48',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },

  // Code blocks
  'blog-editor-code': {
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 14,
    lineHeight: 22,
  },

  // Image
  'blog-editor-image': tagsStyles.img,

  // Text-enhancing classes
  'blog-editor-text-bold': { fontWeight: '700' },
  'blog-editor-text-italic': { fontStyle: 'italic' },
  'blog-editor-text-underline': { textDecorationLine: 'underline' },
  'blog-editor-text-strikethrough': { textDecorationLine: 'line-through' },
};

export const cleanTableSpecs: TableStyleSpecs = {
  selectableText: true,

  fitContainerWidth: true,
  fitContainerHeight: false,

  cellPaddingEm: 0.75,

  fontSizePx: 14,
  fontFamily: 'System',

  rowsBorderWidthPx: 1,
  columnsBorderWidthPx: 1,

  outerBorderWidthPx: 1,
  outerBorderColor: '#e2e8f0',

  tdBorderColor: '#e2e8f0',
  thBorderColor: '#e2e8f0',

  linkColor: '#137fec',

  /* Header styling */
  thOddBackground: '#f8fafc',
  thOddColor: '#1e293b',

  thEvenBackground: '#f8fafc',
  thEvenColor: '#1e293b',

  /* Zebra striping */
  trOddBackground: '#ffffff',
  trOddColor: '#1e293b',

  trEvenBackground: '#f8fafc',
  trEvenColor: '#1e293b',
};

export const tableCssRules =
  cssRulesFromSpecs(defaultTableStylesSpecs) +
  `
table {
  width: 100%;
  margin-top: 16px;
  margin-bottom: 16px;
}

th {
  padding: 10px 12px;
  background-color: #f8fafc;
  border-width: 1px;
  border-color: #e2e8f0;
  border-style: solid;
  font-weight: 700;
  color: #334155;
  text-align: left;
}

td {
  padding: 10px 12px;
  border-width: 1px;
  border-color: #e2e8f0;
  border-style: solid;
  color: #1e293b;
}
`;
