# Cloudinary Upload Integration

This project supports uploading images and videos to Cloudinary using server-side uploads.

## Environment variables
Add the following to your backend `.env` file:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=worksocial/posts # optional
```

## Install
Run in the backend folder:

```
npm install cloudinary
```

## Behavior
- `multer` is switched to `memoryStorage` so uploaded files are received as buffers in `req.files`.
- `POST /api/social/posts` (existing route) accepts `media` files in `multipart/form-data` and uploads them to Cloudinary.
- For video uploads, a thumbnail is generated using an eager transformation and stored as `media[i].thumbnail` in the post document.
- When a post is deleted, the backend attempts to delete associated Cloudinary assets if `public_id` is present.

## Notes & Next Steps
- For better performance and scalability, consider implementing direct signed client-to-Cloudinary uploads.
- For large video processing, consider using Cloudinary's asynchronous transformations or an external worker.
- Add tests and CI steps for upload validation.
