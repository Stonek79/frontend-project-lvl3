export default (rssData) => {
  const domparse = new DOMParser();
  const parsedRssData = domparse.parseFromString(rssData, 'text/xml');
  const errTag = parsedRssData.querySelector('parsererror');
  if (errTag) {
    throw new Error('dataError');
  }
  const title = parsedRssData.querySelector('channel > title').textContent;
  const description = parsedRssData.querySelector('channel > description').textContent;
  const items = parsedRssData.querySelectorAll('item');

  return { title, description, items };
};
