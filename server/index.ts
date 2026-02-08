import dotenv from 'dotenv';
// Load environment variables before anything else
dotenv.config();

import app from './app';

const port = process.env.PORT || 3000;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
