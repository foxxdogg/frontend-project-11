import onChange from 'on-change'
import state from './state.js'

export function initView() {
  if (typeof document === 'undefined') {
    return { watchedState: null, input: null, form: null }
  }
  const input = document.querySelector('input')
  const form = document.querySelector('form')

  input.addEventListener('input', () => {
    if (input.value === '') {
      watchedState.rssForm.status = 'initial'
    }
  })

  const watchedState = onChange(state, function (path, value) {
    if (path === 'rssForm.status') {
      if (value === 'invalid') {
        input.classList.add('is-invalid')
      }
      else {
        input.classList.remove('is-invalid')
        watchedState.rssForm.status = 'initial'
        input.value = ''
        input.focus()
      }
    }
  })
  return { watchedState, input, form }
}
