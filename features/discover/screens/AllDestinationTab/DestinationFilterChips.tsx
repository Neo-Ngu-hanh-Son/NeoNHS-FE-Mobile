import { useTheme } from "@/app/providers/ThemeProvider";
import { Attraction } from "@/features/map";
import { THEME } from "@/lib/theme";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";


export default function DestinationFilterChips({
  selectedId,
  onSelectedId: setSelectedId,
  attractions,
}: {
  selectedId: string | null;
  onSelectedId: (id: string | null) => void;
  attractions: Attraction[];
}) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <View className="py-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {/* "All" Chip */}
        <TouchableOpacity
          onPress={() => setSelectedId(null)}
          className={`px-5 py-2 rounded-full border ${!selectedId ? 'bg-primary border-primary' : 'bg-transparent border-border'}`}
          style={!selectedId ? { backgroundColor: theme.primary } : { borderColor: theme.border }}
        >
          <Text className={`text-xs font-bold ${!selectedId ? 'text-white' : ''}`} style={{ color: !selectedId ? '#fff' : theme.mutedForeground }}>
            All
          </Text>
        </TouchableOpacity>

        {/* Dynamic Attraction Chips */}
        {attractions?.map((attr) => {
          const isSelected = selectedId === attr.id;
          return (
            <TouchableOpacity
              key={attr.id}
              onPress={() => setSelectedId(attr.id)}
              className={`px-5 py-2 rounded-full border ${isSelected ? 'bg-primary border-primary' : 'bg-transparent border-border'}`}
              style={isSelected ? { backgroundColor: theme.primary } : { borderColor: theme.border }}
            >
              <Text
                className={`text-xs font-bold ${isSelected ? 'text-white' : ''}`}
                style={{ color: isSelected ? '#fff' : theme.mutedForeground }}
              >
                {attr.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}