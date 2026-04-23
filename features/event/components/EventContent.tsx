import { useWindowDimensions, Linking, View, Modal, Pressable, TouchableOpacity } from 'react-native';
import RenderHTML, { CustomBlockRenderer } from 'react-native-render-html';
import TableRenderer, { cssRulesFromSpecs, tableModel } from '@native-html/table-plugin';
import { getBlogHtmlStyleSet } from '@/features/blog/styles/blogHtmlStyles';
import { logger } from '@/utils/logger';
import WebView from 'react-native-webview';
import { useMemo, useState } from 'react';
import { SmartImage } from '@/components/ui/smart-image';
import { useTheme } from '@/app/providers/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';

interface EventContentProps {
  html: string;
}

const MAX_COLLAPSED_HEIGHT = 260; // Approx 10 lines

export default function EventContent({ html }: EventContentProps) {
  const { width, height } = useWindowDimensions();
  const contentWidth = width - 40; // Padding from parent
  const { isDarkColorScheme, getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  const htmlStyleSet = useMemo(() => {
    return getBlogHtmlStyleSet(isDarkColorScheme);
  }, [isDarkColorScheme]);

  const handleLinkPress = (_event: unknown, href: string) => {
    Linking.openURL(href).catch((err) => logger.error('[EventContent] Failed to open URL:', err));
  };

  const imageRenderer: CustomBlockRenderer = function ImageRenderer({ tnode }) {
    const { src, width: attrWidth, height: attrHeight } = tnode.attributes;

    const imgW = attrWidth ? parseFloat(attrWidth) : 0;
    const imgH = attrHeight ? parseFloat(attrHeight) : 0;
    const computedHeight = imgW > 0 && imgH > 0 ? (imgH / imgW) * contentWidth : contentWidth * 0.5625;

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

  const shouldTruncate = contentHeight > MAX_COLLAPSED_HEIGHT;

  return (
    <>
      <View style={{ overflow: 'hidden', maxHeight: isExpanded ? undefined : MAX_COLLAPSED_HEIGHT }}>
        <View
          onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
        >
          <RenderHTML
            contentWidth={contentWidth}
            source={{ html }}
            baseStyle={htmlStyleSet.baseStyle}
            tagsStyles={htmlStyleSet.tagsStyles}
            classesStyles={htmlStyleSet.classesStyles}
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
                cssRules: cssRulesFromSpecs(htmlStyleSet.tableSpecs),
                enableExperimentalHorizontalScrolling: true,
              },
            }}
            WebView={WebView}
          />
        </View>

        {!isExpanded && shouldTruncate && (
          <LinearGradient
            colors={['transparent', theme.background]}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
            }}
          />
        )}
      </View>

      {shouldTruncate && (
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          className="flex-row items-center justify-center py-2 mt-2 gap-1"
        >
          <Text className="text-sm font-bold" style={{ color: theme.primary }}>
            {isExpanded ? "Thu gọn" : "Xem thêm"}
          </Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={theme.primary}
          />
        </TouchableOpacity>
      )}

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
