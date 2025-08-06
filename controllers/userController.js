const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../database/db');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const registerUser = async (req, res) => {
  const { username, email, password, confirmPassword, first_name, last_name } = req.body;

  // Check for required fields
  if (!username || !email || !password || !confirmPassword || !first_name || !last_name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    // Check for existing user
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const newUser = await pool.query(
      `INSERT INTO users (username, email, password, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, first_name, last_name, created_at`,
      [username, email, hashedPassword, first_name, last_name]
    );

     const msg = {
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'Welcome to HangingPanda',
      text: `Hi ${first_name},\n\nThanks for registering with us!\n\n— With regards,\nHangingPanda`,
      html: `<p>Hi <strong>${first_name}</strong>,</p><p>Thanks for registering with us!</p><p>— With regards,<br>HangingPanda</p>`,
    };

    await sgMail.send(msg);

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser.rows[0],
    });

  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save token in DB
    await pool.query(
      `INSERT INTO access_tokens (user_id, token, expiry) VALUES ($1, $2, $3)`,
      [user.id, token, expiryDate]
    );

    // Store session info
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    res.status(200).json({
      message: 'Login successful',
      access_token: token,
      session_user: req.session.user 
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await pool.query('SELECT id, username, email, first_name, last_name, created_at FROM users');
    res.json(users.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await pool.query('SELECT id, username, email, first_name, last_name FROM users WHERE id = $1', [id]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const getPaginatedUsers = async (req, res) => {
  const page = parseInt(req.params.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  try {
    const result = await pool.query(
      `SELECT id, username, email, first_name, last_name, created_at
       FROM users
       WHERE username ILIKE $1
       ORDER BY id
       LIMIT $2 OFFSET $3`,
      [`%${search}%`, Number(limit), Number(offset)]
    );

    res.status(200).json({
      page,
      search,
      users: result.rows,
    });
  } catch (err) {
    console.error('Pagination error:', err.message);
    res.status(500).json({ error: 'Failed to fetch paginated users' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3 RETURNING id, username, email, first_name, last_name',
      [first_name, last_name, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

const getUserWithAddresses = async (req, res) => {
  const userId = req.params.id;

  try {
    const userResult = await pool.query(
      `SELECT id, username, email, first_name, last_name, created_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const addressResult = await pool.query(
      `SELECT id, address, city, state, pin_code, phone_no, created_at
       FROM address
       WHERE user_id = $1`,
      [userId]
    );

    res.json({
      user: userResult.rows[0],
      addresses: addressResult.rows
    });

  } catch (err) {
    console.error('User/address fetch error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '10m' });
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2, reset_token_used = FALSE WHERE email = $3',
      [resetToken, expiryTime, email]
    );

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`; 
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'Password Reset Request',
      text: `Hi ${user.first_name},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nThis link expires in 10 minutes.`,
      html: `
        <p>Hi <strong>${user.first_name}</strong>,</p>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <a href="${resetLink}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
      `
    };

    await sgMail.send(msg);
    return res.json({ message: 'Password reset token generated', resetToken });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

  const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    // Check token in DB
    const userRes = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND reset_token = $2 AND reset_token_used = FALSE',
      [email, token]
    );
    const user = userRes.rows[0];
    if (!user) return res.status(400).json({ message: 'Invalid or already used token' });

    const now = new Date();
    if (now > new Date(user.reset_token_expiry)) {
      return res.status(400).json({ message: 'Token expired' });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = $1, reset_token_used = TRUE WHERE email = $2',
      [hashedPassword, email]
    );

     await sendEmail({
       to: user.email,
       subject: 'Your Password Has Been Reset',
       text: `Hello ${user.first_name}, your password has been successfully reset.`,
       html: `<h3>Password Reset Successful</h3><p>Your password was changed successfully.</p>`,
   });
     return res.json({ message: 'Password successfully reset' }); 
     
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token expired' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadProfileImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const userId = req.user.id; 
  const filePath = req.file.path; 

  try {
    await pool.query('UPDATE users SET profile_image = $1 WHERE id = $2', [filePath, userId]);
    res.json({ message: 'Profile image uploaded successfully', path: filePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};

const uploadProfileImageCloud = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'No file uploaded to Cloudinary' });
    }

    const userId = req.user.id;
    const imageUrl = req.file.path; 

    await pool.query(
      'UPDATE users SET profile_image = $1 WHERE id = $2',
      [imageUrl, userId]
    );

    res.status(200).json({
      message: 'Image uploaded to Cloudinary successfully',
      cloudinary_url: imageUrl,
    });
  } catch (error) {
    console.error('Upload Error:', error.message);
    res.status(500).json({ error: 'Upload to Cloudinary failed' });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  getPaginatedUsers,
  updateUser,
  deleteUser,
  getUserWithAddresses,
  forgotPassword,
  resetPassword,
  uploadProfileImage,
  uploadProfileImageCloud
};
