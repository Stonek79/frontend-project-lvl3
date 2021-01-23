/* eslint-disable no-param-reassign, no-console  */
import onChange from 'on-change';
import i18next from 'i18next';
import find from 'lodash/find';
import { processStatusConst } from './constants';

const makeLiFeeds = (feed) => {
  const { feedTitle, feedDescription } = feed;
  return `<li class="list-group-item">
    <h3>${feedTitle}</h3>
    <p>${feedDescription}</p>
  </li>`;
};

const makeLiPosts = (post, viewed) => {
  const { id, postTitle, postLink } = post;
  const fontDecoration = viewed.has(id) ? 'normal' : 'bold';
  return `<li class="list-group-item d-flex justify-content-between align-items-start">
    <a href=${postLink} class='fw-${fontDecoration} text-decoration-none' data-id=${id} target='_blank' rel='noopener noreferrer' role="link">${postTitle}</a>
    <button aria-label="button" type="button" class="btn btn-primary btn-sm" data-id=${id} data-toggle="modal" data-target="#modal">${i18next.t('buttons.preview')}</button>
  </li>`;
};

export default (state, domElements) => onChange(state, (path, value) => {
  const handleModalView = (commonState) => {
    const { posts } = commonState;
    const id = commonState.modalId;
    const commonPost = find(posts, ['id', id]);
    const mtitle = document.querySelector('.modal-title');
    const mbody = document.querySelector('.modal-body');
    const mfooter = document.querySelector('.full-article');
    mtitle.textContent = commonPost.postTitle;
    mbody.textContent = commonPost.postDescription;
    mfooter.href = commonPost.postLink;
  };

  const handleFeedsView = (feed) => {
    const { feeds } = domElements;
    const feedsContent = feed.map(makeLiFeeds).join('');
    feeds.innerHTML = `<h2>${i18next.t('headings.feeds')}</h2><ul class="list-group mb-5">${feedsContent}</ul>`;
  };

  const handlePostsView = (commonState) => {
    const { posts } = domElements;
    const items = commonState.posts;
    const viewedPostsID = commonState.viewedPostsId;
    const postsContent = items.map((item) => makeLiPosts(item, viewedPostsID)).join('');
    posts.innerHTML = `<h2>${i18next.t('headings.posts')}</h2><ul class="list-group">${postsContent}</ul>`;
  };

  const handleError = (error) => {
    const { feedbackElement, input, button } = domElements;
    button.removeAttribute('disabled');
    input.removeAttribute('readonly');
    input.classList.add('is-invalid');
    feedbackElement.classList.remove('text-success');
    feedbackElement.classList.add('text-danger');
    feedbackElement.textContent = i18next.t(`errors.${error}`);
  };

  const handleProcessStatus = (status) => {
    const { feedbackElement, input, button } = domElements;
    switch (status) {
      case processStatusConst.loading:
        button.setAttribute('disabled', true);
        input.classList.add('is-invalid');
        input.setAttribute('readonly', 'readonly');
        feedbackElement.classList.remove('text-success', 'text-danger');
        feedbackElement.innerHTML = null;
        break;
      case processStatusConst.idle:
        button.removeAttribute('disabled');
        input.removeAttribute('readonly');
        input.classList.remove('is-invalid');
        feedbackElement.classList.add('text-success');
        feedbackElement.textContent = i18next.t('loaded');
        input.value = null;
        break;
      default:
        throw new Error(`Unknown processStatus: ${status}`);
    }
  };

  const handleFormState = (form) => {
    const { valid, error } = form.form;
    return valid ? null : handleError(error);
  };

  const handleProcessState = (processState) => {
    const { status, error } = processState.process;
    switch (status) {
      case processStatusConst.failed:
        handleError(error);
        break;
      case processStatusConst.idle:
      case processStatusConst.loading:
        handleProcessStatus(status);
        break;
      default:
        throw new Error(`Unknown processState: ${status}`);
    }
  };

  switch (path) {
    case 'process.status':
      handleProcessState(state);
      break;
    case 'modalId':
      handleModalView(state);
      break;
    case 'viewedPostsId':
      handlePostsView(state);
      break;
    case 'feeds':
      handleFeedsView(value);
      break;
    case 'posts':
      handlePostsView(state);
      break;
    case 'form':
      handleFormState(state);
      break;
    default:
      break;
  }
});
