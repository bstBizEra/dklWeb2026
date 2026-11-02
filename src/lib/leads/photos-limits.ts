// Photo limits shared by the server checks (photos.ts, which loads sharp) and the browser's photo picker
// (components/dklao/photo-field.tsx), which must not load sharp.
export const maxPhotos = 2;
export const maxPhotoBytes = 5 * 1024 * 1024;
