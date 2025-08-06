const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.flipkart.com';

const fetchFlipkartMobileFull = async (req, res) => {
  try {
    const categoryUrl = `${BASE_URL}/search?q=mobiles`;
    const categoryRes = await axios.get(categoryUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    const $ = cheerio.load(categoryRes.data);
    const productLinks = [];
    $('a.tUxRFh').each((i, el) => {
      const relativeLink = $(el).attr('href');
      if (relativeLink && relativeLink.startsWith('/')) {
        const fullLink = BASE_URL + relativeLink.split('?')[0]; 
        productLinks.push(fullLink);
      }
    });
    console.log(`Found ${productLinks.length} product links.`);
    const detailedProducts = await Promise.all(
      productLinks.slice(0, 10).map(async (url) => {
        try {
          const productRes = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0'
            }
          });
          const $$ = cheerio.load(productRes.data);
          const title = $$('span.B_NuCI').text().trim();
          const price = $$('div._30jeq3._16Jk6d').first().text().trim();
          const rating = $$('div._3LWZlK').first().text().trim();
          const description = $$('div._1mXcCf').text().trim();
          const specs = [];
          $$('table._14cfVK tr').each((i, row) => {
            const key = $$(row).find('td._1hKmbr').text().trim();
            const value = $$(row).find('td.URwL2w').text().trim();
            if (key && value) specs.push({ key, value });
          });
          return {
            url,
            title,
            price,
            rating,
            description,
            specs
          };
        } catch (err) {
          console.error(`Error fetching product: ${url}`);
          return { url, error: 'Failed to fetch product details' };
        }
      })
    );
    res.status(200).json({
      message: 'Full product details scraped successfully',
      count: detailedProducts.length,
      products: detailedProducts
    });
  } catch (error) {
    console.error('Failed to scrape Flipkart:', error.message);
    res.status(500).json({ error: 'Failed to scrape Flipkart full product details' });
  }
};

module.exports = {
  fetchFlipkartMobileFull
};
