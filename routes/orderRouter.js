import express from "express";
import {
  changeOrderStatus,
  createOrder,
  getOrder,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/", createOrder);
orderRouter.get("/", getOrder);
orderRouter.put("/", changeOrderStatus);

export default orderRouter;
