import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to your Express app in aspireConsultancy!');
});

export default router;