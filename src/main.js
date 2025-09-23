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
      watchedState.posts.push(...posts)
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
