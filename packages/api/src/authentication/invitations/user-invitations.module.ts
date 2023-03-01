import { Module } from "@nestjs/common"
import { UserInvitationsController } from "./user-invitations.controller"
import { UserInvitationsService } from "./user-invitations.service"

@Module({
	providers: [UserInvitationsService],
	controllers: [UserInvitationsController],
})
export class UserInvitationsModule {}
