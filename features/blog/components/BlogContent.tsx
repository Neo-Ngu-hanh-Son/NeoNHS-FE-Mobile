import { useWindowDimensions, Linking, View } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { cssRulesFromSpecs, tableModel } from '@native-html/table-plugin';
import TableRenderer from '@native-html/table-plugin';
import {
  baseStyle,
  tagsStyles,
  classesStyles,
  tableCssRules,
  cleanTableSpecs,
} from '../styles/blogHtmlStyles';
import { logger } from '@/utils/logger';
import WebView from 'react-native-webview';

interface BlogContentProps {
  html: string;
}

export default function BlogContent({ html }: BlogContentProps) {
  const { width } = useWindowDimensions();
  const contentWidth = width - 48;

  const handleLinkPress = (_event: unknown, href: string) => {
    Linking.openURL(href).catch((err) => logger.error('[BlogContent] Failed to open URL:', err));
  };

  return (
    <View className="px-4">
      <RenderHTML
        contentWidth={contentWidth}
        source={{ html }}
        baseStyle={baseStyle}
        tagsStyles={tagsStyles}
        classesStyles={classesStyles}
        enableExperimentalMarginCollapsing
        enableCSSInlineProcessing
        renderers={{
          table: TableRenderer,
        }}
        customHTMLElementModels={{
          table: tableModel,
        }}
        renderersProps={{
          a: { onPress: handleLinkPress },
          img: { enableExperimentalPercentWidth: true },
          table: {
            cssRules: cssRulesFromSpecs(cleanTableSpecs),
            enableExperimentalHorizontalScrolling: true,
          },
        }}
        WebView={WebView}
      />
    </View>
  );
}
