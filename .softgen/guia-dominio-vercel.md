# 🚀 GUÍA COMPLETA - Dominio Custom en Vercel + GitHub

**Fecha:** 2026-04-24
**Proyecto:** Portal Espiritual Tarot

---

## 📋 **RESUMEN RÁPIDO**

### ¿Necesito GitHub para usar un dominio custom?
**NO es obligatorio**, pero **SÍ es MUY recomendado** por estas razones:

✅ **Ventajas de GitHub:**
- Backup automático de tu código
- Historial de cambios (si algo se rompe, puedes volver atrás)
- Colaboración futura (si necesitas ayuda de otro dev)
- Auto-deploy en Vercel (push → deploy automático)
- Profesionalismo y buenas prácticas

❌ **Sin GitHub:**
- Puedes seguir usando dominio custom
- Pero no tendrás backup ni historial
- Deployments manuales desde Softgen

**RECOMENDACIÓN:** Subir a GitHub (toma 5 minutos, te protege de perder código)

---

## 🎯 **PROCESO COMPLETO (2 OPCIONES)**

---

## 📌 **OPCIÓN 1: CON GITHUB (RECOMENDADO)**

### **PASO 1: Crear Repositorio en GitHub** (3 minutos)

```
1. Ve a: https://github.com/new

2. Configura:
   - Repository name: portal-espiritual-tarot
   - Description: Portal Espiritual - Experiencia de Tarot Premium
   - Visibility: Private (recomendado) o Public
   - ❌ NO inicialices con README (ya tienes código)

3. Click "Create repository"

4. Copia la URL que aparece:
   https://github.com/TU_USUARIO/portal-espiritual-tarot.git
```

---

### **PASO 2: Conectar tu Proyecto con GitHub** (2 minutos)

Actualmente tu proyecto está en **Softgen** (plataforma de desarrollo).

**Para subir a GitHub:**

```bash
# Opción A: Desde terminal local (si tienes Git instalado)
git remote add origin https://github.com/TU_USUARIO/portal-espiritual-tarot.git
git branch -M main
git push -u origin main

# Opción B: Usar GitHub Desktop (interfaz gráfica)
1. Descarga GitHub Desktop: https://desktop.github.com
2. File → Add Local Repository
3. Selecciona la carpeta de tu proyecto
4. Publish repository

# Opción C: Desde Softgen (si tiene integración)
1. Ve a Settings en Softgen
2. Busca "GitHub" o "Version Control"
3. Conecta tu cuenta GitHub
4. Push código
```

---

### **PASO 3: Conectar GitHub con Vercel** (2 minutos)

```
1. Ve a Vercel Dashboard: https://vercel.com

2. Click "Add New" → "Project"

3. Importar desde GitHub:
   - Click "Import Git Repository"
   - Selecciona: portal-espiritual-tarot
   - Click "Import"

4. Configuración del proyecto:
   ✅ Framework Preset: Next.js (auto-detectado)
   ✅ Root Directory: ./
   ✅ Build Command: npm run build
   ✅ Output Directory: .next

5. Environment Variables (IMPORTANTE):
   Añade estas desde Softgen .env.local:
   
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

6. Click "Deploy"

7. ✅ Espera 2-3 minutos → Proyecto deployado
```

**URL Temporal:**
```
https://portal-espiritual-tarot.vercel.app
o
https://portal-espiritual-tarot-tu-usuario.vercel.app
```

---

### **PASO 4: Añadir Dominio Custom** (5 minutos)

```
1. Compra tu dominio:
   Recomendados:
   - Namecheap.com ($10/año)
   - GoDaddy.com ($12/año)
   - Porkbun.com ($8/año)
   - Google Domains ($12/año)

   Ejemplo: tuportal.com

2. En Vercel:
   - Ve a tu proyecto
   - Settings → Domains
   - Click "Add Domain"
   - Ingresa: tuportal.com
   - Click "Add"

3. Vercel te mostrará configuración DNS:

   Para dominio raíz (tuportal.com):
   ┌──────────────────────────────────────┐
   │ Type: A                              │
   │ Name: @                              │
   │ Value: 76.76.21.21                   │
   └──────────────────────────────────────┘

   Para www (www.tuportal.com):
   ┌──────────────────────────────────────┐
   │ Type: CNAME                          │
   │ Name: www                            │
   │ Value: cname.vercel-dns.com          │
   └──────────────────────────────────────┘

4. Ve a tu proveedor de dominio:
   - Panel DNS / DNS Management
   - Añade los registros de arriba
   - Save

5. Vuelve a Vercel:
   - Espera 5-30 minutos (propagación DNS)
   - ✅ Vercel verificará automáticamente
   - ✅ SSL (HTTPS) se genera automáticamente
```

---

### **PASO 5: Actualizar Supabase** (1 minuto)

```
1. Ve a Supabase Dashboard:
   https://supabase.com/dashboard/project/[tu-proyecto]

2. Authentication → URL Configuration

3. Actualiza:
   - Site URL: https://tuportal.com
   - Redirect URLs:
     https://tuportal.com/**
     https://www.tuportal.com/**

4. Save

5. ✅ Listo!
```

