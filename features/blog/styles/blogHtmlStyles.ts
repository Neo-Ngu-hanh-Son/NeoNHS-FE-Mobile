import { cssRulesFromSpecs, defaultTableStylesSpecs, TableStyleSpecs } from '@native-html/table-plugin';
import { Platform } from 'react-native';
import type { MixedStyleDeclaration } from 'react-native-render-html';
import { THEME } from '@/lib/theme';

type BlogHtmlPalette = {
  textPrimary: string;
  textSecondary: string;
  heading1: string;
  heading2: string;
  heading3: string;
  heading4: string;
  heading5: string;
  link: string;
  quoteBorder: string;
  quoteBackground: string;
  inlineCodeBackground: string;
  inlineCodeText: string;
  codeBackground: string;
  codeText: string;
  tableBorder: string;
  tableHeaderBackground: string;
  tableHeaderText: string;
  tableRowOddBackground: string;
  tableRowEvenBackground: string;
  tableRowText: string;
};

const lightPalette: BlogHtmlPalette = {
  textPrimary: '#1e293b',
  textSecondary: '#334155',
  heading1: '#0f172a',
  heading2: '#1e293b',
  heading3: '#334155',
  heading4: '#475569',
  heading5: '#64748b',
  link: '#137fec',
  quoteBorder: '#137fec',
  quoteBackground: '#f0f7ff',
  inlineCodeBackground: '#f1f5f9',
  inlineCodeText: '#e11d48',
  codeBackground: '#1e293b',
  codeText: '#f8fafc',
  tableBorder: '#e2e8f0',
  tableHeaderBackground: '#f8fafc',
  tableHeaderText: '#334155',
  tableRowOddBackground: '#ffffff',
  tableRowEvenBackground: '#f8fafc',
  tableRowText: '#1e293b',
};

const darkPalette: BlogHtmlPalette = {
  textPrimary: THEME.dark.foreground,
  textSecondary: '#cbd5e1',
  heading1: '#f8fafc',
  heading2: '#f1f5f9',
  heading3: '#e2e8f0',
  heading4: '#cbd5e1',
  heading5: '#94a3b8',
  link: '#60a5fa',
  quoteBorder: '#60a5fa',
  quoteBackground: '#172136',
  inlineCodeBackground: '#1e293b',
  inlineCodeText: '#fda4af',
  codeBackground: '#020617',
  codeText: '#e2e8f0',
  tableBorder: '#334155',
  tableHeaderBackground: '#1e293b',
  tableHeaderText: '#f1f5f9',
  tableRowOddBackground: '#0f172a',
  tableRowEvenBackground: '#111827',
  tableRowText: '#e2e8f0',
};

type BlogHtmlStyleSet = {
  baseStyle: MixedStyleDeclaration;
  tagsStyles: Record<string, MixedStyleDeclaration>;
  classesStyles: Record<string, MixedStyleDeclaration>;
  tableSpecs: TableStyleSpecs;
};

export const getBlogHtmlStyleSet = (isDarkMode: boolean): BlogHtmlStyleSet => {
  const palette = isDarkMode ? darkPalette : lightPalette;

  const tagsStyles: Record<string, MixedStyleDeclaration> = {
    h1: {
      fontSize: 32,
      fontWeight: '800',
      color: palette.heading1,
      marginTop: 20,
      marginBottom: 12,
      lineHeight: 38,
    },
    h2: {
      fontSize: 26,
      fontWeight: '700',
      color: palette.heading2,
      marginTop: 18,
      marginBottom: 10,
      lineHeight: 34,
    },
    h3: {
      fontSize: 21,
      fontWeight: '600',
      color: palette.heading3,
      marginTop: 16,
      marginBottom: 8,
      lineHeight: 30,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
      color: palette.heading4,
      marginTop: 14,
      marginBottom: 6,
      lineHeight: 28,
    },
    h5: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.heading5,
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
      borderLeftColor: palette.quoteBorder,
      backgroundColor: palette.quoteBackground,
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
      color: palette.link,
      textDecorationLine: 'underline',
    },

    img: {
      width: '100%',
      marginVertical: 16,
      alignSelf: 'center',
    },
  };

  const classesStyles: Record<string, MixedStyleDeclaration> = {
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
      color: palette.link,
      textDecorationLine: 'underline',
    },

    // Inline code
    'blog-editor-text-code': {
      fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
      fontSize: 14,
      backgroundColor: palette.inlineCodeBackground,
      color: palette.inlineCodeText,
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
      backgroundColor: palette.codeBackground,
      borderRadius: 10,
      fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
      fontSize: 14,
      lineHeight: 22,
      color: palette.codeText,
    },

    // Image
    'blog-editor-image': tagsStyles.img,

    // Text-enhancing classes
    'blog-editor-text-bold': { fontWeight: '700' },
    'blog-editor-text-italic': { fontStyle: 'italic' },
    'blog-editor-text-underline': { textDecorationLine: 'underline' },
    'blog-editor-text-strikethrough': { textDecorationLine: 'line-through' },
  };

  const tableSpecs: TableStyleSpecs = {
    selectableText: true,
    fitContainerWidth: true,
    fitContainerHeight: false,
    cellPaddingEm: 0.75,
    fontSizePx: 14,
    fontFamily: 'System',
    rowsBorderWidthPx: 1,
    columnsBorderWidthPx: 1,
    outerBorderWidthPx: 1,
    outerBorderColor: palette.tableBorder,
    tdBorderColor: palette.tableBorder,
    thBorderColor: palette.tableBorder,
    linkColor: palette.link,
    thOddBackground: palette.tableHeaderBackground,
    thOddColor: palette.tableHeaderText,
    thEvenBackground: palette.tableHeaderBackground,
    thEvenColor: palette.tableHeaderText,
    trOddBackground: palette.tableRowOddBackground,
    trOddColor: palette.tableRowText,
    trEvenBackground: palette.tableRowEvenBackground,
    trEvenColor: palette.tableRowText,
  };

  return {
    baseStyle: {
      fontSize: 16,
      lineHeight: 26,
      color: palette.textPrimary,
    },
    tagsStyles,
    classesStyles,
    tableSpecs,
  };
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
