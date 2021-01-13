/* eslint-disable no-unused-expressions */

import i18next from 'i18next';

const madeTagLiFeeds = (feed) => {
  const { ftitle, fdescription } = feed;
  const li = document.createElement('li');
  li.setAttribute('class', 'list-group-item');
  li.innerHTML = `<h3>${ftitle}</h3><p>${fdescription}</p>`;
  return li;
};

const madeTagLiPosts = (post) => {
  const {
    id, ptitle, link, isReviewed,
  } = post;
  const fontDecoration = isReviewed ? 'normal' : 'bold';
  const li = document.createElement('li');
  li.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-start');
  li.innerHTML = `<a href=${link} class='fw-${fontDecoration} text-decoration-none' data-id=${id} target='_blank' rel='noopener noreferrer'>
      ${ptitle}
    </a>
  <button aria-label="button" type="button" class="btn btn-primary btn-sm" data-id=${id} data-toggle="modal" data-target="#modal">
    Preview
  </button>`;
  return li;
};

const modalRender = (id, posts) => {
  const commonPost = [...posts].filter((post) => post.id === +id)[0];
  const mtitle = document.querySelector('.modal-title');
  const mbody = document.querySelector('.modal-body');
  const mfooter = document.querySelector('.modal-footer a');
  mtitle.innerHTML = commonPost.ptitle;
  mbody.innerHTML = commonPost.pdescription;
  mfooter.setAttribute('href', commonPost.link);
};

const feedRender = (feed) => {
  const feeds = document.querySelector('div .feeds');
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

const postsRender = (items) => {
  const posts = document.querySelector('div .posts');
  if (posts.textContent !== 'Posts') {
    posts.innerHTML = '<h2>Posts</h2><ul class="list-group"></ul>';
  }
  const postsList = posts.querySelector('ul');
  const postsContent = items.map(madeTagLiPosts);
  postsList.prepend(...postsContent);
};

const errorsRender = (error) => {
  const feedbackElement = document.querySelector('.feedback');
  const input = document.querySelector('input');
  input.removeAttribute('readonly');
  input.classList.add('is-invalid');
  feedbackElement.classList.remove('text-success');
  feedbackElement.classList.add('text-danger');
  feedbackElement.innerHTML = i18next.t(`errors.${error}`);
};

const processRender = (fbvalue) => {
  const feedbackElement = document.querySelector('.feedback');
  const input = document.querySelector('input');
  if (fbvalue === 'loading') {
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
  errorsRender, feedRender, modalRender, postsRender, processRender,
};
