import { useState, useEffect, useCallback } from "react";
import { blogService } from "@/features/blog/services/blogService";
import { logger } from "@/utils/logger";
import type { BlogResponse } from "@/features/blog/types";

/**
 * Fetches the latest published blogs for display on the home screen.
 * Keeps it simple: first page, small size, status=PUBLISHED, newest first.
 */
export function useHomeBlogs(size = 6) {
  const [blogs, setBlogs] = useState<BlogResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await blogService.getBlogs({
        page: 0,
        size,
        status: "PUBLISHED",
        sortBy: "publishedAt",
        sortDir: "desc",
      });
      setBlogs(response.content ?? []);
    } catch (err) {
      logger.error("[useHomeBlogs] Failed to fetch blogs:", err);
    } finally {
      setLoading(false);
    }
  }, [size]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { blogs, loading, refetch: fetch };
}
