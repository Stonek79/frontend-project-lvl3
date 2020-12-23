/* eslint-disable no-unused-expressions */

import i18next from 'i18next';

const madeLiFeeds = (feed) => {
  const { ftitle, fdescription } = feed;
  const li = document.createElement('li');
  li.setAttribute('class', 'list-group-item');
  li.innerHTML = `<h3>${ftitle}</h3><p>${fdescription}</p>`;
  return li;
};

const madeLiPost = (post) => {
  const { id, ptitle, link } = post;
  const li = document.createElement('li');
  li.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-start');
  li.innerHTML = `<a style='font-weight: bold' href=${link} data-id=${id} target='_blank'>${ptitle}</a>
  <button type="button" class="btn btn-primary btn-sm" data-id=${id} data-toggle="modal" data-target="#modal">
    Preview
  </button>`;
  return li;
};

export const modalRender = (id, watchedState) => {
  const { posts } = watchedState;
  const commonPost = [...posts].filter((post) => post.id === +id);
  const mtitle = document.querySelector('.modal-title');
  const mbody = document.querySelector('.modal-body');
  const mfooter = document.querySelector('.modal-footer a');
  mtitle.innerHTML = commonPost[0].ptitle;
  mbody.innerHTML = commonPost[0].pdescription;
  mfooter.setAttribute('href', commonPost[0].link);
  document.querySelector(`[data-id="${id}"]`).setAttribute('style', 'font-weight: normal');
};

export const feedRender = (watchedState) => {
  const feed = watchedState.feeds;
  const feeds = document.querySelector('div .feeds');
  const input = document.querySelector('input');
  const feedbackElement = document.querySelector('.feedback');
  feeds.innerHTML = '<h2>Feeds</h2><ul class="list-group mb-5"></ul>';

  const feedsList = feeds.querySelector('ul');
  const feedsContent = feed.map(madeLiFeeds);
  feedsList.prepend(...feedsContent);

  input.classList.remove('is-invalid');
  feedbackElement.classList.remove('text-danger');
  feedbackElement.classList.add('text-success');
  feedbackElement.innerHTML = i18next.t('loaded');
  input.value = null;
};

export const postsRender = (items) => {
  const posts = document.querySelector('div .posts');
  if (posts.textContent !== 'Posts') {
    posts.innerHTML = '<h2>Posts</h2><ul class="list-group"></ul>';
  }
  const postsList = posts.querySelector('ul');
  const postsContent = items.map(madeLiPost);
  postsList.prepend(...postsContent);
};

export const errorsRender = (watchedState) => {
  const { error } = watchedState;
  const feedbackElement = document.querySelector('.feedback');
  const input = document.querySelector('input');
  input.classList.add('is-invalid');
  feedbackElement.classList.remove('text-success');
  feedbackElement.classList.add('text-danger');
  feedbackElement.innerHTML = i18next.t(`errors.${error}`);
  input.value = null;
};
