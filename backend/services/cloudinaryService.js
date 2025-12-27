import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

// Configure from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error)
      resolve(result)
    })
    const bufferStream = new Readable()
    bufferStream.push(buffer)
    bufferStream.push(null)
    bufferStream.pipe(stream)
  })
}

const deleteByPublicId = async (publicId, resourceType = 'image') => {
  try {
    const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
    return res
  } catch (e) {
    throw e
  }
}

export default {
  uploadBuffer,
  deleteByPublicId,
}
