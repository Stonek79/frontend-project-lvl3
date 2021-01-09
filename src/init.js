import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import resources from './resources.js';
import {
  errorsRender, postsRender, feedRender, modalRender,
} from './renders.js';
import { addedFeedsWatcher, madeNormalLinkFont } from './watch.js';
import getRssData from './getter.js';
import parser from './parser.js';

export default () => {
  const state = {
    form: {
      valid: true,
    },
    processState: 'idle',
    openedModalId: '',
    error: [],
    links: [],
    feeds: [],
    posts: [],
  };

  const watchedElements = {
    form: document.querySelector('.rss-form'),
    postsContainer: document.querySelector('div .posts'),
  };

  const schema = yup.string().url();

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

      const isValid = (link) => {
        const { links } = watchedState;
        const hasRss = links.includes(link);
        const isValidUrl = schema.isValidSync(link);

        if (!isValidUrl) {
          watchedState.form.valid = false;
          watchedState.error.unshift('mustValid');
        } else if (hasRss) {
          watchedState.form.valid = false;
          watchedState.error.unshift('alreadyExist');
        } else {
          watchedState.form.valid = true;
          watchedState.processState = 'inProgress';
        }
      };

      watchedElements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const commonLink = formData.get('url').toString();
        isValid(commonLink);

        if (!watchedState.form.valid) return;

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
            watchedState.error.unshift(err.message);
            watchedState.processState = 'idle';
          });
      });

      watchedElements.postsContainer.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (!id) return;
        const { posts } = watchedState;
        watchedState.posts = madeNormalLinkFont(id, posts);
        watchedState.openedModalId = id;
      });

      setTimeout(() => addedFeedsWatcher(watchedState), 5000);
    });
};
