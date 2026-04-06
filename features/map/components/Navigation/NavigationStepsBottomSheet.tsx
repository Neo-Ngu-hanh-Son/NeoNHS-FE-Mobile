import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { Step } from '../../types';
import type { BottomSheetFlatListMethods } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { logger } from '@/utils/logger';

type NavigationStepsBottomSheetProps = {
  steps: Step[];
  currentStepIndex: number;
  onChange?: (index: number) => void;
};

const NavigationStepsBottomSheet = forwardRef<BottomSheet, NavigationStepsBottomSheetProps>(
  ({ steps, currentStepIndex, onChange }, ref) => {
    const insets = useSafeAreaInsets();
    const [paddingBottom, setPaddingBottom] = useState(insets.bottom);

    const clampedCurrentStepIndex = useMemo(() => {
      if (steps.length === 0) return -1;
      return Math.min(Math.max(currentStepIndex, 0), steps.length - 1);
    }, [currentStepIndex, steps.length]);

    const renderItem = useCallback(
      ({ item, index }: { item: Step; index: number }) => {
        const isCurrentStep = index === clampedCurrentStepIndex;
        const stepDistance = item.localizedValues?.distance?.text;
        const stepDuration = item.localizedValues?.staticDuration?.text;
        const stepInstruction = item.navigationInstruction?.instructions ?? 'Continue';

        return (
          <View
            className={`mx-3 mb-2 rounded-xl border px-3 py-3 ${
              isCurrentStep ? 'border-primary/40 bg-primary/10' : 'border-border/40 bg-background'
            }`}>
            <Text className="text-xs font-semibold text-muted-foreground">Step {index + 1}</Text>
            <Text className="mt-1 text-sm font-medium">{stepInstruction}</Text>
            <Text className="mt-1 text-xs text-muted-foreground">
              {[stepDistance, stepDuration].filter(Boolean).join(' • ') || 'Proceed to next instruction'}
            </Text>
          </View>
        );
      },
      [clampedCurrentStepIndex]
    );

    const keyExtractor = useCallback((_: Step, index: number) => index.toString(), []);

    const ListHeader = useCallback(
      () => (
        <View className="px-4 pb-3 pt-2">
          <Text className="text-lg font-bold">Route steps</Text>
          <Text className="text-xs text-muted-foreground">Follow these instructions</Text>
        </View>
      ),
      []
    );

    const listRef = useRef<BottomSheetFlatListMethods>(null);

    useEffect(() => {
      if (clampedCurrentStepIndex >= 0) {
        listRef.current?.scrollToIndex({
          index: clampedCurrentStepIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }
    }, [clampedCurrentStepIndex]);

    const handleOnIndexChange = useCallback(
      (index: number) => {
        switch (index) {
          case -1:
            setPaddingBottom(insets.bottom);
            break;
          case 0:
            setPaddingBottom(insets.bottom + 600);
            break;
          case 1:
            setPaddingBottom(insets.bottom + 500);
            break;
          case 2:
            setPaddingBottom(insets.bottom + 400);
            break;
          case 3:
            setPaddingBottom(insets.bottom + 0);
            break;
          default:
            setPaddingBottom(insets.bottom);
        }
      },
      [insets.bottom]
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={['25%', '50%', '75%', '80%']}
        enablePanDownToClose
        topInset={insets.top}
        onChange={handleOnIndexChange}
        enableContentPanningGesture={false}
        style={styles.shadowContainer}>
        <BottomSheetFlatList
          ref={listRef}
          data={steps}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: paddingBottom }} // Add extra padding to allow scrolling last items above the bottom sheet handle
          keyboardShouldPersistTaps="handled"
          onScrollToIndexFailed={(info: any) => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
              });
            }, 100);
          }}
        />
      </BottomSheet>
    );
  }
);

NavigationStepsBottomSheet.displayName = 'NavigationStepsBottomSheet';

export default NavigationStepsBottomSheet;

const styles = StyleSheet.create({
  shadowContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
});
