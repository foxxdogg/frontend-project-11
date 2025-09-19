import './style.css'
import * as yup from 'yup'
import { initView } from './view.js'
import state from './state.js'

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
    .test('unique', function (value) {
      const { path, createError } = this
      return new Promise((resolve) => {
        if (!value) {
          resolve(createError({ path, params: { code: 'required' } }))
        }
        else if (feeds.includes(value)) {
          resolve(createError({ path, params: { code: 'notUnique' } }))
        }
        else {
          resolve(true)
        }
      })
    })
    .validate(link)
    .then(() => {
      watchedState.rssForm.status = 'valid'
      watchedState.rssForm.feeds.push(link)
    })
    .catch((e) => {
      watchedState.rssForm.status = 'invalid'
      const code = e.params?.code || e.message?.code || 'unknown'
      watchedState.rssForm.error = code
    })
}

export { state }
