const axios = require('axios');

const fetchFlipkartMobiles = async (req, res) => {
  try {
    const response = await axios.get('https://flipkart-apis.p.rapidapi.com/backend/rapidapi/category-products-list?categoryID=axc&page=1', {
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': process.env.FLIPCART_API_HOST
      }
    });

    const products = response.data.products || [];

    res.status(200).json({
      message: 'Mobile products fetched successfully from Flipkart',
      count: products.length,
      products: products
    });
  } catch (error) {
    console.error('Error fetching Flipkart mobiles:', error.message);
    res.status(500).json({ error: 'Failed to fetch Flipkart mobile products' });
  }
};

module.exports = {
  fetchFlipkartMobiles
};
