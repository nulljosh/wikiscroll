const API_BASE = 'https://en.wikipedia.org/api/rest_v1';

export async function fetchRandomArticles(count = 5) {
  const articles = [];

  // Fetch multiple random articles in parallel
  const promises = Array.from({ length: count }, () =>
    fetch(`${API_BASE}/page/random/summary`, {
      headers: { 'Accept': 'application/json' },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => ({
        id: data.pageid,
        title: data.title,
        displayTitle: data.displaytitle || data.title,
        extract: data.extract || '',
        extractHtml: data.extract_html || '',
        description: data.description || '',
        thumbnail: data.thumbnail?.source || null,
        originalImage: data.originalimage?.source || null,
        url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
        lang: data.lang || 'en',
        timestamp: data.timestamp || null,
      }))
      .catch(() => null)
  );

  const results = await Promise.all(promises);

  for (const article of results) {
    if (article && article.extract && article.extract.length > 30) {
      articles.push(article);
    }
  }

  return articles;
}
