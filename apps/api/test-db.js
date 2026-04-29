const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Tentando conectar ao banco de dados...');
    
    // Tentar criar um registro de teste
    const result = await prisma.testConnection.create({
      data: { message: 'Teste de conexão' }
    });
    
    console.log('✅ Conexão bem sucedida! Registro criado:', result);
    
    // Buscar registros
    const records = await prisma.testConnection.findMany();
    console.log('Registros no banco:', records);
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    console.log('\nVerifique:');
    console.log('1. O banco de dados está configurado corretamente?');
    console.log('2. Execute: npx prisma migrate dev --name init');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
