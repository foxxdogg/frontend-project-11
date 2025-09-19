import onChange from 'on-change'
import state from './state.js'
import en from './locales/en.json'
import ru from './locales/ru.json'
import i18next from 'i18next'
import * as yup from 'yup'

const i18nextInstance = i18next.createInstance()
i18nextInstance
  .init({
    lng: 'ru',
    resources: {
      en,
      ru,
    },
  })
  .then(() => {
    yup.setLocale({
      mixed: {
        required: () => ({ code: 'required' }),
      },
      string: {
        notUnique: () => ({ code: 'notUnique' }),
        url: () => ({ code: 'invalidUrl' }),
      },
    })
  })
  .catch((e) => {
    console.log(e)
    throw e
  })

function initView() {
  const header = document.querySelector('h1')
  header.textContent = i18nextInstance.t('header')

  const button = document.querySelector('button')
  button.textContent = i18nextInstance.t('form.button')

  const input = document.querySelector('input')
  input.setAttribute('placeholder', i18nextInstance.t('form.placeholder'))
  i18nextInstance.on('languageChanged', () => {
    input.setAttribute('placeholder', i18nextInstance.t('form.placeholder'))
  })

  const form = document.querySelector('form')
  const feedback = document.querySelector('.feedback')

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
        feedback.textContent = ''
        input.value = ''
        input.focus()
      }
    }
    if (path === 'rssForm.error') {
      feedback.textContent = i18nextInstance.t(`form.errors.${value}`)
    }
  })
  return { watchedState, input, form }
}

export { initView }
