/* eslint-disable no-unused-expressions */
import i18next from 'i18next';
import resources from './i18next.js';

const run18 = async () => {
  await i18next.init({
    lng: 'en',
    debug: true,
    resources,
  });
};
run18();

const feeds = document.querySelector('div .feeds');
const posts = document.querySelector('div .posts');
const input = document.querySelector('input');
const feedbackElement = document.querySelector('.feedback');

const madeFeedsForm = () => {
  const h2 = document.createElement('h2');
  h2.textContent = 'Feeds';
  feeds.append(h2);
  const ul = document.createElement('ul');
  ul.setAttribute('class', 'list-group mb-5');
  feeds.append(ul);
};

const madePostsForm = () => {
  const h2 = document.createElement('h2');
  h2.textContent = 'Posts';
  posts.append(h2);
  const ul = document.createElement('ul');
  ul.setAttribute('class', 'list-group');
  posts.append(ul);
};

const madeLiFeeds = (title, desc) => {
  const li = document.createElement('li');
  li.setAttribute('class', 'list-group-item');
  const h3 = document.createElement('h3');
  const p = document.createElement('p');
  h3.innerHTML = `${title}`;
  p.innerHTML = `${desc}`;
  li.append(h3);
  li.append(p);
  return li;
};

const madeLiPost = (post) => {
  const {
    id, ptitle, pdescription, link,
  } = post;
  const li = document.createElement('li');
  li.setAttribute('class', 'list-group-item d-flex justify-content-between align-items-start');
  li.innerHTML = `<button type="button" class="btn btn-primary btn-sm" data-id=${id} data-toggle="modal" data-target="#modal">
    Preview
  </button>`;
  const a = document.createElement('a');
  a.setAttribute('style', 'font-weight: bold');
  a.setAttribute('href', `${link}`);
  a.setAttribute('data-id', `${id}`);
  a.setAttribute('data-desc', `${pdescription}`);
  a.setAttribute('target', '_blank');
  a.innerHTML = ptitle;
  li.prepend(a);
  return li;
};

export const modalRender = (id) => {
  const modal = document.querySelector(`[data-id="${id}"]`);
  const mtitle = document.querySelector('.modal-title');
  const mbody = document.querySelector('.modal-body');
  const mfooter = document.querySelector('.modal-footer a');
  mtitle.innerHTML = modal.innerText;
  mbody.innerHTML = modal.dataset.desc;
  mfooter.setAttribute('href', modal.href);
  modal.setAttribute('style', 'font-weight: normal');
};

export const render = (feed, items) => {
  if (!feeds.hasChildNodes()) {
    madeFeedsForm();
  }
  if (!posts.hasChildNodes()) {
    madePostsForm();
  }
  const feedsList = feeds.querySelector('ul');
  const postsList = posts.querySelector('ul');
  feedsList.prepend(madeLiFeeds(feed.ftitle, feed.fdescription));

  const postsContent = items[feed.feedId].map(madeLiPost);
  postsList.prepend(...postsContent);

  input.value = null;
  const loadedMessage = resources.translation.loaded;
  feedbackElement.classList.remove('text-loaded');
  feedbackElement.classList.add('text-loaded');
  feedbackElement.innerHTML = loadedMessage;
};

export const renderErrors = (error) => {
  const errorMessage = resources.translation.errors[`${error}`];
  feedbackElement.classList.remove('text-loaded');
  feedbackElement.classList.add('text-error');
  feedbackElement.innerHTML = errorMessage;
  input.value = null;
};
