import i18next from 'i18next';
import onChange from 'on-change';
import resources from './resources.js';
import {
  errorsFeedbackRender, postsFormRender, feedFormRender, modalFormRender,
} from './renders.js';
import {
  formStatusHandler, addNewRss, runRssWatcher, madeNormalLinkFont,
} from './watch.js';
import getter from './getter.js';

export default () => {
  i18next
    .init({
      lng: 'en',
      debug: true,
      resources,
    });

  const state = {
    form: {
      status: 'filling',
      link: '',
    },
    processState: 'idle',
    modalId: '',
    error: '',
    links: [],
    feeds: [],
    posts: [],
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'modalId':
        modalFormRender(value, state.posts);
        break;
      case 'feeds':
        feedFormRender(value);
        break;
      case 'posts':
        postsFormRender(value);
        break;
      case 'error':
        errorsFeedbackRender(value);
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
    const commonLink = watchedElements.input.value;
    watchedState.form.link = commonLink;
    watchedState.form.status = 'sending';
    formStatusHandler(commonLink, watchedState);

    if (watchedState.processState !== 'inProgress') return;
    getter(commonLink)
      .then((data) => {
        if (data.name === 'Error') {
          throw new Error(data.message);
        }
        addNewRss(commonLink, watchedState, data);
      })
      .catch((err) => {
        watchedState.error = err.message;
        watchedState.processState = 'idle';
      });
  });

  watchedElements.preview.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    if (!id) return;
    const { posts } = watchedState;
    const postsWithNormalFontLink = madeNormalLinkFont(id, posts);
    watchedState.posts = postsWithNormalFontLink;
    watchedState.modalId = id;
    e.preventDefault();
  });

  setTimeout(() => runRssWatcher(watchedState), 5000);
};
