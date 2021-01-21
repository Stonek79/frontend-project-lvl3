/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import find from 'lodash/find';
import differenceBy from 'lodash/differenceBy';
import i18next from 'i18next';
import uniqueId from 'lodash/uniqueId';
import parseRssData from './parser.js';
import getRssData from './getter.js';
import resources from './resources.js';
import { watchedState } from './watchers.js';

export default () => {
  const state = {
    form: {
      status: 'filling',
      valid: true,
      error: '',
    },
    process: {
      status: 'idle',
      error: '',
    },
    modalReviewed: {
      reviewed: new Set([]),
    },
    modalId: {
      id: '',
    },
    feeds: [],
    posts: [],
  };

  yup.setLocale({
    mixed: {
      default: 'ValidationError',
      notOneOf: 'alreadyExist',
    },
    string: {
      url: 'mustValid',
    },
  });

  const watchElements = {
    feeds: document.querySelector('.feeds'),
    feedbackElement: document.querySelector('.feedback'),
    form: document.querySelector('.rss-form'),
    input: document.querySelector('input'),
    posts: document.querySelector('.posts'),
    postsContainer: document.querySelector('.posts'),
  };

  const handleFormEvent = (watcher, url) => {
    watcher.process.status = 'loading';
    getRssData(url)
      .then((rssData) => {
        const parsed = parseRssData(rssData.contents);
        const { feed, posts } = parsed;
        feed.url = url;
        feed.feedId = uniqueId();
        const feedPosts = posts.map((post) => ({ ...post, linkedId: feed.feedId, id: uniqueId() }));

        watcher.posts.unshift(...feedPosts);
        watcher.feeds.unshift(feed);
        watcher.form = { status: 'filling', valid: true, error: null };
        watcher.process.status = 'idle';
      })
      .catch((err) => {
        watcher.process.error = err.message === 'Network Error' ? 'neterror' : err.message;
        watcher.process.status = 'failed';
      });
  };

  const watchAddedFeeds = (watcher) => {
    const { feeds, posts } = watcher;
    const feedUrl = feeds.map((feed) => feed.url);
    const postsPromises = feedUrl.map((url) => getRssData(url)
      .then((commonRssUrlData) => {
        const commonFeedId = find(feeds, ['url', url]).feedId;
        const rssParsedData = parseRssData(commonRssUrlData.contents);
        const diffPosts = differenceBy(rssParsedData.posts, posts, 'postLink')
          .map((post) => ({ ...post, linkedId: commonFeedId, id: uniqueId() }));
        watcher.posts.unshift(...diffPosts);
      }));
    Promise.all(postsPromises).finally(setTimeout(() => watchAddedFeeds(watcher), 5000))
      .catch((err) => console.error(err));
  };

  const validateUrl = (url, feeds) => {
    const links = feeds.map((feed) => feed.url);
    const schema = yup.string().url().notOneOf(links).required();
    try {
      schema.validateSync(url);
    } catch (err) {
      return err.message;
    }
    return null;
  };

  const watcher = watchedState(state, watchElements);

  i18next
    .init({
      lng: 'en',
      debug: false,
      resources,
    })
    .then(() => {
      watchElements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const validationError = validateUrl(url, watcher.feeds);
        if (validationError) {
          watcher.form = { status: 'failed', valid: false, error: validationError };
        } else {
          watcher.form = { status: 'filling', valid: true, error: null };
          handleFormEvent(watcher, url);
        }
      });

      watchElements.postsContainer.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (!id) return;
        watcher.modalReviewed.reviewed.add(id);
        watcher.modalId.id = id;
      });
      setTimeout(() => watchAddedFeeds(watcher, 5000));
    });
};
