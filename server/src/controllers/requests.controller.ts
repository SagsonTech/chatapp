import { Request, Response } from "express";
import { AppError } from "../middlewares/errorHandler.middleware";
import User from "../models/user.model";
import { Request as RequestModel } from "../models/request.model";
import asyncErrorHandlerMiddleware from "../middlewares/asyncErrorHandler.middleware";
import {
  IRequestResponsePayload,
  RequestStatusType,
} from "../interfaces/request.interfaces";

class RequestsController {
  public sendRequest = asyncErrorHandlerMiddleware(
    async (req: Request, res: Response) => {
      const { toId } = req.body;
      const userId = (req as any).userId;

      if (!toId) throw new AppError("Missing to ID", 404);

      if (toId === userId) throw new AppError("Cannot request self", 401);

      const toUser = await User.findById(toId);
      if (!toUser) throw new AppError("User not found", 404);

      const existingRequest = await RequestModel.findOne({
        toId: toId,
        fromId: userId,
        status: "pending",
      });
      if (existingRequest)
        throw new AppError("Request has been already sent", 405);

      const newRequest = new RequestModel({
        toId,
        fromId: userId,
      });

      await newRequest.save();

      const request = await this.createRequestPayload(newRequest, true);

      return res.status(200).json({
        newRequest: request,
        message: `Request has been sent to ${toUser.username}`,
        success: true,
      });
    },
  );

  public sentRequests = asyncErrorHandlerMiddleware(
    async (req: Request, res: Response) => {
      const userId = (req as any).userId;
      const user = await User.findById(userId);

      if (!user) throw new AppError("User not found", 404);

      const sentRequests = await RequestModel.find({
        fromId: userId,
      });

      const requests = await Promise.all(
        sentRequests.map(async (request) => {
          const requestPayload = await this.createRequestPayload(request, true);
          return requestPayload;
        }),
      );

      return res.status(200).json({
        sentRequests: requests,
        success: true,
      });
    },
  );

  public recievedRequests = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const user = await User.findById(userId);

    if (!user) throw new AppError("User not found", 404);

    const recievedRequests = await RequestModel.find({
      toId: userId,
    });

    const requests = await Promise.all(
      recievedRequests.map(async (request) => {
        const requestPayload = await this.createRequestPayload(request, false);
        return requestPayload;
      }),
    );

    return res.status(200).json({
      recievedRequests: requests,
      success: true,
    });
  };

  private createRequestPayload = async (
    request: any,
    isSentPayload: boolean,
  ): Promise<IRequestResponsePayload> => {
    let user;

    if (isSentPayload) {
      user = await User.findById(request.toId).select("-password");
    } else {
      user = await User.findById(request.fromId).select("-password");
    }

    const requestPayload: IRequestResponsePayload = {
      toUser: {
        userId: user ? user._id.toString() : "",
        username: user ? user.username : "Chatapp User",
        email: user ? user.email : "",
        profilePicture: user ? user.profilePicture : "",
      },
      status: request.status as RequestStatusType,
      sentTime: new Date(request.createdAt),
    };

    return requestPayload;
  };
}

export default RequestsController;
