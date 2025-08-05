const axios = require('axios');
require('dotenv').config(); 
const fetchMutualFundNAV = async (req, res) => {
  const schemeCode = req.params.scheme;
  const options = {
    method: 'GET',
    url: 'https://nav-indian-mutual-fund.p.rapidapi.com/nav',
    params: { scheme_code: schemeCode },
    headers: {
      'x-rapidapi-host': process.env.RAPIDAPI_HOST,
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
    }
  };
  try {
    const response = await axios.request(options);
    res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error fetching NAV:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NAV',
      error: error.message
    });
  }
};

module.exports = { fetchMutualFundNAV };
