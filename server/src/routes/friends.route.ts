import express, { Request, Response } from "express";
import FriendsController from "../controllers/friends.controller";
const router = express.Router();

const friendsController = new FriendsController();

// get all friends
router.get("/", friendsController.getAllFriends);

//get the profile of one friend using friend id
router.get("/:id", friendsController.getFriendProfile);

// block
router.put("/block/:id", friendsController.block);

// unblock
router.put("/unblock/:id", friendsController.unblock);

export default router;
