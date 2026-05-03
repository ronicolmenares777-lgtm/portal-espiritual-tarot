-- Paso 2: Crear constraint UNIQUE en whatsapp para prevenir duplicados futuros
ALTER TABLE leads 
ADD CONSTRAINT leads_whatsapp_unique UNIQUE (whatsapp);