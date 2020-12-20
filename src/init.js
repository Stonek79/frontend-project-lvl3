import i18next from 'i18next';
import onChange from 'on-change';
import resources from './i18next.js';
import { modalRender, render, renderErrors } from './renders.js';
import { catchError, parse } from './watch.js';

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
    console.log(state, path, value);
    switch (value) {
      case 'sending':
        catchError(watchedState);
        break;
      case state.error:
        renderErrors(value);
        break;
      case 'inProcess':
        parse(state.form.link, watchedState);
        break;
      case 'idle':
        render(state.feeds[0], state.posts[0]);
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
    const modal = e.target;
    return modalRender(modal.dataset.id);
  });

  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  })
    .then((t) => { t(); });
};
