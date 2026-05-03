import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TarotCard } from "@/lib/tarotCards";

interface QuestionScreenProps {
  card: TarotCard;
  onAnswersComplete: (answers: string[]) => void;
}

export function QuestionScreen({ card, onAnswersComplete }: QuestionScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  // Generar preguntas basadas en la carta
  const getQuestions = (): { question: string; options: string[] }[] => {
    const cardName = card.name.toLowerCase();
    
    if (cardName.includes("enamorados")) {
      return [
        {
          question: "¿Cómo te hace sentir pensar en esta persona?",
          options: ["Paz y armonía", "Confusión", "Esperanza", "Quiero hablar ahora con el maestro"]
        },
        {
          question: "¿Qué deseas hacer?",
          options: ["Recuperarlo/a", "Estar cerca de él/ella", "Dejarlo ir", "Entenderlo mejor"]
        },
        {
          question: "¿Qué buscas principalmente?",
          options: ["Amor verdadero", "Claridad mental", "Sanación emocional", "Reconciliación"]
        }
      ];
    }
    
    if (cardName.includes("estrella")) {
      return [
        {
          question: "¿Te sientes perdido/a o confundido/a?",
          options: ["Muy perdido/a", "Un poco", "No mucho", "Quiero hablar ahora con el maestro"]
        },
        {
          question: "¿Qué deseas hacer?",
          options: ["Encontrar paz interior", "Sanar heridas del pasado", "Encontrar mi propósito", "Renovar mi fe"]
        },
        {
          question: "¿Qué necesitas ahora?",
          options: ["Esperanza", "Guía espiritual", "Renovación", "Inspiración"]
        }
      ];
    }
    
    if (cardName.includes("sol")) {
      return [
        {
          question: "¿Cómo te sientes con tu situación actual?",
          options: ["Optimista", "Inseguro/a", "Confundido/a", "Quiero hablar ahora con el maestro"]
        },
        {
          question: "¿Qué deseas hacer?",
          options: ["Encontrar alegría", "Superar obstáculos", "Crecer personalmente", "Manifestar abundancia"]
        },
        {
          question: "¿Qué buscas?",
          options: ["Éxito", "Felicidad", "Claridad", "Energía positiva"]
        }
      ];
    }
    
    if (cardName.includes("emperatriz")) {
      return [
        {
          question: "¿Sientes que algo falta en tu vida?",
          options: ["Sí, definitivamente", "Tal vez", "No estoy seguro/a", "Quiero hablar ahora con el maestro"]
        },
        {
          question: "¿Qué deseas hacer?",
          options: ["Crear abundancia", "Nutrir relaciones", "Desarrollar creatividad", "Conectar con mi feminidad"]
        },
        {
          question: "¿Qué necesitas?",
          options: ["Fertilidad/Creación", "Nutrición emocional", "Abundancia material", "Conexión espiritual"]
        }
      ];
    }
    
    if (cardName.includes("sacerdotisa")) {
      return [
        {
          question: "¿Buscas respuestas a algo?",
          options: ["Sí, muchas preguntas", "Algunas dudas", "Una pregunta específica", "Quiero hablar ahora con el maestro"]
        },
        {
          question: "¿Qué deseas hacer?",
          options: ["Despertar mi intuición", "Descubrir secretos ocultos", "Encontrar sabiduría interior", "Entender señales"]
        },
        {
          question: "¿Qué necesitas?",
          options: ["Desarrollar intuición", "Conocimiento profundo", "Misterio y magia", "Guía espiritual"]
        }
      ];
    }
    
    // Preguntas genéricas para otras cartas
    return [
      {
        question: "¿Cómo te sientes con tu situación?",
        options: ["Confundido/a", "Esperanzado/a", "Preocupado/a", "Quiero hablar ahora con el maestro"]
      },
      {
        question: "¿Qué deseas hacer?",
        options: ["Resolver un problema", "Encontrar claridad", "Sanar emocionalmente", "Crecer espiritualmente"]
      },
      {
        question: "¿Qué buscas?",
        options: ["Guía espiritual", "Paz interior", "Respuestas", "Transformación"]
      }
    ];
  };

  const QUESTIONS = getQuestions();

  const handleAnswer = (answer: string) => {
    // Si selecciona "Quiero hablar ahora con el maestro" en la primera pregunta
    if (currentQuestion === 0 && answer === "Quiero hablar ahora con el maestro") {
      console.log("⚡ Usuario quiere hablar directo con el maestro, saltando preguntas...");
      // Completar inmediatamente con solo esta respuesta
      onAnswersComplete([answer]);
      return;
    }

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      // Siguiente pregunta
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      // Completado
      setTimeout(() => {
        onAnswersComplete(newAnswers);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12 md:mb-16 max-w-3xl px-4"
      >
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gold tracking-wider">
          AFINA TU ENERGÍA
        </h1>
        <p className="text-gold/70 text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase">
          Pregunta {currentQuestion + 1} de {QUESTIONS.length}
        </p>
        <div className="w-full bg-secondary/30 rounded-full h-1.5 sm:h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Pregunta actual */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-4xl mx-auto w-full"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 via-accent/20 to-gold/20 rounded-2xl sm:rounded-3xl blur-2xl opacity-60" />
        
        <div className="relative bg-card/80 backdrop-blur-xl border-2 border-gold/30 rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl">
          {/* Texto de la pregunta */}
          <h2 className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground text-center mb-6 sm:mb-8 md:mb-10 leading-relaxed px-2">
            {QUESTIONS[currentQuestion].question}
          </h2>

          {/* Opciones de respuesta */}
          <div className="space-y-3 sm:space-y-4">
            {QUESTIONS[currentQuestion].options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswer(option)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="w-full group relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 transition-all border-2 border-gold/30 hover:border-gold/60 bg-secondary/30 hover:bg-secondary/50 shadow-lg hover:shadow-xl hover:shadow-gold/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-accent/5 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold text-sm sm:text-base">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-foreground/90 text-left text-sm sm:text-base md:text-lg flex-1">
                    {option}
                  </span>
                  <div className="flex-shrink-0 text-gold/60 group-hover:text-gold transition-colors">
                    →
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Círculos decorativos */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-gold/10"
            style={{
              width: `${250 + i * 100}px`,
              height: `${250 + i * 100}px`,
              left: "50%",
              top: "50%",
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}