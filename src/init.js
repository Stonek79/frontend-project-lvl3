import i18next from 'i18next';
import onChange from 'on-change';
import resources from './resources.js';
import {
  errorsRender, postsRender, feedRender, modalRender,
} from './renders.js';
import {
  formStatusErrorCatcher, addedFeedsWatcher, madeNormalLinkFont,
} from './watch.js';
import getRssData from './getter.js';
import parser from './parser.js';

export default () => {
  const state = {
    form: {
      status: 'filling',
      link: '',
    },
    processState: 'idle',
    openedModalId: '',
    error: [],
    links: [],
    feeds: [],
    posts: [],
  };

  const watchedElements = {
    button: document.querySelector('[type="submit"]'),
    preview: document.querySelector('div .posts'),
    input: document.querySelector('input'),
  };

  i18next
    .init({
      lng: 'en',
      debug: false,
      resources,
    })
    .then(() => {
      const watchedState = onChange(state, (path, value) => {
        switch (path) {
          case 'openedModalId':
            modalRender(value, state.posts);
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

      watchedElements.button.addEventListener('click', (e) => {
        e.preventDefault();
        const commonLink = watchedElements.input.value;
        watchedState.form.link = commonLink;
        watchedState.form.status = 'sending';
        formStatusErrorCatcher(commonLink, watchedState);

        if (watchedState.processState !== 'inProgress') return;

        getRssData(commonLink)
          .then((data) => {
            const commonId = watchedState.posts.length === 0 ? 1
              : Math.max(...watchedState.posts.map((post) => post.id)) + 1;
            const { feed, commonPosts } = parser(data.contents, commonId);
            watchedState.posts.unshift(...commonPosts);
            watchedState.feeds.unshift(feed);
            watchedState.links.push(commonLink);
            watchedState.processState = 'idle';
          })
          .catch((err) => {
            watchedState.processState = 'idle';
            watchedState.error.unshift(err.message);
          });
      });

      watchedElements.preview.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (!id) return;
        const { posts } = watchedState;
        const postsWithNormalFontLink = madeNormalLinkFont(id, posts);
        watchedState.posts = postsWithNormalFontLink;
        watchedState.openedModalId = id;
        e.preventDefault();
      });

      setTimeout(() => addedFeedsWatcher(watchedState), 5000);
    });
};
