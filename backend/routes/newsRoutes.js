const express = require("express");
const { getRelatedNews, getTrendingNews } = require("../controllers/newsController");

const router = express.Router();

router.get("/news/related", getRelatedNews);
router.get("/trending-news", getTrendingNews);

module.exports = router;
