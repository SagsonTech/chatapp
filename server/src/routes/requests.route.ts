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
router.put("/accept/:requestId", (req: Request, res: Response) => {
  res.send("Accept request " + req.params.requestId);
});

// decline request
router.put("/decline/:requestId", (req: Request, res: Response) => {
  res.send("Decline request " + req.params.requestId);
});

// cancel request
router.put("/cancel/:requestId", (req: Request, res: Response) => {
  res.send("Cancel request " + req.params.requestId);
});

// clear sent history (all sent requests are deleted except the pending ones)
router.delete("/clear-sent-requests", (req: Request, res: Response) => {
  res.send("Clear sent requests");
});

// clear recieved history (all recieved requests are deleted except the pending ones)
router.delete("/clear-recieved-requests", (req: Request, res: Response) => {
  res.send("Clear recieved requests");
});

export default router;
