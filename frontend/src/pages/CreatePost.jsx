import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postService } from '../services/postService.js'
import { FiImage, FiVideo, FiX, FiSend } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import MediaCarousel from '../components/MediaCarousel.jsx'

const CreatePost = () => {
  const navigate = useNavigate()
  const [description, setDescription] = useState('')
  // unified media array of File objects
  const [mediaFiles, setMediaFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!description.trim() && (!mediaFiles || mediaFiles.length === 0)) {
        throw new Error('Add content or media')
      }
      await postService.createPost({ description, mediaFiles })
      toast.success('Post created successfully!')
      setDescription('')
      setMediaFiles([])
      navigate('/')
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create post'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB per file
  const allowedType = (f) => f && f.type && (f.type.startsWith('image') || f.type.startsWith('video'))

  const handleFilesAdd = (e) => {
    const files = Array.from(e.target.files)
    const accepted = []
    for (const f of files) {
      if (!allowedType(f)) {
        toast.error(`Unsupported file type: ${f.name}`)
        continue
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`File too large (>50MB): ${f.name}`)
        continue
      }
      accepted.push(f)
    }
    if (accepted.length === 0) return
    // limit to 10 files total
    const newFiles = [...mediaFiles, ...accepted].slice(0, 10)
    setMediaFiles(newFiles)
  }

  const removeMedia = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index))
  }

  const clearAllMedia = () => setMediaFiles([])


  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="glass rounded-3xl shadow-xl p-6 border border-white/30 animate-slide-up">
        <h1 className="text-3xl font-bold gradient-text mb-6">Create Post</h1>
        
        {error && (
          <div className="mb-6 glass border border-red-200/50 text-red-700 px-4 py-3 rounded-xl animate-slide-up">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-32 px-4 py-3 glass border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder:text-gray-400 resize-none"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {description.length}/500
            </div>
          </div>

          {/* Media Preview (carousel) */}
          {mediaFiles.length > 0 && (
            <div className="mb-4">
              <MediaCarousel
                media={mediaFiles.map((f) => ({ url: URL.createObjectURL(f), type: f.type }))}
                showThumbnails={true}
              />

              <div className="flex items-center gap-3 mt-2">
                <button type="button" onClick={clearAllMedia} className="px-3 py-2 text-sm bg-red-500/10 text-red-600 rounded-md">Remove all</button>
                <div className="text-sm text-gray-500">{mediaFiles.length} file(s)</div>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-3">
                {mediaFiles.map((f, idx) => (
                  <div key={idx} className="relative group">
                    {f.type.startsWith('video') ? (
                      <video src={URL.createObjectURL(f)} className="w-full h-20 object-cover rounded-md" />
                    ) : (
                      <img src={URL.createObjectURL(f)} className="w-full h-20 object-cover rounded-md" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Inputs */}
          <div className="flex gap-3">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFilesAdd}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 px-4 py-3 glass border border-white/30 rounded-xl hover:bg-white/50 transition-all">
                <FiImage className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Add Media</span>
              </div>
            </label>

            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesAdd}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 px-4 py-3 glass border border-white/30 rounded-xl hover:bg-white/50 transition-all">
                <FiImage className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Add Images</span>
              </div>
            </label>

            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleFilesAdd}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 px-4 py-3 glass border border-white/30 rounded-xl hover:bg-white/50 transition-all">
                <FiVideo className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Add Video(s)</span>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || (!description.trim() && (!mediaFiles || mediaFiles.length === 0))}
            className="w-full px-6 py-3.5 gradient-primary text-white rounded-xl hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Sharing...</span>
              </>
            ) : (
              <>
                <span>Share Post</span>
                <FiSend className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreatePost
