import { PrismaClient, Account } from '@prisma/client';

const prisma = new PrismaClient();

export class AccountRepository {
  async findById(id: string): Promise<Account | null> {
    return prisma.account.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<Account[]> {
    return prisma.account.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' },
      ],
    });
  }

  async create(data: {
    userId: string;
    name: string;
    type: string;
    initialBalance: number;
    currency: string;
    isDefault?: boolean;
    icon?: string;
    color?: string;
  }): Promise<Account> {
    // Si c'est un compte par défaut, retirer le statut par défaut des autres comptes
    if (data.isDefault) {
      await prisma.account.updateMany({
        where: {
          userId: data.userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return prisma.account.create({
      data,
    });
  }

  async update(id: string, data: Partial<{
    name: string;
    type: string;
    initialBalance: number;
    currency: string;
    icon: string;
    color: string;
  }>): Promise<Account> {
    return prisma.account.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.account.delete({
      where: { id },
    });
  }

  async setDefault(userId: string, accountId: string): Promise<void> {
    await prisma.$transaction([
      // Retirer le statut par défaut de tous les comptes de l'utilisateur
      prisma.account.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      }),
      // Définir le compte spécifié comme par défaut
      prisma.account.update({
        where: { id: accountId },
        data: { isDefault: true },
      }),
    ]);
  }

  async getDefaultAccount(userId: string): Promise<Account | null> {
    return prisma.account.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });
  }

  async ensureDefaultAccount(userId: string): Promise<Account> {
    // Vérifier s'il y a déjà un compte par défaut
    let defaultAccount = await this.getDefaultAccount(userId);
    
    if (!defaultAccount) {
      // S'il n'y a pas de compte par défaut, créer un compte principal
      const existingAccounts = await this.findByUserId(userId);
      
      if (existingAccounts.length === 0) {
        // Aucun compte n'existe, créer le premier compte
        defaultAccount = await this.create({
          userId,
          name: 'Compte principal',
          type: 'main',
          initialBalance: 0,
          currency: 'FCFA',
          isDefault: true,
        });
      } else {
        // Il y a des comptes mais aucun n'est par défaut, marquer le premier comme par défaut
        await this.setDefault(userId, existingAccounts[0].id);
        defaultAccount = existingAccounts[0];
      }
    }

    return defaultAccount;
  }
}