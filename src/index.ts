import express from "express";
import cors from "cors";
import apiRouter from "./api.route";
import passport from "passport";

const app = express();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): number {
  return this.toString();
};

app.use(
  cors({
    origin: "*", // This will enable CORS for all origins
    allowedHeaders: "*, auth",
  })
);

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

require("./config/passport");

app.use("/api", apiRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Backend server is running on port ${process.env.PORT}`);
});
