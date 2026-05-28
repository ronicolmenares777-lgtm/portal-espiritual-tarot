/**
 * Script para crear/actualizar usuario administrador
 * Ejecutar: npx tsx scripts/create-admin.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Leer variables de entorno manualmente desde .env.local
const envPath = resolve(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno no encontradas en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const ADMIN_EMAIL = 'templogaleano@gmail.com';
const ADMIN_PASSWORD = 'Pepe.2002';

async function createOrUpdateAdmin() {
  console.log('🔐 Configurando cuenta de administrador...\n');
  
  // Paso 1: Listar usuarios para encontrar el existente
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('❌ Error listando usuarios:', listError.message);
    process.exit(1);
  }
  
  const existingUser = users.users.find(u => u.email === ADMIN_EMAIL);
  
  let userId: string;
  
  if (existingUser) {
    console.log('✅ Usuario existente encontrado');
    console.log('🆔 User ID:', existingUser.id);
    userId = existingUser.id;
    
    // Actualizar contraseña
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: ADMIN_PASSWORD }
    );
    
    if (updateError) {
      console.error('❌ Error actualizando contraseña:', updateError.message);
      process.exit(1);
    }
    
    console.log('✅ Contraseña actualizada\n');
  } else {
    // Crear nuevo usuario
    console.log('📝 Creando nuevo usuario...');
    
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrador'
      }
    });
    
    if (authError) {
      console.error('❌ Error creando usuario:', authError.message);
      process.exit(1);
    }
    
    userId = authUser.user.id;
    console.log('✅ Usuario creado');
    console.log('🆔 User ID:', userId, '\n');
  }
  
  // Paso 2: Asegurar perfil admin
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: ADMIN_EMAIL,
      role: 'admin',
      full_name: 'Administrador'
    });
  
  if (profileError) {
    console.error('❌ Error configurando perfil:', profileError.message);
    process.exit(1);
  }
  
  console.log('✅ Perfil admin configurado\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ CUENTA ADMIN LISTA PARA USAR');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Email:', ADMIN_EMAIL);
  console.log('🔑 Contraseña:', ADMIN_PASSWORD);
  console.log('🔗 URL: /Suafazon');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

createOrUpdateAdmin()
  .then(() => {
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script falló:', error);
    process.exit(1);
  });