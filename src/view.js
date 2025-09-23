import onChange from 'on-change'
import { state } from './state.js'
import en from './locales/en.json'
import ru from './locales/ru.json'
import i18next from 'i18next'
import * as yup from 'yup'

const i18nextInstance = i18next.createInstance()
i18nextInstance
  .init({
    lng: 'en',
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
  const example = document.querySelector('.example')
  example.textContent = i18nextInstance.t('form.example')

  const watchedState = onChange(state, function (path, value) {
    if (path === 'rssForm.status') {
      if (value === 'invalid') {
        input.classList.add('is-invalid')
      }
      else if (value === 'initial') {
        input.classList.remove('is-invalid')
        input.value = ''
        input.focus()
        feedback.classList.remove('text-danger', 'text-success')
        feedback.textContent = ''
      }
      else if (value === 'success') {
        input.classList.remove('is-invalid')
        input.value = ''
        input.focus()
        feedback.classList.remove('text-danger')
        feedback.classList.add('text-success')
        feedback.textContent = i18nextInstance.t('form.successMessage')
      }
      else if (value === 'valid') {
        input.classList.remove('is-invalid')
        feedback.textContent = ''
      }
    }
    if (path === 'rssForm.error') {
      feedback.classList.remove('text-success')
      feedback.classList.add('text-danger')
      const errorCode = typeof value === 'string' ? value : value.code
      feedback.textContent = i18nextInstance.t(`form.errors.${errorCode}`)
    }

    if (path === 'feeds') {
      renderFeeds(watchedState.feeds)
    }

    if (path === 'posts') {
      renderPosts(watchedState.posts)
    }
  })

  return { watchedState, input, form }
}

function renderPosts(posts) {
  const postsContainer = document.querySelector('.posts')
  postsContainer.innerHTML = ''
  const postsHeader = document.createElement('h2')
  postsHeader.textContent = i18nextInstance.t(`posts`)
  postsHeader.classList.add('text-start')
  postsHeader.style.paddingLeft = '12px'
  postsContainer.append(postsHeader)
  const list = document.createElement('ul')
  list.classList.add('list-group', 'list-group-flush')
  postsContainer.append(list)
  for (let post of posts) {
    const listItem = document.createElement('li')
    listItem.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
    )
    const link = document.createElement('a')
    link.textContent = post.title
    link.href = post.link
    listItem.append(link)
    const viewButton = document.createElement('button')
    viewButton.classList.add('btn', 'btn-sm', 'btn-outline-primary')
    viewButton.type = 'button'
    viewButton.textContent = i18nextInstance.t(`button`)
    listItem.append(viewButton)
    list.append(listItem)
    console.log(post)
  }
}

function renderFeeds(feeds) {
  const feedsContainer = document.querySelector('.feeds')
  feedsContainer.innerHTML = ''
  const feedsHeader = document.createElement('h2')
  feedsHeader.textContent = i18nextInstance.t(`feeds`)
  feedsContainer.append(feedsHeader)
  for (let feed of feeds) {
    const title = document.createElement('h4')
    title.textContent = feed.title
    feedsContainer.append(title)
    const description = document.createElement('p')
    description.textContent = feed.description
    feedsContainer.append(description)
    console.log(feed)
  }
}

export { initView }