---

### **PASO 6: Auto-Deploy Configurado** ✅

Ahora cada vez que hagas cambios:

```
1. Editas código en Softgen
2. Push a GitHub
3. ✅ Vercel auto-deploya en 2 minutos
4. ✅ Cambios en vivo en tuportal.com
```

---

## 📌 **OPCIÓN 2: SIN GITHUB (SOLO VERCEL)**

Si NO quieres usar GitHub (no recomendado):

### **PASO 1: Deploy Manual desde Softgen**

```
1. En Softgen:
   - Click "Publish" o "Deploy"
   - Selecciona Vercel
   - Conecta tu cuenta Vercel
   - Deploy

2. Sigue PASO 4 y 5 de Opción 1
   (Añadir dominio y actualizar Supabase)
```

**Desventajas:**
- ❌ No hay backup de código
- ❌ No hay historial de cambios
- ❌ Deployments manuales cada vez
- ❌ Si pierdes código, lo pierdes todo

---

## ✅ **CHECKLIST FINAL**

### Antes de comprar dominio:

- [ ] Proyecto funciona perfectamente en preview
- [ ] Todas las features probadas (formulario, chat, admin)
- [ ] Base de datos configurada
- [ ] Email templates personalizados
- [ ] Sin errores en consola
- [ ] Responsive (probado en móvil)

### Para dominio custom:

**Con GitHub (recomendado):**
- [ ] Cuenta GitHub creada
- [ ] Repositorio creado
- [ ] Código subido a GitHub
- [ ] Vercel conectado con GitHub
- [ ] Environment variables añadidas
- [ ] Proyecto deployado en Vercel
- [ ] Dominio comprado
- [ ] DNS configurado
- [ ] Supabase URLs actualizadas
- [ ] SSL activo (HTTPS)
- [ ] Todo funcional en dominio custom

**Sin GitHub (no recomendado):**
- [ ] Deploy manual desde Softgen a Vercel
- [ ] Dominio comprado
- [ ] DNS configurado
- [ ] Supabase URLs actualizadas
- [ ] SSL activo (HTTPS)
- [ ] Todo funcional en dominio custom

---

## 💰 **COSTOS ESTIMADOS**

| Servicio | Costo | Frecuencia |
|----------|-------|------------|
| **Dominio** | $8-20 | Anual |
| **Vercel Hosting** | $0 (Hobby) | Gratis |
| **Supabase** | $0 (Free tier) | Gratis |
| **GitHub** | $0 (Public/Private) | Gratis |
| **TOTAL** | **$8-20/año** | Solo dominio |

**Plan Hobby Vercel incluye:**
- ✅ SSL gratis
- ✅ 100GB bandwidth
- ✅ Dominio custom
- ✅ Auto-deploy

**Supabase Free tier incluye:**
- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 50,000 usuarios auth
- ✅ Suficiente para empezar

---

## 🔧 **TROUBLESHOOTING**

### "Domain not found" o "DNS not configured"
**Solución:** Espera 1-2 horas. Propagación DNS puede tardar.

### "SSL Certificate Error"
**Solución:** Vercel genera SSL automáticamente en 5-10 min. Espera.

### "Auth redirect error"
**Solución:** Actualiza Redirect URLs en Supabase con tu nuevo dominio.

### "Environment variables missing"
**Solución:** Añade todas las variables de .env.local en Vercel → Settings → Environment Variables.

### Push a GitHub falla
**Solución:** 
```bash
git config user.name "Tu Nombre"
git config user.email "tuemail@ejemplo.com"
git add .
git commit -m "Initial commit"
git push -u origin main
```

---

## 📞 **RECURSOS**

**Documentación:**
- Vercel Domains: https://vercel.com/docs/concepts/projects/domains
- GitHub: https://docs.github.com/en/get-started
- Supabase Auth: https://supabase.com/docs/guides/auth

**Soporte:**
- Vercel Support: https://vercel.com/support
- Supabase Discord: https://discord.supabase.com
- GitHub Support: https://support.github.com

---

## ✅ **RECOMENDACIÓN FINAL**

**Usa OPCIÓN 1 (Con GitHub):**

```
Tiempo total: ~15 minutos
Costo: $8-20/año (solo dominio)
Resultado: Sitio profesional con backup completo

Beneficios:
✅ Código respaldado
✅ Auto-deploy
✅ Historial de cambios
✅ Fácil colaboración futura
✅ Buenas prácticas
```

---

## 🚀 **PRÓXIMOS PASOS**

1. **Hoy:** Crear repositorio GitHub y subir código
2. **Hoy:** Conectar Vercel con GitHub
3. **Mañana:** Comprar dominio
4. **Mañana:** Configurar DNS
5. **Pasado mañana:** Verificar todo funciona
6. **Siguiente semana:** Promocionar tu Portal Espiritual

---

**¿Necesitas ayuda con algún paso específico?** Pregúntame y te guío paso a paso.