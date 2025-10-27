import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Image, X, Hash, Trash2, Sparkles, Users2 } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

interface User {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
}

interface Comment {
  _id: string;
  content: string;
  author: User;
  createdAt: string;
}

interface Post {
  _id: string;
  content: string;
  author: User;
  images: string[];
  likes: User[];
  comments: Comment[];
  hashtags: string[];
  createdAt: string;
}

const Community = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`${API_BASE_URL}/api/auth/current-user`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (res.data.success) {
        setCurrentUser(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`${API_BASE_URL}/api/community/posts`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (res.data.success) {
        setPosts(res.data.data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 4);
      setSelectedImages(prev => [...prev, ...files].slice(0, 4));
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && selectedImages.length === 0) return;

    setIsPosting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('content', postContent);
      selectedImages.forEach(image => formData.append('images', image));

      await axios.post(`${API_BASE_URL}/api/community/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      setPostContent('');
      setSelectedImages([]);
      setImagePreviews([]);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(`${API_BASE_URL}/api/community/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId: string) => {
    const commentText = commentTexts[postId];
    if (!commentText?.trim()) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${API_BASE_URL}/api/community/posts/${postId}/comment`, 
        { content: commentText },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setCommentTexts({ ...commentTexts, [postId]: '' });
      fetchPosts();
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_BASE_URL}/api/community/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const isLikedByUser = (post: Post) => {
    if (!currentUser) return false;
    return post.likes.some(user => user._id === currentUser._id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-white text-xl flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Loading community...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Users2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Community Feed
            </h1>
          </div>
          <p className="text-gray-400 text-sm">Share your DSA journey, ask questions, and connect with fellow coders</p>
        </div>

        {/* Layout */}
        <div className="flex gap-6">
          {/* Sidebar - Create Post */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-4 border border-white/20 sticky top-24">
              <h3 className="text-sm font-semibold text-white mb-3">Create Post</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {currentUser?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-xs text-gray-300">{currentUser?.fullName || 'User'}</div>
                </div>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's on your mind? #dsa #coding"
                  className="w-full p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-white placeholder-gray-400 text-sm"
                  rows={3}
                />
                
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img src={preview} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-lg" />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="cursor-pointer text-gray-400 hover:text-purple-400 flex items-center space-x-1 transition-colors text-xs">
                    <Image size={14} />
                    <span>Photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleCreatePost}
                    disabled={isPosting}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-1.5 rounded-lg font-medium text-xs flex items-center space-x-1 transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isPosting ? 'Posting...' : 'Post'}</span>
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Posts */}
          <div className="flex-1 space-y-3">
          {posts.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-12 text-center border border-white/20">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <p className="text-white text-xl font-medium mb-2">No posts yet</p>
              <p className="text-gray-400">Be the first to share your thoughts with the community!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post._id} className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-4 border border-white/20 hover:border-purple-500/50 transition-all group">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                        {post.author.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-white text-xs">{post.author.fullName}</div>
                        <div className="text-xs text-gray-400">@{post.author.username} · {formatDate(post.createdAt)}</div>
                      </div>
                    </div>
                    {currentUser && post.author._id === currentUser._id && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="mb-2">
                    <p className="text-gray-200 text-xs whitespace-pre-wrap leading-relaxed line-clamp-2">{post.content}</p>
                    
                    {/* Hashtags */}
                    {post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {post.hashtags.map((tag, index) => (
                          <span key={index} className="text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded-full text-xs font-medium flex items-center">
                            <Hash size={10} />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post Images */}
                  {post.images.length > 0 && (
                    <div className="mb-2 grid grid-cols-2 gap-1.5 rounded overflow-hidden">
                      {post.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Post image ${index}`}
                          className="w-full h-24 object-cover rounded hover:scale-105 transition-transform duration-300"
                        />
                      ))}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="border-t border-white/20 pt-2 space-y-2">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center space-x-1 transition-all transform hover:scale-110 ${
                          isLikedByUser(post) ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
                        }`}
                      >
                        <Heart size={14} fill={isLikedByUser(post) ? 'currentColor' : 'none'} />
                        <span className="font-medium text-xs">{post.likes.length}</span>
                      </button>
                      <div className="flex items-center space-x-1 text-gray-400">
                        <MessageCircle size={14} />
                        <span className="font-medium text-xs">{post.comments.length}</span>
                      </div>
                    </div>

                    {/* Comments */}
                    <div className="space-y-1.5">
                      {post.comments.slice(0, 2).map(comment => (
                        <div key={comment._id} className="flex items-start space-x-1.5 bg-white/5 rounded p-1.5 border border-white/10">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            {comment.author.username[0].toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white text-xs">{comment.author.fullName}</div>
                            <div className="text-gray-300 text-xs">{comment.content}</div>
                          </div>
                        </div>
                      ))}
                      {post.comments.length > 2 && (
                        <div className="text-xs text-gray-400 text-center py-0.5">
                          {post.comments.length - 2} more
                        </div>
                      )}
                      
                      {/* Add Comment */}
                      <div className="flex items-center space-x-1.5 pt-0.5">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                          {currentUser?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <input
                          type="text"
                          value={commentTexts[post._id] || ''}
                          onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                          placeholder="Comment..."
                          className="flex-1 px-2 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400 text-xs"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleComment(post._id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleComment(post._id)}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-1 rounded-lg transition-all"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
