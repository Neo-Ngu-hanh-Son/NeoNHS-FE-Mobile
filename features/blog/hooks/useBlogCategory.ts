import { useQuery } from "@tanstack/react-query";
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
  return useQuery({
    queryKey: ["blog-category", page, size, sortBy, sortDir, name],
    queryFn: () => blogService.getBlogCategories({ page, size, sortBy, sortDir, name }),
  })
}