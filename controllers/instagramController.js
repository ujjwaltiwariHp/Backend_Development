const axios = require('axios');
require('dotenv').config();

const fetchInstagramUserInfo = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: "Username is required" });
  }

  try {
    const response = await axios.post(
      'https://instagram120.p.rapidapi.com/api/instagram/userInfo',
      { username: username },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': process.env.INSTA_API_HOST
        }
      }
    );

    res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch Instagram userinfo" });
  }
};

module.exports = { fetchInstagramUserInfo };
