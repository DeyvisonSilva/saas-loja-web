const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Criar extensão pgcrypto
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
    console.log('✅ Extensão pgcrypto criada');
    
    // Remover tabela antiga se existir
    await prisma.$executeRaw`DROP TABLE IF EXISTS "SuperAdmin";`;
    console.log('✅ Tabela antiga removida');
    
    // Criar tabela SuperAdmin sem updatedAt
    await prisma.$executeRaw`
      CREATE TABLE "SuperAdmin" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'super_admin',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Tabela criada');
    
    // Inserir Super Admin
    await prisma.$executeRaw`
      INSERT INTO "SuperAdmin" (email, password, name, role) 
      VALUES ('admin@sistema.com', 'admin123', 'Administrador Master', 'super_admin');
    `;
    console.log('✅ Super Admin criado!');
    
    // Verificar
    const result = await prisma.$queryRaw`SELECT id, email, name, role FROM "SuperAdmin"`;
    console.log('📋 SuperAdmin:', result);
    
  } catch(e) { 
    console.error('❌ Erro:', e.message); 
  }
  await prisma.$disconnect();
}

main();
