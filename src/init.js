import i18next from 'i18next';
import set from 'lodash/set';
import onChange from 'on-change';
import resources from './i18next.js';
import {
  feedRender, modalRender, postsRender, errorsRender,
} from './renders.js';
import { formStatusHandler, processStateHandler } from './watch.js';

export default () => {
  const state = {
    form: {
      status: 'filling',
      link: '',
    },
    processState: 'idle',
    modalState: '',
    error: '',
    links: [],
    feeds: [],
    posts: [],
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.status':
        formStatusHandler(value, watchedState);
        break;
      case 'processState':
        processStateHandler(value, watchedState);
        break;
      case 'modalState':
        modalRender(value, watchedState);
        break;
      case 'feeds':
        feedRender(value);
        break;
      case 'posts':
        postsRender(value);
        break;
      case 'error':
        errorsRender(value);
        break;
      default:
        break;
    }
  });

  const watchedElements = {
    button: document.querySelector('[type="submit"]'),
    preview: document.querySelector('div .posts'),
    input: document.querySelector('input'),
  };

  watchedElements.button.addEventListener('click', (e) => {
    e.preventDefault();
    watchedState.form.link = watchedElements.input.value;
    watchedState.form.status = 'sending';
  });

  watchedElements.preview.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    watchedState.posts.map((post) => (post.id === +id ? set(post, 'font', 'normal') : post));
    watchedState.modalState = id;
  });

  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  })
    .then((t) => { t(); });
};
