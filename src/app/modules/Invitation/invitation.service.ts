import { InvitationStatus } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/APIError";
import httpStatus from 'http-status';


interface SendInviteUserParams {
  receiverId: string;
  eventId: string;
}

const sendInviteUser = async (
  payload: SendInviteUserParams,
  senderId: string
) => {
  const { receiverId, eventId } = payload;

  

  // Check if event exists
  const event = await prisma.events.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, "Event not found");
  }

  // Check if user exists
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
  });

  if (!receiver) {
    throw new ApiError(httpStatus.NOT_FOUND, "Receiver not found");
  }

  // Check if already invited
  const existingInvite = await prisma.invitation.findFirst({
    where: {
      receiverId,
      event_id: eventId,
    },
  });

  if (existingInvite) {
    throw new ApiError(httpStatus.CONFLICT, "Already invited");
  }

  // Create invitation
  const invitation = await prisma.invitation.create({
    data: {
      senderId,
      receiverId,
      event_id: eventId,
      status: InvitationStatus.PENDING,
    },
  });

  return invitation;
};

export const InvitationsService = {
  sendInviteUser,
};