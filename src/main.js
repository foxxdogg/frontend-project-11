import './style.css'
import * as yup from 'yup'
import { initView } from './view.js'
import state from './state.js'

document.addEventListener('DOMContentLoaded', () => {
  const { watchedState, input, form } = initView()
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    validateForm(input.value, state.rssForm.feeds)
  })

  function validateForm(link, feeds) {
    yup
      .string()
      .url()
      .required()
      .test(
        'unique',
        'rss-link must be unique',
        value =>
          new Promise((resolve) => {
            if (!value) {
              resolve(false)
            }
            else if (feeds.includes(value)) {
              resolve(false)
            }
            else {
              resolve(true)
            }
          }),
      )
      .validate(link)
      .then(() => {
        watchedState.rssForm.status = 'valid'
        watchedState.rssForm.feeds.push(link)
      })
      .catch((e) => {
        watchedState.rssForm.status = 'invalid'
        console.log(e)
      })
  }
})

export { state }
