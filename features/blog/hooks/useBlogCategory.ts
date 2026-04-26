import { useTranslatedQuery } from "@/hooks/useTranslatedQuery";
import { blogService } from "../services/blogService";

export function useBlogCategory({
  page = 0,
  size = 10,
  sortBy = "createdAt",
  sortDir = "desc",
  name,
}: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  name?: string
}) {
  return useTranslatedQuery({
    queryKey: ["blog-category", page, size, sortBy, sortDir, name],
    queryFn: () => blogService.getBlogCategories({ page, size, sortBy, sortDir, name }),
    extractTranslatableFields: (data) => {
      const fields: Record<string, string> = {};
      data.content?.forEach((category: any) => {
        if (category.name) fields[`category_${category.id}_name`] = category.name;
        if (category.description) fields[`category_${category.id}_desc`] = category.description;
      });
      return fields;
    },
    mergeTranslatedFields: (data, translated) => {
      return {
        ...data,
        content: data.content?.map((category: any) => ({
          ...category,
          name: translated[`category_${category.id}_name`] || category.name,
          description: translated[`category_${category.id}_desc`] || category.description,
        }))
      };
    }
  });
}