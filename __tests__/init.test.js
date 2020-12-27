import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';
import nock from 'nock';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/dom';
import start from '../src/init.js';

const rssPath = path.join(__dirname, '../__fixtures__/testsrss.xml');
const rssData = fs.readFileSync(rssPath, 'utf-8');
const rssUrl = 'https://ru.hexlet.io/lessons.rss';

const index = path.join(__dirname, '../__fixtures__/index.html');
const initHtml = fs.readFileSync(index, 'utf-8');

// nock.disableNetConnect();

const tags = {};

beforeEach(async () => {
  document.body.innerHTML = initHtml;
  await start();
  tags.input = screen.getByPlaceholderText('RSS link');
  tags.submit = screen.getByLabelText('add');
});

test('addRSS', async () => {
  userEvent.type(tags.input, rssUrl);
  userEvent.click(tags.submit);
  nock(`${rssUrl}`)
    .persist()
    .get('/')
    .reply(200, rssData);

  // const feedback = document.querySelector('.feedback');
  // const feeds = document.querySelector('.feeds');

  await waitFor(() => {
    // console.log('feeds', feedback.innerHTML, feeds.innerHTML);
    const data = screen.getByText(/RSS has been loaded/i);
    expect(data).toBeInTheDocument();
  });
});

test('already exist', async () => {
  userEvent.type(tags.input, rssUrl);
  userEvent.click(tags.submit);
  nock(`${rssUrl}`)
    .persist()
    .get('/')
    .reply(200, rssData);
  await waitFor(() => {
    const data = screen.getByText(/RSS has been loaded/i);
    expect(data).toBeInTheDocument();
  });

  userEvent.type(tags.input, rssUrl);
  userEvent.click(tags.submit);

  await waitFor(() => {
    const data = screen.getByText(/RSS already exist/i);
    expect(data).toBeInTheDocument();
  });
});

test('mast valid', () => {
  userEvent.type(tags.input, 'mastValid');
  userEvent.click(tags.submit);
  expect(screen.getByText(/Must be valid URL/i)).toBeInTheDocument();
});

test('empty input', () => {
  userEvent.type(tags.input, '');
  userEvent.click(tags.submit);
  expect(screen.getByText(/Please, add RSS link/i)).toBeInTheDocument();
});
