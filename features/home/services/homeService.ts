import { blogService } from '@/features/blog';
import { apiClient } from '@/services/api';
import { BLOG_CATEGORY_SLUG_CONST } from '../homeScreenConst';
import eventService from '@/features/event/services/eventService';
import { EventStatus } from '@/features/event/types';
import discoverService from '@/features/discover/services/discoverServices';

export const homeService = {
  getFeatured: async () => {
    return await blogService.getBlogs({
      isFeatured: true,
    });
  },
  getKnowBeforeYouGo: async () => {
    return await blogService.getBlogs({
      size: 5,
      page: 0,
      sortBy: 'createdAt',
      sortDir: 'desc',
      categorySlug: BLOG_CATEGORY_SLUG_CONST.KNOW_BEFORE_YOU_GO,
    });
  },
  getAboutNHS: async () => {
    return await blogService.getBlogs({
      size: 5,
      page: 0,
      sortBy: 'createdAt',
      sortDir: 'desc',
      categorySlug: BLOG_CATEGORY_SLUG_CONST.ABOUT_NHS,
    });
  },
  getBlogs: async () => {
    return await blogService.getBlogs({
      size: 5,
      page: 0,
      sortBy: 'createdAt',
      sortDir: 'desc',
    });
  },
  getDestinations: async () => {
    return await discoverService.getAllPoints();
  },
  getUpcomingEvents: async () => {
    return await eventService.getEvents({
      page: 0,
      size: 5,
      // sortBy: 'startDate', BROTHER MAN THIS SHIT DOES NOT EXIST IN SORT BY IN BACKEND LOL WHAT THE FRICK
      sortDir: 'desc',
    });
  },
};
