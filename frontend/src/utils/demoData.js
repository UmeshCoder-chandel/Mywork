export const demoUser = {
  _id: 'u_demo',
  name: 'Demo User',
  profession: 'Creator',
  avatar: ''
}

export const demoUsers = [
  demoUser,
  { _id: 'u_alex', name: 'Alex Rivera', profession: 'Designer' },
  { _id: 'u_sam', name: 'Sam Jordan', profession: 'Engineer' },
  { _id: 'u_lee', name: 'Lee Wong', profession: 'Photographer' }
]

export const demoPosts = [
  { _id: 'p1', user: demoUsers[1], image: 'https://picsum.photos/id/1011/800/500', desc: 'Morning light on the studio wall', likes: ['u_demo', 'u_sam'], comments: 2 },
  { _id: 'p2', user: demoUsers[2], video: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4', desc: 'Quick clip from today\'s build', likes: [], comments: 0 },
  { _id: 'p3', user: demoUsers[3], image: 'https://picsum.photos/id/1005/800/500', desc: 'Color and texture study', likes: ['u_demo'], comments: 1 }
]

export const demoNotifications = [
  { _id: 'n1', title: 'New follower', body: 'Alex started following you', read: false },
  { _id: 'n2', title: 'Post liked', body: 'Sam liked your post', read: false },
  { _id: 'n3', title: 'Comment', body: 'Lee commented on your post', read: true }
]

export const demoConversations = [
  { _id: 'c1', participants: [demoUsers[0], demoUsers[1]], lastMessage: { text: 'See you later!' }, updatedAt: new Date().toISOString() },
  { _id: 'c2', participants: [demoUsers[0], demoUsers[2]], lastMessage: { text: 'Ship it 🚀' }, updatedAt: new Date().toISOString() }
]

export const demoMessagesByConversation = {
  c1: [
    { _id: 'm1', text: 'Hey Alex', user: 'u_demo', createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { _id: 'm2', text: 'Hi! How is the project?', user: 'u_alex', createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString() }
  ],
  c2: [
    { _id: 'm3', text: 'Sam, build passed', user: 'u_demo', createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString() },
    { _id: 'm4', text: 'Amazing!', user: 'u_sam', createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString() }
  ]
}

export const demoCredentials = {
  email: 'demo@example.com',
  phone: '+15555550123',
  password: 'demo1234',
  otpCode: '123456'
}
