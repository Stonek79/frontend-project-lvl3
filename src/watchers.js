/* eslint-disable no-param-reassign, no-console  */
import onChange from 'on-change';
import i18next from 'i18next';
import find from 'lodash/find';
import DOMPurify from 'dompurify';
import { processStatus } from './constants';

const createLiFeedElement = (feed) => {
  const { feedTitle, feedDescription } = feed;
  return `<li class="list-group-item">
    <h3>${feedTitle}</h3>
    <p>${feedDescription}</p>
  </li>`;
};

const createLiPostElement = (post, viewed) => {
  const { id, postTitle, postLink } = post;
  const fontDecoration = viewed.has(id) ? 'font-weight-normal' : 'font-weight-bold';
  return `<li class="list-group-item d-flex justify-content-between align-items-start">
    <a href=${postLink} class="${fontDecoration}" data-id=${id} target="_blank" rel="noopener noreferrer">${postTitle}</a>
    <button type="button" class="btn btn-primary btn-sm" data-id=${id} data-toggle="modal" data-target="#modal">${i18next.t('buttons.preview')}</button>
  </li>`;
};

export default (state, domElements) => onChange(state, (path) => {
  const {
    feedbackElement, input, rssSubmitButton, feedsContainer, postsContainer,
  } = domElements;

  const handleModal = (commonState) => {
    const { posts } = commonState;
    const { modalId } = commonState;
    const commonPost = find(posts, ['id', modalId]);
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const modalFooter = document.querySelector('.full-article');
    modalTitle.textContent = commonPost.postTitle;
    modalBody.textContent = commonPost.postDescription;
    modalFooter.href = commonPost.postLink;
  };

  const handleFeeds = (commonState) => {
    const { feeds } = commonState;
    const feedsContent = feeds.map(createLiFeedElement).join('');
    const feedsString = `<h2>${i18next.t('headings.feeds')}</h2>
    <ul class="list-group mb-5">${feedsContent}</ul>`;
    feedsContainer.innerHTML = DOMPurify.sanitize(feedsString);
  };

  const handlePosts = (commonState) => {
    const { posts } = commonState;
    const { viewedPostIds } = commonState;
    const postsContent = posts.map((post) => createLiPostElement(post, viewedPostIds)).join('');
    const postsString = `<h2>${i18next.t('headings.posts')}</h2>
    <ul class="list-group">${postsContent}</ul>`;
    postsContainer.innerHTML = DOMPurify.sanitize(postsString);
  };

  const handleError = (error) => {
    if (!error) return;
    rssSubmitButton.removeAttribute('disabled');
    input.removeAttribute('readonly');
    input.classList.add('is-invalid');
    input.select();
    feedbackElement.classList.remove('text-success');
    feedbackElement.classList.add('text-danger');
    feedbackElement.textContent = i18next.t(`errors.${error}`);
  };

  const handleProcessStatus = (commonState) => {
    const { status, error } = commonState.process;
    switch (status) {
      case processStatus.loading:
        rssSubmitButton.setAttribute('disabled', true);
        input.setAttribute('readonly', 'readonly');
        feedbackElement.classList.remove('text-success', 'text-danger');
        feedbackElement.innerHTML = null;
        break;
      case processStatus.idle:
        rssSubmitButton.removeAttribute('disabled');
        input.removeAttribute('readonly');
        input.classList.remove('is-invalid');
        feedbackElement.classList.add('text-success');
        feedbackElement.textContent = i18next.t('loaded');
        input.value = null;
        input.focus();
        break;
      case processStatus.failed:
        handleError(error);
        break;
      default:
        throw new Error(`Unknown processStatus: ${status}`);
    }
  };

  switch (path) {
    case 'process.status':
      handleProcessStatus(state);
      break;
    case 'modalId':
      handleModal(state);
      break;
    case 'feeds':
      handleFeeds(state);
      break;
    case 'viewedPostIds':
    case 'posts':
      handlePosts(state);
      break;
    case 'form':
      handleError(state.form.error);
      break;
    default:
      break;
  }
});
