/* eslint-disable no-unused-expressions */

import i18next from 'i18next';
import find from 'lodash/find';

const madeTagLiFeeds = (feed) => {
  const { title, description } = feed;
  const li = document.createElement('li');
  li.setAttribute('class', 'list-group-item');
  li.innerHTML = `<h3>${title}</h3><p>${description}</p>`;
  return li;
};

const madeTagLiPosts = (post, viewed) => {
  const {
    id, title, link,
  } = post;
  const fontDecoration = viewed.includes(id) ? 'normal' : 'bold';
  const li = document.createElement('li');
  li.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-start');
  li.innerHTML = `<a href=${link} class='fw-${fontDecoration} text-decoration-none' data-id=${id} target='_blank' rel='noopener noreferrer'>
      ${title}
    </a>
  <button aria-label="button" type="button" class="btn btn-primary btn-sm" data-id=${id} data-toggle="modal" data-target="#modal">
    Preview
  </button>`;
  return li;
};

const madeModalView = (state) => {
  const { posts } = state;
  const { id } = state.reviewedModalId;
  const commonPost = find(posts, ['id', id]);
  const mtitle = document.querySelector('.modal-title');
  const mbody = document.querySelector('.modal-body');
  const mfooter = document.querySelector('.modal-footer a');
  mtitle.innerHTML = commonPost.title;
  mbody.innerHTML = commonPost.description;
  mfooter.setAttribute('href', commonPost.link);
};

const madeFeedsView = (feed) => {
  const feeds = document.querySelector('.feeds');
  const input = document.querySelector('input');
  const feedbackElement = document.querySelector('.feedback');
  feeds.innerHTML = '<h2>Feeds</h2><ul class="list-group mb-5"></ul>';
  const feedsList = feeds.querySelector('ul');
  const feedsContent = feed.map(madeTagLiFeeds);
  feedsList.prepend(...feedsContent);

  input.classList.remove('is-invalid');
  feedbackElement.classList.remove('text-danger');
  feedbackElement.classList.add('text-success');
  feedbackElement.innerHTML = i18next.t('loaded');
  input.value = null;
};

const madePostsView = (state) => {
  const items = state.posts;
  const { reviewed } = state.reviewedModalId;
  const posts = document.querySelector('.posts');
  if (posts.textContent !== 'Posts') {
    posts.innerHTML = '<h2>Posts</h2><ul class="list-group"></ul>';
  }
  const postsList = posts.querySelector('ul');
  const postsContent = items.map((item) => madeTagLiPosts(item, reviewed));
  postsList.prepend(...postsContent);
};

const madeErrorView = (error) => {
  const feedbackElement = document.querySelector('.feedback');
  const input = document.querySelector('input');
  input.removeAttribute('readonly');
  input.classList.add('is-invalid');
  feedbackElement.classList.remove('text-success');
  feedbackElement.classList.add('text-danger');
  feedbackElement.innerHTML = i18next.t(`errors.${error}`);
};

const handleProcessStatus = (status) => {
  const feedbackElement = document.querySelector('.feedback');
  const input = document.querySelector('input');
  if (status === 'loading') {
    input.classList.add('is-invalid');
    input.setAttribute('readonly', 'readonly');
    feedbackElement.classList.remove('text-success');
    feedbackElement.classList.remove('text-danger');
    feedbackElement.innerHTML = null;
  } else {
    input.removeAttribute('readonly');
    input.classList.remove('is-invalid');
    feedbackElement.classList.add('text-success');
    feedbackElement.innerHTML = i18next.t('loaded');
  }
};

export {
  madeErrorView, madeFeedsView, madeModalView, madePostsView, handleProcessStatus,
};
