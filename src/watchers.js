/* eslint-disable no-param-reassign, no-console  */
import onChange from 'on-change';
import i18next from 'i18next';
import find from 'lodash/find';

const makeLiFeeds = (feed) => {
  const { feedTitle, feedDescription } = feed;
  const li = `<li class="list-group-item">
    <h3>${feedTitle}</h3>
    <p>${feedDescription}</p>
  </li>`;
  return li;
};

const makeLiPosts = (post, viewed) => {
  const { id, postTitle, postLink } = post;
  const fontDecoration = viewed.has(id) ? 'normal' : 'bold';
  const li = `<li class="list-group-item d-flex justify-content-between align-items-start">
    <a href=${postLink} class='fw-${fontDecoration} text-decoration-none' data-id=${id} target='_blank' rel='noopener noreferrer'>${postTitle}</a>
    <button aria-label="button" type="button" class="btn btn-primary btn-sm" data-id=${id} data-toggle="modal" data-target="#modal">${i18next.t('buttons.veiw')}</button>
  </li>`;
  return li;
};

const handleModalView = (state) => {
  const { posts } = state;
  const { id } = state.modalId;
  const commonPost = find(posts, ['id', id]);
  const mtitle = document.querySelector('.modal-title');
  const mbody = document.querySelector('.modal-body');
  const mfooter = document.querySelector('.full-article');
  mtitle.textContent = commonPost.postTitle;
  mbody.textContent = commonPost.postDescription;
  mfooter.href = commonPost.postLink;
};

const handleFeedsView = (feed, domElements) => {
  const { feeds } = domElements;
  feeds.innerHTML = `<h2>${i18next.t('headings.feeds')}</h2><ul class="list-group mb-5"></ul>`;
  const feedsList = feeds.querySelector('ul');
  const feedsContent = feed.map(makeLiFeeds).join('');
  feedsList.innerHTML = feedsContent;
};

const handlePostsView = (state, domElements) => {
  const items = state.posts;
  const { reviewed } = state.modalReviewed;
  const { posts } = domElements;
  if (posts.textContent !== 'Posts') {
    posts.innerHTML = `<h2>${i18next.t('headings.posts')}</h2><ul class="list-group"></ul>`;
  }
  const postsList = posts.querySelector('ul');
  const postsContent = items.map((item) => makeLiPosts(item, reviewed)).join('');
  postsList.innerHTML = postsContent;
};

const handleError = (error, domElements) => {
  const { feedbackElement, input } = domElements;
  input.removeAttribute('readonly');
  input.classList.add('is-invalid');
  feedbackElement.classList.remove('text-success');
  feedbackElement.classList.add('text-danger');
  feedbackElement.textContent = i18next.t(`errors.${error}`);
};

const handleProcessStatus = (status, domElements) => {
  const { feedbackElement, input, button } = domElements;

  if (status === 'loading') {
    button.disabled = true;
    input.classList.add('is-invalid');
    input.setAttribute('readonly', 'readonly');
    console.log(button);
    feedbackElement.classList.remove('text-success', 'text-danger');
    feedbackElement.innerHTML = null;
  } else {
    button.disabled = false;
    input.removeAttribute('readonly');
    input.classList.remove('is-invalid');
    feedbackElement.classList.add('text-success');
    feedbackElement.textContent = i18next.t('loaded');
    input.value = null;
  }
};

const handleFormState = (form, domElements) => {
  const { valid, error } = form.form;
  return valid ? null : handleError(error, domElements);
};

const handleProcessState = (processState, domElements) => {
  const { status, error } = processState.process;
  switch (status) {
    case 'failed':
      handleError(error, domElements);
      break;
    case 'idle':
      handleProcessStatus('loaded', domElements);
      break;
    case 'loading':
      handleProcessStatus('loading', domElements);
      break;
    default:
      throw new Error(`Unknown processState: ${status}`);
  }
};

// eslint-disable-next-line import/prefer-default-export
export const watchedState = (state, domElements) => onChange(state, (path, value) => {
  switch (path) {
    case 'process.status':
      handleProcessState(state, domElements);
      break;
    case 'modalId.id':
      handleModalView(state);
      break;
    case 'modalReviewed.reviewed':
      handlePostsView(state, domElements);
      break;
    case 'feeds':
      handleFeedsView(value, domElements);
      break;
    case 'posts':
      handlePostsView(state, domElements);
      break;
    case 'form':
      handleFormState(state, domElements);
      break;
    default:
      break;
  }
});
