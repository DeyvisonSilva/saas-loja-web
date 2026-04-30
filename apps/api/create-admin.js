const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const admin = await prisma.superAdmin.upsert({
      where: { email: 'admin@sistema.com' },
      update: {},
      create: {
        email: 'admin@sistema.com',
        password: 'admin123',
        name: 'Administrador Master',
        role: 'super_admin',
      }
    });
    console.log('Super Admin criado/atualizado:', admin.email);
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
