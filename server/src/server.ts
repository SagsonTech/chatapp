import app from "./app";
import envVars from "./config/envVars.config";

const PORT: number = envVars.PORT;

app.listen(PORT, () => {
  console.log(`Server has started: http://localhost:${PORT}`);
});
