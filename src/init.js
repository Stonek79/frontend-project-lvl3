import i18next from 'i18next';
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
    error: '',
    links: [],
    feeds: [],
    posts: [],
  };

  const watchedState = onChange(state, (path, value) => {
    // console.log(state, value, previousValue);
    switch (path) {
      case 'form.status':
        formStatusHandler(value, watchedState);
        break;
      case 'processState':
        processStateHandler(value, watchedState);
        break;
      case 'feeds':
        feedRender(watchedState);
        break;
      case 'posts':
        postsRender(value);
        break;
      case 'error':
        errorsRender(watchedState);
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

  watchedElements.preview.addEventListener('click', (e) => modalRender(e.target.dataset.id, watchedState));

  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  })
    .then((t) => { t(); });
};
