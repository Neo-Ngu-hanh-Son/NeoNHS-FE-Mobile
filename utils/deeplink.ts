import { Share } from 'react-native';

const BASE_URL = __DEV__ ? 'neonhs://' : 'https://www.neonhs.id.vn';

export function buildPointLink(pointId: number | string) {
  return `${BASE_URL}/point/${pointId}`;
}

export function buildBlogLink(blogId: number | string) {
  return `${BASE_URL}/blog/${blogId}`;
}

export function buildEventLink(eventId: number | string) {
  return `${BASE_URL}/event/${eventId}`;
}

export function buildWorkshopLink(workshopId: number | string) {
  return `${BASE_URL}/workshop/${workshopId}`;
}

export async function shareLink(message: string, url: string) {
  try {
    await Share.share({
      message,
      url,
      title: 'Share this via NeoNHS',
    });
  } catch (error) {
    console.log(error);
  }
}
