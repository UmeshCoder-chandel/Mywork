import { useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import resolveMediaUrl from '../utils/resolveMediaUrl.js'

const MediaCarousel = ({ media = [], className = '', showThumbnails = true }) => {
  const [index, setIndex] = useState(0)
  if (!Array.isArray(media) || media.length === 0) return null

  const goPrev = () => setIndex((i) => (i - 1 + media.length) % media.length)
  const goNext = () => setIndex((i) => (i + 1) % media.length)

  const current = media[index]
  const src = current?.url || ''
  const isVideo = (current?.type && current.type.startsWith('video')) || (typeof src === 'string' && src.endsWith('.mp4'))
  const absolute = (u) => resolveMediaUrl(u)

  return (
    <div className={`w-full ${className}`}>
      <div className="relative bg-black">
        {isVideo ? (
          <video key={index} src={absolute(src)} controls className="w-full h-auto object-contain bg-black rounded-t-xl" />
        ) : (
          <img key={index} src={absolute(src)} alt={`media-${index}`} className="w-full h-auto object-cover rounded-t-xl" onError={(e) => { e.target.src = 'https://via.placeholder.com/800x600?text=Not+Found' }} />
        )}

        {media.length > 1 && (
          <>
            <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full hover:bg-white/40">
              <FiChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/20 rounded-full hover:bg-white/40">
              <FiChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}
      </div>

      {showThumbnails && media.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto px-2">
          {media.map((m, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`flex-shrink-0 rounded-md overflow-hidden border ${i === index ? 'ring-2 ring-blue-400' : 'border-white/10'}`}>
              { (m.type && m.type.startsWith('video')) ? (
                <video src={absolute(m.url)} className="w-20 h-14 object-cover" />
              ) : (
                <img src={absolute(m.url)} alt={`thumb-${i}`} className="w-20 h-14 object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/200x140?text=Image+Not+Found' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default MediaCarousel
