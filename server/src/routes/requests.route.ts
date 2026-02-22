import express, { Request, Response } from "express";
import RequestsController from "../controllers/requests.controller";
const router = express.Router();

const requestsController = new RequestsController();

// get all the sent requests
router.get("/sent", requestsController.sentRequests);

// get all the recieved requests
router.get("/recieved", requestsController.recievedRequests);

// make a new request
router.post("/send", requestsController.sendRequest);

// accept request
router.put("/accept/:requestId", requestsController.acceptRequest);

// decline request
router.put("/decline/:requestId", requestsController.declineRequest);

// cancel request
router.put("/cancel/:requestId", requestsController.cancelRequest);

export default router;
