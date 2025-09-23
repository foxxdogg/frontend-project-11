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
    link: item.querySelector('link').textContent,
    feedId: feed.id,
    postId: _.uniqueId(),
  }))
  return { feed, posts }
}

export { state, parseRssFromDataUrl, parseDoc }
