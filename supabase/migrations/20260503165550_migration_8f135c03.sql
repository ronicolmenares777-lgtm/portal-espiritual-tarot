-- Crear tabla para eventos de analytics
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'page_view', 'form_start', 'form_complete', 'card_select', 'chat_start', 'share_click'
  session_id TEXT NOT NULL,
  user_agent TEXT,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  browser TEXT,
  page_path TEXT,
  referrer TEXT,
  event_data JSONB, -- datos adicionales específicos del evento
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para queries rápidas
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_device ON analytics_events(device_type);

-- RLS: Solo admins pueden leer
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_analytics" ON analytics_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Permitir inserciones anónimas (tracking público)
CREATE POLICY "public_insert_analytics" ON analytics_events
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE analytics_events IS 'Registro de eventos de analytics y métricas de usuario';