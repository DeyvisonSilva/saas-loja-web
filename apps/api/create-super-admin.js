const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    // Verificar se a tabela existe
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'SuperAdmin'
      );
    `;
    
    const tableExists = result[0].exists;
    
    if (!tableExists) {
      console.log('Criando tabela SuperAdmin...');
      await prisma.$executeRaw`
        CREATE TABLE "SuperAdmin" (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT DEFAULT 'super_admin',
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      console.log('Tabela criada com sucesso!');
    }
    
    // Inserir super admin
    await prisma.$executeRaw`
      INSERT INTO "SuperAdmin" (id, email, password, name, role) 
      VALUES (
        gen_random_uuid()::text,
        'admin@sistema.com',
        '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrJ5qRqZq5qRqZq5qRqZq5qRqZq5q',
        'Administrador Master',
        'super_admin'
      ) ON CONFLICT (email) DO NOTHING;
    `;
    
    console.log('Super Admin criado/verificado com sucesso!');
    
    // Verificar
    const admin = await prisma.$queryRaw`
      SELECT id, email, name, role FROM "SuperAdmin" WHERE email = 'admin@sistema.com';
    `;
    console.log('Super Admin:', admin[0]);
    
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
