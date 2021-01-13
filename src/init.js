/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import i18next from 'i18next';
import onChange from 'on-change';
import { ValidationError } from 'yup';
import resources from './resources.js';
import {
  errorsRender, postsRender, feedRender, modalRender, processRender,
} from './renders.js';
import { addedFeedsWatcher, madeNormalLinkFont } from './watch.js';
import getRssData from './getter.js';
import parser from './parser.js';

export default () => {
  const state = {
    form: {
      state: 'filling',
      valid: true,
      error: '',
    },
    process: {
      status: 'idle',
      error: '',
    },
    reviewedModalId: '',
    feeds: [],
    posts: [],
  };

  const watchedElements = {
    form: document.querySelector('.rss-form'),
    postsContainer: document.querySelector('div .posts'),
  };

  const processHandler = (processState) => {
    const { status, error } = processState.process;
    switch (status) {
      case 'failed':
        errorsRender(error);
        break;
      case 'idle':
        processRender('loaded');
        break;
      case 'loading':
        processRender('loading');
        break;
      default:
        throw new Error(`Unknown processState: ${status}`);
    }
  };

  const formStateHandler = (form) => {
    const { valid, error } = form.form;
    return valid ? null : errorsRender(error);
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
          case 'process.status':
            processHandler(state);
            break;
          case 'reviewedModalId':
            modalRender(value, state.posts);
            break;
          case 'feeds':
            feedRender(value);
            break;
          case 'posts':
            postsRender(value);
            break;
          case 'form':
            formStateHandler(state);
            break;
          default:
            break;
        }
      });

      const validateLink = (link, feeds) => {
        const links = [...feeds].map((feed) => feed.commonLink);
        const schema = yup.string().url().notOneOf(links);
        try {
          return schema.validateSync(link);
        } catch (err) {
          return err;
        }
      };

      const formEventHandler = (watcher, url) => {
        watcher.process.status = 'loading';
        getRssData(url)
          .then((data) => {
            const commonId = watcher.feeds.length + watcher.posts.length + 1;

            const { feed, posts } = parser(data.contents, commonId, url);

            watcher.posts.unshift(...posts);
            watcher.feeds.unshift(feed);
            watcher.form = { state: 'filling', valid: true, error: null };
            watcher.process.status = 'idle';
          })
          .catch((err) => {
            watcher.process.error = err.message;
            watcher.process.status = 'failed';
          });
      };

      watchedElements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const commonLink = formData.get('url');
        const valid = validateLink(commonLink, watchedState.feeds);
        if (valid instanceof ValidationError) {
          const err = valid.message.includes('valid') ? 'mustValid' : 'alreadyExist';
          watchedState.form = { state: 'failed', valid: false, error: err };
        } else {
          watchedState.form = { state: 'filling', valid: true, error: null };
        }

        if (!watchedState.form.valid) return;
        formEventHandler(watchedState, commonLink);
      });

      watchedElements.postsContainer.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (!id) return;
        const { posts } = watchedState;
        watchedState.posts = madeNormalLinkFont(id, posts);
        watchedState.reviewedModalId = id;
      });

      setTimeout(() => addedFeedsWatcher(watchedState), 5000);
    });
};
