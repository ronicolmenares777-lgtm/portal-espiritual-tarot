/**
 * Script para crear usuario administrador
 * Ejecutar una sola vez para crear la cuenta admin
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  const email = 'templogaleano@gmail.com';
  const password = 'Pepe.2002';
  
  console.log('🔐 Creando usuario admin...');
  console.log('📧 Email:', email);

  try {
    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        role: 'admin'
      }
    });

    if (authError) {
      console.error('❌ Error creando usuario en Auth:', authError.message);
      
      // Si el usuario ya existe, intentar actualizar la contraseña
      if (authError.message.includes('already registered')) {
        console.log('⚠️ Usuario ya existe, actualizando contraseña...');
        
        // Obtener el usuario
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        
        const existingUser = users.find(u => u.email === email);
        if (!existingUser) throw new Error('Usuario no encontrado');
        
        // Actualizar contraseña
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { password }
        );
        
        if (updateError) throw updateError;
        console.log('✅ Contraseña actualizada');
        
        // Usar el usuario existente
        authData.user = existingUser;
      } else {
        throw authError;
      }
    } else {
      console.log('✅ Usuario creado en Auth:', authData.user?.id);
    }

    const userId = authData.user?.id;
    if (!userId) throw new Error('No se obtuvo ID de usuario');

    // 2. Crear o actualizar perfil en tabla profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: email,
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('❌ Error creando perfil:', profileError.message);
      throw profileError;
    }

    console.log('✅ Perfil admin creado/actualizado');
    console.log('\n🎉 CUENTA ADMIN LISTA:');
    console.log('📧 Email:', email);
    console.log('🔑 Contraseña: Pepe.2002');
    console.log('🔗 URL: /Suafazon');
    console.log('\n✅ Puedes iniciar sesión ahora');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Ejecutar
createAdminUser()
  .then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script falló:', error);
    process.exit(1);
  });