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

  public recievedRequests = asyncErrorHandlerMiddleware(
    async (req: Request, res: Response) => {
      const userId = (req as any).userId;
      const user = await User.findById(userId);

      if (!user) throw new AppError("User not found", 404);

      const recievedRequests = await RequestModel.find({
        toId: userId,
      });

      const requests = await Promise.all(
        recievedRequests.map(async (request) => {
          const requestPayload = await this.createRequestPayload(
            request,
            false,
          );
          return requestPayload;
        }),
      );

      return res.status(200).json({
        recievedRequests: requests,
        success: true,
      });
    },
  );

  public acceptRequest = asyncErrorHandlerMiddleware(
    async (req: Request, res: Response) => {
      const { requestId } = req.params;
      if (!requestId) throw new AppError("Request ID was not provided", 401);

      const userId = (req as any).userId;

      const request = await RequestModel.findById(requestId);
      if (!request) throw new AppError("Request not found", 404);

      const isValidAccess = await this.validateRequestAccess(
        request,
        "accept",
        userId,
      );
      if (!isValidAccess) throw new AppError("Invalid Access", 401);

      const toUser = await User.findById(request.toId);
      const fromUser = await User.findById(request.fromId);

      if (!fromUser || !toUser) throw new AppError("User not found", 404);

      toUser.friends.push(request.fromId);
      fromUser.friends.push(request.toId);
      request.status = "accepted";

      await toUser.save();
      await fromUser.save();
      await request.save();

      return res.status(200).json({
        message: `You have accepted the friend request from ${fromUser.username}`,
        success: true,
      });
    },
  );

  public declineRequest = asyncErrorHandlerMiddleware(
    async (req: Request, res: Response) => {
      const { requestId } = req.params;
      if (!requestId) throw new AppError("Request ID was not provided", 401);

      const userId = (req as any).userId;

      const request = await RequestModel.findById(requestId);
      if (!request) throw new AppError("Request not found", 404);

      const isValidAccess = await this.validateRequestAccess(
        request,
        "decline",
        userId,
      );
      if (!isValidAccess) throw new AppError("Invalid Access", 401);

      request.status = "declined";
      await request.save();

      res.status(200).json({
        message: `You have declined a friend request`,
        success: true,
      });
    },
  );

  public cancelRequest = asyncErrorHandlerMiddleware(
    async (req: Request, res: Response) => {
      const { requestId } = req.params;
      if (!requestId) throw new AppError("Request ID was not provided", 401);

      const userId = (req as any).userId;

      const request = await RequestModel.findById(requestId);
      if (!request) throw new AppError("Request not found", 404);

      const isValidAccess = await this.validateRequestAccess(
        request,
        "cancel",
        userId,
      );
      if (!isValidAccess) throw new AppError("Invalid Access", 401);

      request.status = "cancelled";
      await request.save();

      res.status(200).json({
        message: `You have cancelled an outgoing friend request`,
        success: true,
      });
    },
  );

  private validateRequestAccess = async (
    request: any,
    action: "accept" | "decline" | "cancel",
    userId: string,
  ) => {
    let isValid: boolean;

    if (action === "accept" || action === "decline") {
      isValid = userId == request.toId.toString();
    } else {
      isValid = userId == request.fromId.toString();
    }

    return isValid;
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
      requestId: request._id.toString(),
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
