import express from "express";
import router from "./routes/index.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use('/api', router);

app.listen(4000, () => {
  console.log("app listning on port 4000");
});

export default app;