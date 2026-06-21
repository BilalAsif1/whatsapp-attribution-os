import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { DRIZZLE, type DrizzleDB } from '@database/drizzle.module';
import { whatsappAccounts } from '@database/schema';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(workspaceId: string, data: {
    phoneNumberId: string;
    phoneNumber: string;
    wabaId: string;
    accessToken: string;
  }) {
    const webhookVerifyToken = randomBytes(16).toString('hex');
    // In production, encrypt accessToken with AES-256 using ENCRYPTION_KEY
    const accessTokenEnc = Buffer.from(data.accessToken).toString('base64');

    const [account] = await this.db.insert(whatsappAccounts).values({
      workspaceId,
      phoneNumberId: data.phoneNumberId,
      phoneNumber: data.phoneNumber,
      wabaId: data.wabaId,
      accessTokenEnc,
      webhookVerifyToken,
    }).returning();

    this.logger.log(`WhatsApp account ${data.phoneNumber} connected to workspace ${workspaceId}`);
    return { ...account, webhookVerifyToken };
  }

  async findAll(workspaceId: string) {
    return this.db.query.whatsappAccounts.findMany({
      where: eq(whatsappAccounts.workspaceId, workspaceId),
    });
  }

  async remove(workspaceId: string, id: string) {
    const [deleted] = await this.db.delete(whatsappAccounts)
      .where(and(eq(whatsappAccounts.id, id), eq(whatsappAccounts.workspaceId, workspaceId)))
      .returning();
    if (!deleted) throw new NotFoundException('WhatsApp account not found');
  }
}
