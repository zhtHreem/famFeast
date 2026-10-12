import { HttpError } from './http.js';

// Uploads an in-memory image buffer to ImgBB and returns its public URL.
export const uploadImage = async (file) => {
  if (!process.env.IMGBB_API_KEY) {
    throw new HttpError(503, 'Image uploads are not configured on this server.');
  }
  const body = new URLSearchParams({ key: process.env.IMGBB_API_KEY, image: file.buffer.toString('base64') });
  const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.data?.url) throw new HttpError(502, 'Image upload failed. Please try again.');
  return json.data.url;
};
