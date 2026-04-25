import express from "express";
import routes from "./routes";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { errorHandlerMiddleware } from "./middlewares/error-handler.middleware";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", routes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
