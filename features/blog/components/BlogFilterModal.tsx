import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, TouchableWithoutFeedback, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useModal } from '@/app/providers/ModalProvider';
import {
  BLOG_DEFAULT_FILTERS,
  BLOG_SORT_OPTIONS,
  BLOG_STATUS_OPTIONS,
  BLOG_TAG_OPTIONS,
  type BlogFilters,
} from '@/features/blog/types';

interface BlogFilterModalProps {
  visible: boolean;
  initialFilters: BlogFilters;
  onApply: (filters: BlogFilters) => void;
  onClose: () => void;
}

export default function BlogFilterModal({
  visible,
  initialFilters,
  onApply,
  onClose,
}: BlogFilterModalProps) {
  const { confirm } = useModal();
  const [draftFilters, setDraftFilters] = useState<BlogFilters>(initialFilters);

  useEffect(() => {
    if (visible) {
      setDraftFilters(initialFilters);
    }
  }, [initialFilters, visible]);

  const selectedSortLabel = useMemo(() => {
    const selected = BLOG_SORT_OPTIONS.find(
      (option) => option.sortBy === draftFilters.sortBy && option.sortDir === draftFilters.sortDir
    );

    return selected?.label ?? 'Custom';
  }, [draftFilters.sortBy, draftFilters.sortDir]);

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/35">
          <TouchableWithoutFeedback>
            <View className="max-h-[80%] rounded-t-3xl bg-background px-4 pb-8 pt-4">
              <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-muted" />
              <Text className="text-lg font-semibold text-foreground">Filters</Text>

              <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
                <Text className="mb-2 text-sm font-semibold text-foreground">Status</Text>
                <View className="mb-4 flex-row flex-wrap gap-2">
                  {BLOG_STATUS_OPTIONS.map((option) => {
                    const isSelected = draftFilters.status === option.value;
                    return (
                      <Pressable
                        key={option.label}
                        className={`rounded-full border px-3 py-1.5 ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                        onPress={() =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            status: option.value,
                          }))
                        }>
                        <Text
                          className={`text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text className="mb-2 text-sm font-semibold text-foreground">Tags</Text>
                <View className="mb-4 flex-row flex-wrap gap-2">
                  {BLOG_TAG_OPTIONS.map((tag) => {
                    const isSelected = draftFilters.tags.includes(tag);
                    return (
                      <Pressable
                        key={tag}
                        className={`rounded-full border px-3 py-1.5 ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                        onPress={() =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            tags: isSelected
                              ? prev.tags.filter((value) => value !== tag)
                              : [...prev.tags, tag],
                          }))
                        }>
                        <Text
                          className={`text-sm capitalize ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {tag}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text className="mb-2 text-sm font-semibold text-foreground">Sort</Text>
                <View className="mb-2 flex-row flex-wrap gap-2">
                  {BLOG_SORT_OPTIONS.map((option) => {
                    const isSelected =
                      draftFilters.sortBy === option.sortBy &&
                      draftFilters.sortDir === option.sortDir;

                    return (
                      <Pressable
                        key={option.label}
                        className={`rounded-full border px-3 py-1.5 ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                        onPress={() =>
                          setDraftFilters((prev) => ({
                            ...prev,
                            sortBy: option.sortBy,
                            sortDir: option.sortDir,
                          }))
                        }>
                        <Text
                          className={`text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text className="mb-4 text-xs text-muted-foreground">
                  Selected: {selectedSortLabel}
                </Text>
              </ScrollView>

              <View className="mt-2 flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onPress={async () => {
                    const shouldReset = await confirm(
                      'Reset filters',
                      'Clear all selected filters?'
                    );
                    if (shouldReset) {
                      setDraftFilters(BLOG_DEFAULT_FILTERS);
                    }
                  }}>
                  <Text>Reset</Text>
                </Button>
                <Button variant="outline" className="flex-1" onPress={onClose}>
                  <Text>Cancel</Text>
                </Button>
                <Button
                  className="flex-1"
                  onPress={() => {
                    onApply(draftFilters);
                    onClose();
                  }}>
                  <Text>Apply</Text>
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
