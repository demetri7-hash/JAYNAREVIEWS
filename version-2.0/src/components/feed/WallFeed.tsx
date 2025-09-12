import React, { useState, useEffect } from 'react'
import { useUser } from '../../contexts/UserContext'
import { formatDistanceToNow } from 'date-fns'

interface WallPost {
  id: string
  content: string
  post_type: string
  author: {
    name: string
    role: string
    department: string
    avatar_url?: string
  }
  created_at: string
  requires_acknowledgment: boolean
  acknowledgment_signature_required: boolean
  reactions: any
  wall_post_acknowledgments: Array<{
    employee_id: string
    acknowledged_at: string
    signature?: string
  }>
  _count_acknowledgments: Array<{ count: number }>
}

interface WallFeedProps {
  feedType?: 'public' | 'manager' | 'all'
  maxPosts?: number
  showCreatePost?: boolean
}

export default function WallFeed({ feedType = 'all', maxPosts = 20, showCreatePost = true }: WallFeedProps) {
  const { user } = useUser()
  const [posts, setPosts] = useState<WallPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPost, setNewPost] = useState({
    content: '',
    post_type: 'public',
    requires_acknowledgment: false,
    acknowledgment_signature_required: false
  })
  const [showSignatureModal, setShowSignatureModal] = useState<string | null>(null)
  const [signature, setSignature] = useState('')

  const isManager = user?.role === 'manager' || user?.role === 'admin'

  useEffect(() => {
    loadPosts()
  }, [feedType])

  const loadPosts = async () => {
    try {
      const params = new URLSearchParams({
        action: 'get_wall_posts',
        post_type: feedType === 'all' ? 'all' : feedType,
        limit: maxPosts.toString()
      })
      
      if (user) {
        params.append('employee_id', user.id)
      }

      const response = await fetch(`/api/notifications?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const createPost = async () => {
    if (!user || !newPost.content.trim()) return

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_wall_post',
          author_id: user.id,
          ...newPost
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setNewPost({
          content: '',
          post_type: 'public',
          requires_acknowledgment: false,
          acknowledgment_signature_required: false
        })
        setShowCreateForm(false)
        loadPosts()
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const acknowledgePost = async (postId: string, requiresSignature: boolean) => {
    if (!user) return

    if (requiresSignature) {
      setShowSignatureModal(postId)
      return
    }

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'acknowledge_post',
          post_id: postId,
          employee_id: user.id,
          signature: signature || null
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSignature('')
        setShowSignatureModal(null)
        loadPosts()
      }
    } catch (error) {
      console.error('Error acknowledging post:', error)
    }
  }

  const submitSignature = async () => {
    if (!signature.trim()) {
      alert('Please enter your full name')
      return
    }

    await acknowledgePost(showSignatureModal!, true)
  }

  const getPostIcon = (postType: string) => {
    switch (postType) {
      case 'manager_update': return '📢'
      case 'achievement': return '🏆'
      case 'announcement': return '📋'
      default: return '💬'
    }
  }

  const getPostTypeColor = (postType: string) => {
    switch (postType) {
      case 'manager_update': return 'bg-blue-50 border-blue-200'
      case 'achievement': return 'bg-yellow-50 border-yellow-200'
      case 'announcement': return 'bg-green-50 border-green-200'
      default: return 'bg-white border-gray-200'
    }
  }

  const hasUserAcknowledged = (post: WallPost) => {
    return post.wall_post_acknowledgments?.some(ack => ack.employee_id === user?.id)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Create Post Form */}
      {showCreatePost && user && (
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full text-left text-gray-500 bg-gray-50 rounded-lg p-3 hover:bg-gray-100"
            >
              What's happening at Jayna Gyro? 💬
            </button>
          ) : (
            <div className="space-y-4">
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="Share an update, achievement, or announcement..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <select
                    value={newPost.post_type}
                    onChange={(e) => setNewPost({ ...newPost, post_type: e.target.value })}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="public">💬 Public Post</option>
                    {isManager && (
                      <>
                        <option value="manager_update">📢 Manager Update</option>
                        <option value="announcement">📋 Announcement</option>
                      </>
                    )}
                    <option value="achievement">🏆 Achievement</option>
                  </select>
                  
                  {isManager && newPost.post_type === 'manager_update' && (
                    <div className="flex items-center space-x-2 text-sm">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newPost.requires_acknowledgment}
                          onChange={(e) => setNewPost({ ...newPost, requires_acknowledgment: e.target.checked })}
                          className="mr-1"
                        />
                        Require Acknowledgment
                      </label>
                      {newPost.requires_acknowledgment && (
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newPost.acknowledgment_signature_required}
                            onChange={(e) => setNewPost({ ...newPost, acknowledgment_signature_required: e.target.checked })}
                            className="mr-1"
                          />
                          Require Signature
                        </label>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createPost}
                    disabled={!newPost.content.trim()}
                    className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No posts yet. Be the first to share something! 🚀</p>
          </div>
        ) : (
          posts.map(post => (
            <div
              key={post.id}
              className={`rounded-lg shadow-md p-4 border ${getPostTypeColor(post.post_type)}`}
            >
              {/* Post Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {post.author.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{post.author.name}</h4>
                      <span className="text-sm text-gray-500">
                        {post.author.role} • {post.author.department}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getPostIcon(post.post_type)}</span>
                  {post.post_type !== 'public' && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">
                      {post.post_type.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <div className="text-gray-900 whitespace-pre-wrap">{post.content}</div>
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                <div className="flex items-center space-x-4">
                  {/* Reactions placeholder */}
                  <button className="text-gray-500 hover:text-blue-600 text-sm">
                    👍 React
                  </button>
                  
                  {post.requires_acknowledgment && user && !hasUserAcknowledged(post) && (
                    <button
                      onClick={() => acknowledgePost(post.id, post.acknowledgment_signature_required)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      {post.acknowledgment_signature_required ? '✍️ Sign & Acknowledge' : '✅ Acknowledge'}
                    </button>
                  )}
                  
                  {hasUserAcknowledged(post) && (
                    <span className="text-green-600 text-sm">✅ Acknowledged</span>
                  )}
                </div>
                
                {post._count_acknowledgments?.[0]?.count > 0 && (
                  <span className="text-sm text-gray-500">
                    {post._count_acknowledgments[0].count} acknowledgment{post._count_acknowledgments[0].count !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Signature Required</h3>
            <p className="text-gray-600 mb-4">
              This post requires your full name as a digital signature to acknowledge.
            </p>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowSignatureModal(null)
                  setSignature('')
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={submitSignature}
                disabled={!signature.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Sign & Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}