import { Request, Response } from "express";
import User, { userType } from "../models/user.model";
import { AppError } from "../middlewares/errorHandler.middleware";
import { IFriendProfilePayload } from "../interfaces/friends.interfaces";
import AuthController from "./auth.controller";

class FriendsController {
  private authController;

  constructor() {
    this.authController = new AuthController();
  }

  public getAllFriends = async (req: Request, res: Response) => {
    const user = await this.authController.getUserById((req as any).userId);
    if (!user) throw new AppError("User not found", 404);

    const friends = await Promise.all(
      user.friends.map(async (friend) => {
        const { _id, isBlocked, friendsFrom } = friend;

        const friendProfile = await User.findById(_id);
        if (!friendProfile) return;

        return this.createFriendProfilePayload(
          friendProfile,
          _id.toString(),
          isBlocked,
          friendsFrom,
        );
      }),
    );

    return res.status(200).json({
      friends,
      success: true,
    });
  };

  public getFriendProfile = async (req: Request, res: Response) => {
    const user = await this.authController.getUserById((req as any).userId);
    const { id } = req.params;

    if (!user) throw new AppError("User not found", 404);

    const friendPayload = user.friends.find(
      (friend) => friend._id.toString() == id,
    );
    if (!friendPayload) throw new AppError("Friend not found", 404);

    const friend = await User.findById(friendPayload._id);
    if (!friend) throw new AppError("Friend not found", 404);

    const friendProfile = this.createFriendProfilePayload(
      friend,
      friendPayload._id.toString(),
      friendPayload.isBlocked,
      friendPayload.friendsFrom,
    );
    res.status(200).json({
      friendProfile,
      success: true,
    });
  };

  public block = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.authController.getUserById((req as any).userId);
    if (!user) throw new AppError("User not found", 404);
    if (!id) throw new AppError("No friend Id was provided", 501);

    const friendPayload = user.friends.find(
      (friend) => friend._id.toString() == id,
    );
    if (!friendPayload) throw new AppError("Friend not found", 404);

    if (friendPayload.isBlocked)
      throw new AppError("User has already been blocked", 401);

    friendPayload.isBlocked = true;
    await user.save();

    return res.status(200).json({
      isBlocked: friendPayload.isBlocked,
      success: true,
    });
  };

  public unblock = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.authController.getUserById((req as any).userId);
    if (!user) throw new AppError("User not found", 404);
    if (!id) throw new AppError("No friend Id was provided", 501);

    const friendPayload = user.friends.find(
      (friend) => friend._id.toString() == id,
    );
    if (!friendPayload) throw new AppError("Friend not found", 404);

    if (!friendPayload.isBlocked)
      throw new AppError("User has already been unblocked", 401);

    friendPayload.isBlocked = false;
    await user.save();

    return res.status(200).json({
      isBlocked: friendPayload.isBlocked,
      success: true,
    });
  };

  private createFriendProfilePayload = (
    friendProfile: userType,
    friendId: string,
    isBlocked: boolean,
    friendsFrom: Date,
  ) => {
    const payload: IFriendProfilePayload = {
      userId: friendId,
      username: friendProfile.username,
      email: friendProfile.email,
      profilePicture: friendProfile.profilePicture,
      isBlocked,
      friendsFrom,
    };
    return payload;
  };
}

export default FriendsController;
