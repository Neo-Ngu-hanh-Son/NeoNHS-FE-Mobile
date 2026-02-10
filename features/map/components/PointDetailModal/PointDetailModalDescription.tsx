import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { MapPoint } from '../../types';
import { THEME } from '@/lib/theme';
import { useTheme } from '@/app/providers/ThemeProvider';

type PointDetailModalDescriptionProps = {
  point: MapPoint;
};

export default function PointDetailModalDescription({ point }: PointDetailModalDescriptionProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  return (
    <View style={{ marginBottom: 20 }}>
      {point.description && (
        <Text
          style={[styles.description, { color: theme.foreground }]}
          ellipsizeMode="tail"
          numberOfLines={3}>
          Nobisat qui alias, eos, libero, ipsa! Suntamet tempora at ratione culpa sed. Quaetempore
          sunt nobis aut vero nesciunt? Nihilquia id, laborum, vel, ipsum odit.Invel dolor quam,
          ipsum, qui dolores. Sintamet, lorem sint, dolore, sit, neque. Sitodit, velit, nesciunt sit
          natus ratione! Remautem illo nihil illo quasi, ratione.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
});
