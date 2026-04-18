// Configuración temporal del chat (se moverá a Supabase)
export const chatConfig = {
  maestro: {
    nombre: "Maestro Espiritual",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces",
    mensajes: [
      {
        texto: "Hola, soy el Maestro. Veo que el destino te ha guiado hasta el portal con éxito.",
        timestamp: "22:02",
        isUser: false
      },
      {
        texto: "Deseo ayudarte a encontrar la claridad y resolver lo que te aflige. Cuéntame con confianza, ¿qué situación sentimental o espiritual te trajo aquí y cómo puedo guiarte hoy?",
        timestamp: "22:02",
        isUser: false
      }
    ]
  }
};

// Validación de teléfono por país
export const phoneValidation: Record<string, { digits: number; placeholder: string; pattern: string }> = {
  "+1": { 
    digits: 10, 
    placeholder: "2025551234",
    pattern: "^[0-9]{10}$"
  },
  "+52": { 
    digits: 10, 
    placeholder: "5512345678",
    pattern: "^[0-9]{10}$"
  },
  "+34": { 
    digits: 9, 
    placeholder: "612345678",
    pattern: "^[0-9]{9}$"
  },
  "+54": { 
    digits: 10, 
    placeholder: "1123456789",
    pattern: "^[0-9]{10}$"
  },
  "+57": { 
    digits: 10, 
    placeholder: "3001234567",
    pattern: "^[0-9]{10}$"
  },
  "+58": { 
    digits: 10, 
    placeholder: "4121234567",
    pattern: "^[0-9]{10}$"
  }
};