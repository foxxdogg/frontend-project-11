const state = {
  rssForm: {
    status: 'initial',
    error: '',
    links: [],
  },
  feeds: [],
  posts: [],
}

function selectPost(state, postId) {
  const post = state.posts.find(p => p.postId === postId)
  if (post) {
    state.selectedPost = post
  }
}

export { state, selectPost }
