/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import find from 'lodash/find';
import differenceBy from 'lodash/differenceBy';
import i18next from 'i18next';
import uniqueId from 'lodash/uniqueId';
import Axios from 'axios';
import parseRssData from './parser.js';
import resources from './resources.js';
import watchState from './watchers.js';
import { formStatusConst, netConst, processStatusConst } from './constants.js';

const getRssData = (url) => Axios(`${netConst.proxy}/get?disableCache=true&url=${url}`)
  .then((response) => response.data);

const handleFormEvent = (watcher, url) => {
  watcher.process.status = processStatusConst.loading;
  return getRssData(url)
    .then((rssData) => {
      const parsed = parseRssData(rssData.contents);
      const { feed, posts } = parsed;
      feed.url = url;
      feed.feedId = uniqueId();
      const feedPosts = posts.map((post) => ({ ...post, linkedId: feed.feedId, id: uniqueId() }));

      watcher.posts.unshift(...feedPosts);
      watcher.feeds.unshift(feed);
      watcher.form = { status: formStatusConst.filling, valid: true, error: null };
      watcher.process.status = processStatusConst.idle;
    })
    .catch((err) => {
      watcher.process.error = err.message === 'dataError' ? 'dataError' : 'netError';
      watcher.process.status = processStatusConst.failed;
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

export default () => {
  const state = {
    viewedPostsId: new Set([]),
    modalId: '',
    feeds: [],
    posts: [],
    form: {
      status: formStatusConst.filling,
      valid: true,
      error: '',
    },
    process: {
      status: processStatusConst.idle,
      error: '',
    },
  };

  yup.setLocale({
    mixed: {
      default: 'ValidationError',
      notOneOf: 'alreadyExist',
    },
    string: {
      url: 'mustBeValid',
    },
  });

  const watchElements = {
    button: document.querySelector('[type="submit"]'),
    feeds: document.querySelector('.feeds'),
    feedbackElement: document.querySelector('.feedback'),
    form: document.querySelector('.rss-form'),
    input: document.querySelector('input'),
    posts: document.querySelector('.posts'),
    postsContainer: document.querySelector('.posts'),
  };

  const watcher = watchState(state, watchElements);

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
          watcher.form = { status: formStatusConst.failed, valid: false, error: validationError };
        } else {
          watcher.form = { status: formStatusConst.filling, valid: true, error: null };
          handleFormEvent(watcher, url);
        }
      });

      watchElements.postsContainer.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (!id) return;
        watcher.viewedPostsId.add(id);
        watcher.modalId = id;
      });
    });
  setTimeout(() => watchAddedFeeds(watcher), 5000);
};
