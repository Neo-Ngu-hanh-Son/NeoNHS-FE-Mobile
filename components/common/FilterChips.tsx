import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";

export interface FilterChipsProps<T> {
  data: T[];
  selectedId: string | null;
  onSelectedId: (id: string | null) => void;
  getLabel: (item: T) => string;
  getId: (item: T) => string;
  getColor?: (item: T) => string;
  showAll?: boolean;
  allLabel?: string;
  containerClassName?: string;
}

/**
 * A highly reusable, generic filter chip carousel for React Native.
 * Supports custom data structures, dynamic coloring, and "All" selection logic.
 * * @template T - The type of data in the provided array.
 * * @param {T[]} props.data - The array of items to render as chips.
 * @param {string | null} props.selectedId - The ID of the currently active chip. Pass `null` for the "All" state.
 * @param {(id: string | null) => void} props.onSelectedId - Callback triggered when a chip is pressed.
 * @param {(item: T) => string} props.getId - Function to extract a unique string ID from an item.
 * @param {(item: T) => string} props.getLabel - Function to extract the display text from an item.
 * @param {(item: T) => string} [props.getColor] - Optional function to return a custom hex/color string for each chip's active state.
 * @param {boolean} [props.showAll=true] - Whether to display the "All" reset chip at the beginning.
 * @param {string} [props.allLabel="All"] - The display text for the "All" chip.
 * @param {string} [props.containerClassName="py-3"] - Tailwind (NativeWind) classes for the outer wrapper.
 * * @example
 * // Standard Usage (Single Theme Color)
 * <FilterChips
 * data={attractions}
 * selectedId={selectedId}
 * onSelectedId={setSelectedId}
 * getId={(item) => item.id}
 * getLabel={(item) => item.name}
 * />
 * * @example
 * // Advanced Usage (Individual Colors & Hidden "All" Option)
 * <FilterChips
 * data={categories}
 * selectedId={activeCat}
 * onSelectedId={setActiveCat}
 * showAll={false}
 * getId={(c) => c.slug}
 * getLabel={(c) => c.displayName}
 * getColor={(c) => c.brandColor} // e.g., Returns '#FF5733'
 * />
 */
export default function FilterChips<T>({
  data,
  selectedId,
  onSelectedId,
  getLabel,
  getId,
  getColor,
  showAll = true,
  allLabel = "All",
  containerClassName = "py-3",
}: FilterChipsProps<T>) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const renderChip = (
    label: string,
    isSelected: boolean,
    onPress: () => void,
    customColor?: string
  ) => {
    const activeColor = customColor || theme.primary;

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className={`px-5 py-2 rounded-full border`}
        style={{
          backgroundColor: isSelected ? activeColor : "transparent",
          borderColor: isSelected ? activeColor : theme.border,
        }}
      >
        <Text
          className="text-xs font-bold"
          style={{ color: isSelected ? "#fff" : theme.mutedForeground }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className={containerClassName}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {showAll &&
          renderChip(allLabel, selectedId === null, () => onSelectedId(null))}

        {data?.map((item) => {
          const id = getId(item);
          const label = getLabel(item);
          const color = getColor?.(item);
          const isSelected = selectedId === id;

          return (
            <React.Fragment key={id}>
              {renderChip(label, isSelected, () => onSelectedId(id), color)}
            </React.Fragment>
          );
        })}
      </ScrollView>
    </View>
  );
}