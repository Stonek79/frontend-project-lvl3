// @ts-check
import './styles.scss';
import 'bootstrap';
import onChange from 'on-change';
import { catchError, parse } from './watch.js';
import { render, renderErrors, modalRender } from './renders.js';

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
  // console.log(state, path, value);
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

const button = document.querySelector('[type="submit"]');
const preview = document.querySelector('div .posts');
const input = document.querySelector('input');

button.addEventListener('click', (e) => {
  e.preventDefault();
  watchedState.form.link = input.value;
  watchedState.form.status = 'sending';
});

preview.addEventListener('click', (e) => {
  const modal = e.target;
  return modalRender(modal.dataset.id);
});
