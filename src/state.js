import _ from 'lodash'

const state = {
  rssForm: {
    status: 'initial',
    error: '',
    links: [],
  },
  feeds: [],
  posts: [],
}

function parseRssFromDataUrl(dataUrl) {
  const base64 = dataUrl.split(',')[1]
  const xmlString = atob(base64)
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'application/xml')
  if (doc.querySelector('parsererror')) {
    throw new Error('Error parsing RSS feed')
  }
  return doc
}

function parseDoc(doc) {
  const channel = doc.querySelector('channel')
  const feed = {
    title: channel.querySelector('title').textContent,
    description: channel.querySelector('description').textContent,
    id: _.uniqueId(),
  }
  const items = channel.querySelectorAll('item')
  const posts = Array.from(items).map(item => ({
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    link: item.querySelector('link').textContent,
    pubDate: item.querySelector('pubDate')
      ? new Date(item.querySelector('pubDate').textContent).toISOString()
      : new Date().toISOString(),
    feedId: feed.id,
    postId: _.uniqueId(),
    read: false,
  }))
  return { feed, posts }
}

function selectPost(state, postId) {
  const post = state.posts.find(p => p.postId === postId)
  if (post) {
    state.selectedPost = post
  }
}

export { state, parseRssFromDataUrl, parseDoc, selectPost }
