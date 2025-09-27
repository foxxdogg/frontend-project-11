import './style.css'
import * as yup from 'yup'
import { initView } from './view.js'
import { state, parseRssFromDataUrl, parseDoc } from './state.js'
import axios from 'axios'

export { state } from './state.js'

const { watchedState, input, form } = initView()
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
      posts.forEach(post => watchedState.posts.push(post))
      watchedState.rssForm.status = 'success'
    })
    .then(() => updatePosts())
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
        const updatedPosts = [...posts]
        const oldPosts = JSON.parse(JSON.stringify(watchedState.posts))
        const newPosts = updatedPosts.filter(
          updatedPost => !oldPosts.some(oldPost => updatedPost.link === oldPost.link),
        )
        newPosts.forEach(post => watchedState.posts.push(post))

        watchedState.posts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      })
      .catch((e) => {
        console.log(e.message)
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

export { updatePosts, watchedState }
