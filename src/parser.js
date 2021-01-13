export default (rssData, commonId, commonLink) => {
  const domparser = new DOMParser();
  const parsedRssData = domparser.parseFromString(rssData, 'text/xml');
  const catchDataError = (data) => {
    const errTag = data.querySelector('parsererror');
    if (errTag) {
      throw new Error('dataError');
    }
  };
  catchDataError(parsedRssData);
  let idCount = commonId;
  const feedId = idCount;
  const ftitle = parsedRssData.querySelector('channel > title').textContent;
  const fdescription = parsedRssData.querySelector('channel > description').textContent;
  const postContent = parsedRssData.querySelectorAll('item');
  const feed = {
    feedId, ftitle, fdescription, commonLink,
  };
  const posts = [...postContent].map((post) => {
    idCount += 1;
    const link = post.querySelector('item > link').textContent;
    const ptitle = post.querySelector('item > title').textContent;
    const pdescription = post.querySelector('item > description').textContent;
    return {
      id: idCount, ptitle, pdescription, link, isReviewed: false, feedId,
    };
  });
  return { feed, posts };
};
