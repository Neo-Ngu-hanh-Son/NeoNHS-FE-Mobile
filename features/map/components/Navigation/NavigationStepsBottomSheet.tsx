import React, { forwardRef, useCallback, useMemo, useRef } from 'react';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Step } from '../../types';
import type { BottomSheetFlatListMethods } from '@gorhom/bottom-sheet';

type NavigationStepsBottomSheetProps = {
  steps: Step[];
  currentStepIndex: number;
  onChange?: (index: number) => void;
};

const NavigationStepsBottomSheet = forwardRef<BottomSheet, NavigationStepsBottomSheetProps>(
  ({ steps, currentStepIndex, onChange }, ref) => {
    const snapPoints = useMemo(() => ['80%'], []);

    const clampedCurrentStepIndex = useMemo(() => {
      if (steps.length === 0) {
        return -1;
      }
      return Math.min(Math.max(currentStepIndex, 0), steps.length - 1);
    }, [currentStepIndex, steps.length]);

    const listRef = useRef<BottomSheetFlatListMethods>(null);

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
    return (
      <BottomSheet ref={ref} index={-1} snapPoints={snapPoints} enablePanDownToClose>
        <BottomSheetFlatList<Step>
          ref={listRef}
          data={steps}
          keyExtractor={(item: Step, index: number) => `${index}`}
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={10}
          ListHeaderComponent={
            <View className="px-4 pb-3 pt-2">
              <Text className="text-lg font-bold">Route steps</Text>
              <Text className="text-xs text-muted-foreground">Follow these instructions</Text>
            </View>
          }
          ListEmptyComponent={
            <View className="px-4 py-6">
              <Text className="text-sm text-muted-foreground">No step instructions available yet.</Text>
            </View>
          }
          renderItem={renderItem}
        />
      </BottomSheet>
    );
  }
);

NavigationStepsBottomSheet.displayName = 'NavigationStepsBottomSheet';

export default NavigationStepsBottomSheet;
