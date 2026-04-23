import { useWindowDimensions, Linking, View, Modal, Pressable } from 'react-native';
import RenderHTML, { CustomBlockRenderer } from 'react-native-render-html';
import TableRenderer, { cssRulesFromSpecs, tableModel } from '@native-html/table-plugin';
import { getBlogHtmlStyleSet } from '../styles/blogHtmlStyles';
import { logger } from '@/utils/logger';
import WebView from 'react-native-webview';
import { useMemo, useState } from 'react';
import { SmartImage } from '@/components/ui/smart-image';
import { useTheme } from '@/app/providers/ThemeProvider';

interface BlogContentProps {
  html: string;
}

export default function BlogContent({ html }: BlogContentProps) {
  const { width, height } = useWindowDimensions();
  const contentWidth = width - 100;
  const { isDarkColorScheme } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const blogHtmlStyleSet = useMemo(() => {
    return getBlogHtmlStyleSet(isDarkColorScheme);
  }, [isDarkColorScheme]);

  const handleLinkPress = (_event: unknown, href: string) => {
    Linking.openURL(href).catch((err) => logger.error('[BlogContent] Failed to open URL:', err));
  };

  const imageRenderer: CustomBlockRenderer = function ImageRenderer({ tnode }) {
    const { src, width: attrWidth, height: attrHeight } = tnode.attributes;

    // Compute a proper height from the img's intrinsic dimensions,
    // so the image is never rendered with 0-height (blank + empty space).
    const imgW = attrWidth ? parseFloat(attrWidth) : 0;
    const imgH = attrHeight ? parseFloat(attrHeight) : 0;
    const computedHeight = imgW > 0 && imgH > 0 ? (imgH / imgW) * contentWidth : contentWidth * 0.5625; // fallback to 16:9 ratio

    const onPress = () => {
      if (!src) return;
      setSelectedImage(src);
      setModalVisible(true);
    };

    return (
      <Pressable onPress={onPress} style={{ marginVertical: 12 }}>
        <SmartImage
          uri={src}
          style={{
            width: contentWidth,
            height: computedHeight,
            borderRadius: 8,
            resizeMode: 'cover',
            alignSelf: 'center',
          }}
        />
      </Pressable>
    );
  };

  return (
    <>
      <View className="px-4">
        <RenderHTML
          contentWidth={contentWidth}
          source={{ html }}
          baseStyle={blogHtmlStyleSet.baseStyle}
          tagsStyles={blogHtmlStyleSet.tagsStyles}
          classesStyles={blogHtmlStyleSet.classesStyles}
          enableExperimentalMarginCollapsing
          enableCSSInlineProcessing
          renderers={{
            table: TableRenderer,
            img: imageRenderer,
          }}
          customHTMLElementModels={{
            table: tableModel,
          }}
          renderersProps={{
            a: { onPress: handleLinkPress },
            table: {
              cssRules: cssRulesFromSpecs(blogHtmlStyleSet.tableSpecs),
              enableExperimentalHorizontalScrolling: true,
            },
          }}
          WebView={WebView}
        />
      </View>

      {/* Fullscreen Image Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable
          onPress={() => setModalVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.85)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {selectedImage && (
            <SmartImage
              uri={selectedImage}
              style={{
                width: width,
                height: height,
                resizeMode: 'contain',
              }}
            />
          )}
        </Pressable>
      </Modal>
    </>
  );
}
