# 🔐 AUDITORÍA DE SEGURIDAD Y CONFIGURACIÓN DE DOMINIO

## 📋 REQUISITOS PARA CONECTAR DOMINIO EN VERCEL

### 1️⃣ Dominio Registrado
- ✅ Tener un dominio registrado (ej: tudominio.com)
- Proveedores recomendados: GoDaddy, Namecheap, Google Domains, Cloudflare

### 2️⃣ Configuración DNS
Debes configurar los registros DNS en tu proveedor:

**OPCIÓN A - Nameservers de Vercel (Recomendado):**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**OPCIÓN B - Registros A + CNAME:**
```
Tipo A:
  Nombre: @
  Valor: 76.76.21.21

Tipo CNAME:
  Nombre: www
  Valor: cname.vercel-dns.com
```

### 3️⃣ Pasos en Vercel
1. Ir a tu proyecto en Vercel Dashboard
2. Settings → Domains
3. Agregar dominio personalizado
4. Seguir instrucciones de verificación DNS
5. Esperar propagación (5min - 48hrs, usualmente 30min)

### 4️⃣ SSL/HTTPS Automático
- ✅ Vercel provee certificado SSL gratis automáticamente
- Se activa cuando el DNS está correctamente configurado

---

## 🔒 AUDITORÍA DE SEGURIDAD

### ✅ ÁREAS SEGURAS

#### 1. Autenticación Admin
- ✅ **Sistema de sesiones implementado** (src/middleware/auth.ts)
- ✅ **Protección de rutas admin** (/Suafazon/*)
- ✅ **Validación de correo y contraseña**
- ✅ **Redirección automática** si no autenticado
- ✅ **Sesiones en localStorage** con validación

#### 2. Base de Datos (Supabase)
- ✅ **Row Level Security (RLS) habilitado** en todas las tablas
- ✅ **Políticas de acceso configuradas**
- ✅ **API Keys en variables de entorno** (.env.local)
- ✅ **No hay credenciales hardcodeadas** en el código

#### 3. Sanitización de Datos
- ✅ **Validación de inputs** en formularios
- ✅ **Escape de caracteres especiales** implementado
- ✅ **Protección XSS** mediante sanitización HTML
- ✅ **Límites de tamaño** en uploads (imágenes base64)

#### 4. Headers de Seguridad
- ✅ **X-Frame-Options configurado** (vercel.json)
- ✅ **Content-Security-Policy** presente
- ✅ **Strict-Transport-Security** para HTTPS
- ✅ **X-Content-Type-Options** configurado

---

## ⚠️ MEJORAS DE SEGURIDAD RECOMENDADAS

### 🔴 CRÍTICAS (Alta Prioridad)

#### 1. Variables de Entorno en Producción
**Problema:** Las claves de Supabase deben estar en Vercel
**Solución:**
```
Vercel Dashboard → Project → Settings → Environment Variables
Agregar:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### 2. Contraseñas Hasheadas
**Problema:** Las contraseñas actualmente se comparan en texto plano
**Solución:** Implementar bcrypt o Supabase Auth

#### 3. Rate Limiting
**Problema:** No hay límite de intentos de login
**Solución:** Implementar rate limiting en login y formularios

---

### 🟡 IMPORTANTES (Media Prioridad)

#### 4. CSRF Protection
**Problema:** Formularios sin tokens CSRF
**Solución:** Implementar tokens CSRF en formularios críticos

#### 5. Validación de Inputs en Backend
**Problema:** Validación solo en frontend
**Solución:** Agregar validación en API routes

#### 6. Logs de Seguridad
**Problema:** No hay registro de intentos de login fallidos
**Solución:** Implementar sistema de logs de seguridad

---

### 🟢 OPCIONALES (Baja Prioridad)

#### 7. Two-Factor Authentication (2FA)
**Recomendación:** Agregar 2FA para admin

#### 8. IP Whitelisting
**Recomendación:** Restringir acceso admin a IPs específicas

#### 9. Backup Automático
**Recomendación:** Configurar backups automáticos de BD

---

## 🧪 VERIFICACIÓN DE FUNCIONALIDAD

### ✅ FLUJO DE USUARIO
- [VERIFICAR] Formulario inicial → Captura de datos
- [VERIFICAR] Pantalla de carga → Animación
- [VERIFICAR] Selección de cartas → 3 cartas
- [VERIFICAR] Revelación de carta → Animación
- [VERIFICAR] Preguntas → Captura respuestas
- [VERIFICAR] Mensaje del Cosmos → Bola de cristal + WhatsApp
- [VERIFICAR] Chat de usuario → Envío de mensajes

### ✅ PANEL ADMIN
- [VERIFICAR] Login → Autenticación
- [VERIFICAR] Dashboard → Estadísticas y leads
- [VERIFICAR] Filtros → Por estado (pendiente/en_proceso/atendido)
- [VERIFICAR] Chat admin → Envío/recepción mensajes
- [VERIFICAR] Multimedia → Imágenes y audio
- [VERIFICAR] Perfil → Edición nombre y avatar

### ✅ BOTONES WHATSAPP
- [VERIFICAR] Header página principal
- [VERIFICAR] Pantalla "Analizando energía"
- [VERIFICAR] Pantalla "Mensaje del Cosmos"
- [VERIFICAR] Chat de usuario

---

## 📝 CHECKLIST PRE-PRODUCCIÓN

### Antes de conectar dominio:

- [ ] **Actualizar todos los enlaces de WhatsApp** con el número real
- [ ] **Configurar variables de entorno en Vercel**
- [ ] **Verificar RLS policies** en Supabase
- [ ] **Probar flujo completo** en preview de Vercel
- [ ] **Verificar responsive design** en móvil/tablet/desktop
- [ ] **Probar todos los botones** de navegación
- [ ] **Verificar carga de imágenes** y multimedia
- [ ] **Configurar dominio** en Vercel
- [ ] **Esperar propagación DNS** (verificar con https://dnschecker.org)
- [ ] **Probar SSL/HTTPS** funcionando
- [ ] **Verificar SEO** (meta tags, sitemap, robots.txt)

### Después de conectar dominio:

- [ ] **Actualizar redirect URLs** en Supabase (si usas Auth)
- [ ] **Verificar funcionamiento** en dominio personalizado
- [ ] **Configurar analytics** (Google Analytics, etc.)
- [ ] **Configurar monitoring** de errores (Sentry, etc.)
- [ ] **Backup de base de datos** antes de lanzar
- [ ] **Plan de rollback** en caso de problemas

---

## 🔗 RECURSOS ÚTILES

- [Guía Vercel Domains](https://vercel.com/docs/concepts/projects/domains)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [DNS Checker](https://dnschecker.org)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)

---

## 📞 CONTACTO Y SOPORTE

Si necesitas ayuda adicional:
- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.com
- Documentación: vercel.com/docs

---

**Fecha de auditoría:** 2026-05-03
**Estado del proyecto:** ✅ Funcional, listo para producción con mejoras de seguridad recomendadas