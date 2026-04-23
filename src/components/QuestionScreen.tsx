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

  const questions = getQuestions();

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

    if (currentQuestion < questions.length - 1) {
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progreso */}
        <div className="mb-8">
          <div className="flex justify-center gap-2 mb-4">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  index <= currentQuestion ? "bg-gold" : "bg-muted/30"
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Pregunta {currentQuestion + 1} de {questions.length}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Pregunta */}
            <h2 className="text-2xl md:text-3xl font-serif text-gold mb-12 tracking-wider">
              {questions[currentQuestion].question}
            </h2>

            {/* Opciones */}
            <div className="space-y-4">
              {questions[currentQuestion].options.map((option, index) => {
                const isMaestroOption = option === "Quiero hablar ahora con el maestro";
                
                return (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleAnswer(option)}
                    className={`w-full px-6 py-4 rounded-xl border text-left group transition-all ${
                      isMaestroOption
                        ? "bg-gold/20 border-gold/60 hover:bg-gold/30 hover:border-gold"
                        : "bg-card/50 border-gold/20 hover:border-gold/50 hover:bg-card/70"
                    }`}
                    style={{
                      boxShadow: isMaestroOption 
                        ? "0 0 30px hsl(var(--gold) / 0.3)"
                        : "0 0 20px hsl(var(--gold) / 0.1)",
                    }}
                  >
                    <span className={`text-base md:text-lg transition-colors ${
                      isMaestroOption
                        ? "text-gold font-semibold"
                        : "text-foreground group-hover:text-gold"
                    }`}>
                      {isMaestroOption && "⚡ "}
                      {option}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}