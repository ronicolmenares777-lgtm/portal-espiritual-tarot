# 🚀 CHECKLIST DE DESPLIEGUE - Portal Espiritual Tarot

## ✅ QUÉ YA ESTÁ LISTO

### Backend (Supabase)
- [x] Base de datos creada y configurada
- [x] RLS policies activas
- [x] Auth configurado
- [x] 5 cartas de tarot seeded
- [x] Triggers creados
- [x] API keys configuradas

### Frontend (Next.js)
- [x] Código sin errores
- [x] TypeScript configurado
- [x] Tailwind + shadcn/ui instalado
- [x] SEO implementado
- [x] Responsive design
- [x] Custom cursor + partículas
- [x] Animaciones fluidas

### Funcionalidades
- [x] Formulario de entrada funcional
- [x] Flujo completo de tarot
- [x] Cuestionario con skip option
- [x] Chat en tiempo real
- [x] Dashboard admin completo
- [x] Autenticación segura

---

## 📋 LO QUE FALTA PARA AÑADIR DOMINIO CUSTOM

### 1. **Conectar Dominio en Vercel** (5 minutos)

**Pasos:**

1. **Ve a tu proyecto en Vercel Dashboard:**
   ```
   https://vercel.com/[tu-usuario]/[nombre-proyecto]
   ```

2. **Settings → Domains:**
   - Click "Add Domain"
   - Ingresa tu dominio: `tudominio.com`
   - Vercel te dará instrucciones DNS

3. **Configurar DNS en tu proveedor:**
   
   **Opción A - CNAME (Subdominios):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

   **Opción B - A Records (Root domain):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

4. **Esperar propagación DNS:**
   - Puede tomar 5 minutos a 48 horas
   - Usualmente 15-30 minutos

5. **Vercel genera SSL automáticamente:**
   - ✅ Certificado HTTPS gratis
   - ✅ Auto-renovación

---

### 2. **Actualizar URLs en Supabase** (2 minutos)

Después de que el dominio esté activo:

1. **Ve a Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/[tu-proyecto]
   ```

2. **Authentication → URL Configuration:**
   - **Site URL:** `https://tudominio.com`
   - **Redirect URLs:** 
     ```
     https://tudominio.com/**
     https://tudominio.com/Suafazon/**
     ```

3. **Save changes**

---

### 3. **Variables de Entorno (OPCIONAL)** (1 minuto)

Si quieres añadir analytics u otros servicios:

1. **Vercel Dashboard → Settings → Environment Variables:**
   - `NEXT_PUBLIC_GA_ID` - Google Analytics
   - `NEXT_PUBLIC_DOMAIN` - Tu dominio
   - etc.

2. **Redeploy:**
   - Vercel redeployará automáticamente

---

## 🎯 PROCESO COMPLETO (RESUMEN)

```
1. Comprar dominio (GoDaddy, Namecheap, etc.)
   ↓
2. Conectar dominio en Vercel
   ↓
3. Configurar DNS (A o CNAME records)
   ↓
4. Esperar propagación (15-30 min)
   ↓
5. Actualizar URLs en Supabase
   ↓
6. ✅ ¡LISTO! Tu sitio está en tu dominio custom
```

---

## 🌐 PROVEEDORES DE DOMINIOS RECOMENDADOS

| Proveedor | Precio/año | Ventajas |
|-----------|------------|----------|
| **Namecheap** | $10-15 | Barato, fácil DNS |
| **GoDaddy** | $12-20 | Popular, soporte 24/7 |
| **Google Domains** | $12-15 | Integración Google |
| **Cloudflare** | $10 | DNS rápido, gratis SSL |
| **Porkbun** | $8-12 | Muy barato, buena UI |

---

## ⚡ EXTRAS RECOMENDADOS

### A. Google Analytics (Opcional)
```typescript
// src/pages/_app.tsx
import Script from 'next/script';

<Script
  strategy="afterInteractive"
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
/>
```

### B. Facebook Pixel (Para Ads)
```typescript
<Script
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      !function(f,b,e,v,n,t,s)...
    `
  }}
/>
```

### C. Custom Email (Opcional)
```
- Google Workspace ($6/mes)
- Zoho Mail (Gratis)
- ProtonMail ($5/mes)

Ejemplo: maestro@tudominio.com
```

---

## 🔧 TROUBLESHOOTING

### Problema: "Domain not found"
**Solución:** Espera 1-2 horas para propagación DNS

### Problema: "SSL Certificate Error"
**Solución:** Vercel genera SSL automáticamente, espera 5-10 min

### Problema: "Auth redirect error"
**Solución:** Actualiza Redirect URLs en Supabase

### Problema: "CORS error"
**Solución:** Añade tu dominio a Supabase CORS settings

---

## 📞 SOPORTE

**Vercel:**
- Docs: https://vercel.com/docs/domains
- Support: https://vercel.com/support

**Supabase:**
- Docs: https://supabase.com/docs/guides/auth
- Discord: https://discord.supabase.com

---

## ✅ VERIFICACIÓN FINAL

Una vez el dominio esté activo, verifica:

- [ ] `https://tudominio.com` carga correctamente
- [ ] SSL (candado verde) funciona
- [ ] Formulario guarda leads
- [ ] Login admin funciona
- [ ] Chat en tiempo real funciona
- [ ] Imágenes cargan correctamente
- [ ] No hay errores en consola

---

**ESTADO ACTUAL:** 
✅ Código listo para producción
⏳ Esperando dominio custom
🚀 100% funcional en Vercel preview URL