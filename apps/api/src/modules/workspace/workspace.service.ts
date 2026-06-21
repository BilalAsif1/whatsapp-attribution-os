import { Injectable, Inject, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '@database/drizzle.module';
import { workspaces, workspaceMembers } from '@database/schema';
import { slugify } from '@wao/shared';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto';

@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name);

  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    const slug = dto.slug || slugify(dto.name);

    const existing = await this.db.query.workspaces.findFirst({
      where: eq(workspaces.slug, slug),
    });
    if (existing) throw new ConflictException('Workspace slug already taken');

    const [workspace] = await this.db.insert(workspaces).values({
      name: dto.name,
      slug,
      ownerId: userId,
      settings: { timezone: dto.timezone || 'UTC', currency: dto.currency || 'USD', attributionWindowDays: 30 },
    }).returning();

    await this.db.insert(workspaceMembers).values({
      workspaceId: workspace!.id,
      userId,
      role: 'owner',
    });

    this.logger.log(`Workspace "${dto.name}" created by user ${userId}`);
    return workspace;
  }

  async findAllForUser(userId: string) {
    const memberships = await this.db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.userId, userId),
      with: { workspace: true },
    });
    return memberships.map((m) => ({ ...m.workspace, role: m.role }));
  }

  async findOne(id: string) {
    const workspace = await this.db.query.workspaces.findFirst({
      where: eq(workspaces.id, id),
      with: { members: true, whatsappAccounts: true, adConnections: true },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }

  async update(id: string, dto: UpdateWorkspaceDto) {
    const [updated] = await this.db.update(workspaces)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(workspaces.id, id))
      .returning();
    if (!updated) throw new NotFoundException('Workspace not found');
    return updated;
  }

  async remove(id: string) {
    const [deleted] = await this.db.delete(workspaces).where(eq(workspaces.id, id)).returning();
    if (!deleted) throw new NotFoundException('Workspace not found');
  }
}
