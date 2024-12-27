import axios from "axios";

export const getBooks = async (req, res) => {
  const { q, startIndex = 0, maxResults = 10, key } = req.query;

  try {
    const response = await axios.get("https://www.googleapis.com/books/v1/volumes", {
      params: {
        q,
        key,
        startIndex,
        maxResults,
      },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    res.status(error?.status || 500).json({ error: "An error occurred while fetching data from Google Books API." });
  }
};
