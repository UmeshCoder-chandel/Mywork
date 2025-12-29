import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { userService } from '../services/userService.js'
import { authService } from '../services/authService.js'
import { postService } from '../services/postService.js'
import { demoUsers } from '../utils/demoData.js'
import { useAuth } from '../context/AuthContext.jsx'
import { FiBriefcase, FiMail, FiPhone, FiMapPin, FiEdit2, FiX, FiSave, FiCamera } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import resolveMediaUrl from '../utils/resolveMediaUrl.js'

const Profile = () => {
  const { userId } = useParams()
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', profession: '', location: '', bio: '' })
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [posts, setPosts] = useState([])
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const isOwnProfile = !userId || userId === user?._id

  useEffect(() => {
    ; (async () => {
      try {
        const targetId = userId || user?._id
        if (!targetId) {
          setProfile(null)
          return
        }

        if (import.meta.env.VITE_DEMO_MODE === 'true') {
          const found = demoUsers.find(u => u._id === userId) || demoUsers[0]
          setProfile(found)
          setEditForm({
            name: found.name || '',
            profession: found.profession || '',
            location: found.location || '',
            bio: found.bio || ''
          })
          // demo posts
          const demoPosts = demoUsers.reduce((acc, u) => acc.concat([]), [])
          setPosts([])
          setFollowers([])
          setFollowing([])
        } else {
          // fetch profile, posts, followers, following
          const data = await userService.getUserById(targetId)
          const profileData = data.user || data
          setProfile(profileData)
          setEditForm({
            name: profileData.name || '',
            profession: profileData.profession || '',
            location: profileData.location || '',
            bio: profileData.bio || ''
          })

          const postsData = await postService.getPostsByUser(targetId)
          setPosts(postsData.posts || postsData)

          const followersData = await userService.getFollowers(targetId)
          setFollowers(followersData.followers || followersData.followers || [])

          const followingData = await userService.getFollowing(targetId)
          setFollowing(followingData.following || followingData.following || [])

          // is current user following this profile?
          const isFollowingNow = followersData.followers?.some(f => String(f.follower?._id || f.follower) === String(user?._id))
          setIsFollowing(Boolean(isFollowingNow))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [userId, user?._id])

  const handleEditClick = () => {
    setIsEditing(true)
    setEditForm({
      name: profile.name || '',
      profession: profile.profession || '',
      location: profile.location || '',
      bio: profile.bio || ''
    })
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({
      name: profile.name || '',
      profession: profile.profession || '',
      location: profile.location || '',
      bio: profile.bio || ''
    })
  }

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      toast.error('Name is required')
      return
    }

    setSaving(true)
    try {
      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        const updated = { ...profile, ...editForm }
        setProfile(updated)
        updateUser(updated)
        toast.success('Profile updated successfully!')
        setIsEditing(false)
      } else {
        const data = await authService.updateProfile(editForm)
        if (data.user) {
          setProfile(data.user)
          updateUser(data.user)
          toast.success('Profile updated successfully!')
          setIsEditing(false)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setUploadingAvatar(true)
    try {
      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        const updated = { ...profile, profileImage: URL.createObjectURL(file) }
        setProfile(updated)
        updateUser(updated)
        toast.success('Avatar updated successfully!')
      } else {
        const data = await userService.uploadProfileImage(file)
        if (data.user) {
          setProfile(data.user)
          updateUser(data.user)
          toast.success('Avatar updated successfully!')
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
      e.target.value = '' // Reset input
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="glass rounded-2xl p-8 text-center border border-white/30">
          <p className="text-gray-600 text-lg">User not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="glass rounded-3xl shadow-xl p-8 mb-6 border border-white/30 animate-slide-up">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            {profile.profileImage ? (
              <img
                src={resolveMediaUrl(profile.profileImage)}
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover shadow-2xl border-4 border-white"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div
              className={`w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-200 flex items-center justify-center text-white font-bold text-4xl shadow-2xl ${profile.profileImage ? 'hidden' : ''}`}
            >
              {profile.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {isOwnProfile && (
              <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer">
                {uploadingAvatar ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                ) : (
                  <FiCamera className="w-4 h-4 text-gray-700" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </label>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            {isEditing ? (
              <div className="space-y-4 w-full">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-lg font-semibold"
                />
                <select
                  value={editForm.profession || ''}
                  onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })}
                  className="w-full px-4 py-2.5   border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                >
                  <option value="">Select Profession</option>
<option value="Plumber">Plumber</option>
<option value="Electrician">Electrician</option>
<option value="Labour">Labour</option>
<option value="Painter">Painter</option>
<option value="Carpenter">Carpenter</option>
<option value="Mason">Mason</option>
<option value="Welder">Welder</option>
<option value="Tile Worker">Tile Worker</option>
<option value="AC Mechanic">AC Mechanic</option>
<option value="House Cleaner">House Cleaner</option>
<option value="Gardener">Gardener</option>
<option value="Security Guard">Security Guard</option>
<option value="HVAC Technician">HVAC Technician</option>
<option value="Roofer">Roofer</option>
<option value="Flooring Specialist">Flooring Specialist</option>
<option value="Locksmith">Locksmith</option>
<option value="Appliance Repair Technician">Appliance Repair Technician</option>
<option value="Landscaper">Landscaper</option>
<option value="Pest Control Technician">Pest Control Technician</option>
<option value="Automotive Mechanic">Automotive Mechanic</option>
<option value="Bricklayer">Bricklayer</option>
<option value="Concrete Finisher">Concrete Finisher</option>
<option value="Cabinet Maker">Cabinet Maker</option>
<option value="Drywaller">Drywaller</option>
<option value="Elevator Technician">Elevator Technician</option>
<option value="Fence Installer">Fence Installer</option>
<option value="Glazier">Glazier</option>
<option value="Insulation Installer">Insulation Installer</option>
<option value="Ironworker">Ironworker</option>
<option value="Plasterer">Plasterer</option>
<option value="Pipefitter">Pipefitter</option>
<option value="Scaffold Erector">Scaffold Erector</option>
<option value="Sheet Metal Worker">Sheet Metal Worker</option>
<option value="Solar Panel Installer">Solar Panel Installer</option>
<option value="Sprinkler System Installer">Sprinkler System Installer</option>
<option value="Structural Engineer">Structural Engineer</option>
<option value="Tile Setter">Tile Setter</option>
<option value="Upholsterer">Upholsterer</option>
<option value="Waterproofer">Waterproofer</option>
<option value="Window Installer">Window Installer</option>
<option value="Cabinet Installer">Cabinet Installer</option>
<option value="Demolition Worker">Demolition Worker</option>
<option value="Excavator Operator">Excavator Operator</option>
<option value="Forklift Operator">Forklift Operator</option>
<option value="Crane Operator">Crane Operator</option>
<option value="Heavy Equipment Operator">Heavy Equipment Operator</option>
<option value="Spray Painter">Spray Painter</option>
<option value="Road Construction Worker">Road Construction Worker</option>
<option value="Sanitation Worker">Sanitation Worker</option>
<option value="Steel Fabricator">Steel Fabricator</option>
<option value="Traffic Controller">Traffic Controller</option>
<option value="Trenching Operator">Trenching Operator</option>
<option value="Weld Inspector">Weld Inspector</option>
<option value="Masonry Cleaner">Masonry Cleaner</option>
<option value="HVAC Installer">HVAC Installer</option>
<option value="Fire Protection Technician">Fire Protection Technician</option>
<option value="Hazardous Material Handler">Hazardous Material Handler</option>
<option value="Insulation Technician">Insulation Technician</option>
<option value="Lift Technician">Lift Technician</option>
<option value="Cable Technician">Cable Technician</option>
<option value="other">Other</option>

                </select>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Location"
                  className="w-full px-4 py-2.5   border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                />
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Bio"
                  rows={3}
                  className="w-full px-4 py-2.5   border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
                />
                <div className="flex gap-2 justify-center sm:justify-start">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-2.5 gradient-primary text-white rounded-xl hover:shadow-glow transition-all font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="px-6 py-2.5   border border-gray-200 text-gray-700 rounded-xl hover:bg-white/50 transition-all font-medium flex items-center gap-2"
                  >
                    <FiX className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold gradient-text mt-2 mb-2">{profile.name}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 mb-4">
                  <FiBriefcase className="w-4 h-4" />
                  <p className="text-sm font-medium">{profile.profession || 'Professional'}</p>
                </div>
                {profile.bio && (
                  <p className="text-gray-500 mb-2 text-sm">{profile.bio || 'Heyy'}</p>
                )}
                {!isOwnProfile && (
                  <div className="flex gap-3 justify-center sm:justify-start">
                    <button
                      onClick={async () => {
                        try {
                          if (isFollowing) {
                            await userService.unfollowUser(profile._id)
                            setIsFollowing(false)
                            // remove current user from followers list if present
                            setFollowers((prev) => prev.filter(f => String(f.follower?._id || f.follower) !== String(user?._id)))
                            toast.success('Unfollowed')
                          } else {
                            await userService.followUser(profile._id)
                            setIsFollowing(true)
                            // add current user to followers list
                            setFollowers((prev) => [{ follower: user }, ...prev])
                            toast.success('Following')
                          }
                        } catch (err) {
                          toast.error(err.response?.data?.message || 'Action failed')
                        }
                      }}
                      className={`px-6 py-2.5 ${isFollowing ? 'bg-gray-200 text-gray-700' : 'gradient-primary text-white'} rounded-xl hover:shadow-glow transition-all font-medium flex items-center gap-2`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                )}
                {isOwnProfile && (
                  <button
                    onClick={handleEditClick}
                    className="px-6 py-2.5 border border-gray-200 rounded-full text-sm text-black/80 hover:shadow-glow transition-all font-medium flex items-center gap-2 mx-auto sm:mx-0"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}              </>
            )}
          </div>
        </div>

        {/* Profile Details */}
        {!isEditing && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.email && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200">
                <FiMail className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 text-sm">{profile.email}</span>
              </div>
            )}
            {profile.phone && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200">
                <FiPhone className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 text-sm">{profile.phone}</span>
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200">
                <FiMapPin className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 text-sm">{profile.location}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <div className="glass rounded-2xl shadow-lg p-4 border border-white/30 text-center">
          <div className="text-2xl font-bold">{posts.length}</div>
          <div className="text-sm text-gray-500">Posts</div>
        </div>
        <div className="glass rounded-2xl shadow-lg p-4 border border-white/30 text-center cursor-pointer" onClick={() => setShowFollowers(true)}>
          <div className="text-2xl font-bold">{followers.length}</div>
          <div className="text-sm text-gray-500">Followers</div>
        </div>
        <div className="glass rounded-2xl shadow-lg p-4 border border-white/30 text-center cursor-pointer" onClick={() => setShowFollowing(true)}>
          <div className="text-2xl font-bold">{following.length}</div>
          <div className="text-sm text-gray-500">Following</div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="glass rounded-2xl shadow-lg p-6 border border-white/30 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Posts</h3>
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No posts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {posts.map((p) => (
              <div key={p._id} className="rounded overflow-hidden bg-gray-100">
                {p.media && p.media.length > 0 ? (
                  p.media[0].type === 'video' ? (
                    <video src={resolveMediaUrl(p.media[0].url)} className="w-full h-36 object-cover" />
                  ) : (
                    <img src={resolveMediaUrl(p.media[0].url)} className="w-full h-36 object-cover" />
                  )
                ) : p.image ? (
                  <img src={resolveMediaUrl(p.image)} className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36 flex items-center justify-center text-gray-500">No media</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Followers / Following lists */}
      <div>
        {showFollowers && (
          <div className="glass rounded-2xl shadow-lg p-4 border border-white/30 mb-4">
            <h4 className="font-semibold mb-3">Followers</h4>
            {followers.length === 0 ? (
              <p className="text-gray-500">No followers yet</p>
            ) : (
              <div className="space-y-2">
                {followers.map((f) => (
                  <div key={String(f._id || f.follower?._id)} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">{(f.follower?.name || f.name || 'U').charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="font-semibold">{f.follower?.name || f.name}</div>
                      <div className="text-xs text-gray-500">{f.follower?.profession}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 text-right">
              <button onClick={() => setShowFollowers(false)} className="px-3 py-1 text-sm bg-gray-200 rounded">Close</button>
            </div>
          </div>
        )}

        {showFollowing && (
          <div className="glass rounded-2xl shadow-lg p-4 border border-white/30 mb-4">
            <h4 className="font-semibold mb-3">Following</h4>
            {following.length === 0 ? (
              <p className="text-gray-500">Not following anyone</p>
            ) : (
              <div className="space-y-2">
                {following.map((f) => (
                  <div key={String(f._id || f.following?._id)} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">{(f.following?.name || f.name || 'U').charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="font-semibold">{f.following?.name || f.name}</div>
                      <div className="text-xs text-gray-500">{f.following?.profession}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 text-right">
              <button onClick={() => setShowFollowing(false)} className="px-3 py-1 text-sm bg-gray-200 rounded">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
