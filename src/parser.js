import _ from 'lodash'

function parseRssFromDataUrl(xmlString) {
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

export { parseRssFromDataUrl, parseDoc }
