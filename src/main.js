import './style.css'
import * as yup from 'yup'
import { initView } from './view.js'
import { state, parseRssFromDataUrl, parseDoc, selectPost } from './state.js'
import axios from 'axios'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const { watchedState } = initView()
if (watchedState.rssForm.links.length > 0) {
  updatePosts()
}
const form = document.querySelector('form')
const input = document.querySelector('input')
const posts = document.querySelector('.posts')

form.addEventListener('submit', (e) => {
  e.preventDefault()
  validateForm(input.value, state.rssForm.links)
    .then(() => {
      const link = input.value
      watchedState.rssForm.status = 'valid'
      watchedState.rssForm.links.push(link)
      const proxy = 'https://api.allorigins.win/get?disableCache=true&url='
      const url = encodeURIComponent(link)
      return axios.get(proxy + url)
    })
    .then((response) => {
      if (!response.data?.contents) {
        throw new Error('RSS feed not available')
      }
      const rssString = response.data.contents
      return parseRssFromDataUrl(rssString)
    })
    .then((doc) => {
      const { feed, posts } = parseDoc(doc)
      watchedState.feeds.push(feed)
      for (const post of posts) {
        watchedState.posts.push(post)
      }
      watchedState.rssForm.status = 'success'
    })
    .catch((e) => {
      if (e.name === 'ValidationError') {
        const code = e.params?.code || e.message?.code || 'unknown'
        watchedState.rssForm.status = 'invalid'
        watchedState.rssForm.error = code
      }
      else if (e.name === 'AxiosError') {
        watchedState.rssForm.status = 'invalid'
        watchedState.rssForm.error = 'networkError'
      }
      else {
        watchedState.rssForm.status = 'invalid'
        watchedState.rssForm.error = 'parseError'
      }
    })
})

input.addEventListener('input', () => {
  if (input.value === '') {
    watchedState.rssForm.status = 'initial'
  }
})

posts.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
    const id = e.target.id
    const index = watchedState.posts.findIndex(post => post.postId === id)
    watchedState.posts[index].read = true
  }
  if (e.target.tagName === 'BUTTON') {
    selectPost(watchedState, e.target.id)
  }
})

function updatePosts() {
  const proxy = 'https://api.allorigins.win/get?disableCache=true&url='
  for (const link of watchedState.rssForm.links) {
    axios
      .get(proxy + link)
      .then((response) => {
        const rssString = response.data.contents
        return parseRssFromDataUrl(rssString)
      })
      .then((doc) => {
        const { posts } = parseDoc(doc)
        const newPosts = posts.filter(
          post => !watchedState.posts.some(oldPost => oldPost.link === post.link),
        )
        for (const post of newPosts) {
          watchedState.posts.push(post)
        }
        watchedState.posts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      })
      .catch((err) => {
        console.log(err.message)
      })
  }
  setTimeout(updatePosts, 5000)
}

function validateForm(link, links) {
  return yup
    .string()
    .url()
    .required()
    .test('unique', function (value) {
      const { path, createError } = this
      if (links.includes(value)) {
        return createError({ path, params: { code: 'notUnique' } })
      }
      return true
    })
    .validate(link)
}

export { updatePosts }
