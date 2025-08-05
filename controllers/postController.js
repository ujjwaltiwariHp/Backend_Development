const axios = require('axios');

exports.submitPost = async (req, res) => {
  try {
    const data = {
      title: req.body.title,
      body: req.body.body,
      userId: req.body.userId
    };

    const response = await axios.post('https://jsonplaceholder.typicode.com/posts', data);

    res.status(200).json({
      success: true,
      message: 'Data posted successfully!',
      externalResponse: response.data
    });
  } catch (err) {
    console.error('Error posting data:', err.message);
    res.status(500).json({ success: false, message: 'Failed to post data' });
  }
};
