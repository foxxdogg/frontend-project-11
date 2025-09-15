import onChange from 'on-change'
import state from './state.js'

const input = document.querySelector('input')

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

export { watchedState, input }
