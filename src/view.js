import onChange from 'on-change'
import { state } from './state.js'
import en from './locales/en.json'
import ru from './locales/ru.json'
import i18next from 'i18next'
import * as yup from 'yup'
import { updatePosts } from './main.js'

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

  const button = document.querySelector('button[type="submit"]')
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
    switch (path) {
      case 'rssForm.status':
        handleStatusChange(value, input, feedback)
        break
      case 'rssForm.error':
        handleErrorChange(value, feedback)
        break
      case 'feeds':
        handleFeedsChange(watchedState.feeds)
        break
      case 'posts':
        handlePostsChange(value, watchedState)
        break
      case 'selectedPost':
        handleSelectedPostChange(value)
        break
      default:
        if (path.startsWith('posts.')) {
          handlePostStatusChange(path, watchedState)
        }
        break
    }
  })
  return { watchedState, input, form }
}

function handlePostStatusChange(path, state) {
  const [posts, index] = path.split('.')
  const linkEl = Array.from(document.querySelectorAll('.posts a')).find(
    a => a.href === state[posts][index].link,
  )
  linkEl.classList.remove('fw-bold')
  linkEl.classList.add('fw-normal', 'link-secondary')
}

function handleStatusChange(value, input, feedback) {
  switch (value) {
    case 'invalid':
      input.classList.add('is-invalid')
      break
    case 'initial':
      input.classList.remove('is-invalid')
      input.value = ''
      input.focus()
      feedback.classList.remove('text-danger', 'text-success')
      feedback.textContent = ''
      break
    case 'success':
      input.classList.remove('is-invalid')
      input.value = ''
      input.focus()
      feedback.classList.remove('text-danger')
      feedback.classList.add('text-success')
      feedback.textContent = i18nextInstance.t('form.successMessage')
      updatePosts()
      break
    case 'valid':
      input.classList.remove('is-invalid')
      feedback.textContent = ''
      updatePosts()
      break
  }
}

function handleErrorChange(value, feedback) {
  feedback.classList.remove('text-success')
  feedback.classList.add('text-danger')
  const errorCode = typeof value === 'string' ? value : value.code
  feedback.textContent = i18nextInstance.t(`form.errors.${errorCode}`)
}

function handleFeedsChange(feeds) {
  renderFeeds(feeds)
}

function handlePostsChange(value, state) {
  const postsContainer = document.querySelector('.posts')
  if (!postsContainer.querySelector('ul')) renderPostsContainer()
  const list = postsContainer.querySelector('ul')
  const existingLinks = new Set(Array.from(list.querySelectorAll('a')).map(a => a.href))
  for (let post of value) {
    if (!existingLinks.has(post.link)) addSinglePost(post, state)
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
  }
}

function renderPostsContainer() {
  const postsContainer = document.querySelector('.posts')
  if (!postsContainer.querySelector('h2')) {
    const postsHeader = document.createElement('h2')
    postsHeader.textContent = i18nextInstance.t('posts')
    postsHeader.style.paddingLeft = '12px'
    postsContainer.append(postsHeader)
  }
  if (!postsContainer.querySelector('ul')) {
    const list = document.createElement('ul')
    list.classList.add('list-group', 'list-group-flush')
    postsContainer.append(list)
  }
}

function handleSelectedPostChange(post) {
  const modalEl = document.getElementById('exampleModal')
  const modalTitle = document.querySelector('#exampleModal .modal-title')
  const modalBody = document.querySelector('#exampleModal .modal-body')
  modalTitle.textContent = post.title
  modalBody.textContent = post.description

  const readMoreBtn = modalEl.querySelector('.btn-primary')
  if (readMoreBtn) {
    readMoreBtn.onclick = () => window.open(post.link, '_blank')
  }
}

function addSinglePost(post, state) {
  const postsContainer = document.querySelector('.posts')
  let list = postsContainer.querySelector('ul')
  if (!list) {
    renderPostsContainer()
    list = postsContainer.querySelector('ul')
  }
  const listItem = document.createElement('li')
  listItem.classList.add(
    'list-group-item',
    'd-flex',
    'justify-content-between',
    'align-items-start',
  )
  const link = document.createElement('a')
  link.classList.add(post.read ? 'fw-normal' : 'fw-bold')
  if (post.read) {
    link.classList.add('link-secondary')
  }
  link.textContent = post.title
  link.href = post.link
  link.id = post.postId
  link.target = '_blank'
  listItem.append(link)

  const viewButton = document.createElement('button')
  viewButton.classList.add('btn', 'btn-sm', 'btn-outline-primary')
  viewButton.type = 'button'
  viewButton.textContent = i18nextInstance.t(`button`)
  viewButton.dataset.bsToggle = 'modal'
  viewButton.dataset.bsTarget = '#exampleModal'
  viewButton.id = post.postId
  listItem.append(viewButton)

  const items = Array.from(list.querySelectorAll('li'))
  const existing = items.find((li) => {
    const a = li.querySelector('a')
    const existingDate = new Date(state.posts.find(p => p.link === a.href)?.pubDate || 0)
    return new Date(post.pubDate) > existingDate
  })
  if (existing) {
    existing.before(listItem)
  }
  else {
    list.append(listItem)
  }
}

export { initView }
