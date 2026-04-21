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
          question: "¿Esta situación se relaciona con tu vida amorosa?",
          options: ["Sí", "No", "Tal vez"]
        },
        {
          question: "¿Qué quieres hacer?",
          options: ["Recuperarlo/a", "Estar cerca de él/ella", "Encontrar el amor verdadero", "Mejorar mi relación actual"]
        },
        {
          question: "¿Hace cuánto tiempo?",
          options: ["Menos de 1 mes", "1-3 meses", "3-6 meses", "Más de 6 meses"]
        },
        {
          question: "¿Qué tan urgente es tu situación?",
          options: ["Muy urgente", "Urgente", "Moderado", "Puedo esperar"]
        }
      ];
    }
    
    if (cardName.includes("estrella")) {
      return [
        {
          question: "¿Esta situación te causa ansiedad o preocupación?",
          options: ["Mucha", "Algo", "Poca", "Ninguna"]
        },
        {
          question: "¿Qué quieres hacer?",
          options: ["Encontrar esperanza", "Sanar heridas del pasado", "Recuperar la fe", "Avanzar con claridad"]
        },
        {
          question: "¿Desde cuándo sientes esta inquietud?",
          options: ["Recientemente", "Algunas semanas", "Varios meses", "Mucho tiempo"]
        },
        {
          question: "¿Has intentado resolver esto antes?",
          options: ["Sí, varias veces", "Una vez", "No", "No sabía cómo"]
        }
      ];
    }
    
    if (cardName.includes("sol")) {
      return [
        {
          question: "¿Buscas claridad en algún aspecto de tu vida?",
          options: ["Amor", "Trabajo", "Familia", "Personal"]
        },
        {
          question: "¿Qué quieres hacer?",
          options: ["Encontrar mi propósito", "Superar obstáculos", "Manifestar abundancia", "Conectar con mi verdad"]
        },
        {
          question: "¿Qué tan importante es esto para ti?",
          options: ["Muy importante", "Importante", "Moderadamente", "Exploración"]
        },
        {
          question: "¿Te sientes bloqueado/a?",
          options: ["Muy bloqueado/a", "Un poco", "No mucho", "Para nada"]
        }
      ];
    }
    
    if (cardName.includes("emperatriz")) {
      return [
        {
          question: "¿Esta situación está relacionada con tu crecimiento personal?",
          options: ["Sí, totalmente", "En parte", "No estoy seguro/a", "No"]
        },
        {
          question: "¿Qué quieres hacer?",
          options: ["Crear abundancia", "Nutrir relaciones", "Desarrollar creatividad", "Conectar con mi feminidad/intuición"]
        },
        {
          question: "¿Hace cuánto buscas esta transformación?",
          options: ["Acaba de comenzar", "Semanas", "Meses", "Años"]
        },
        {
          question: "¿Qué te detiene?",
          options: ["Miedo", "Dudas", "Circunstancias externas", "Falta de guía"]
        }
      ];
    }
    
    if (cardName.includes("sacerdotisa")) {
      return [
        {
          question: "¿Buscas respuestas a preguntas profundas?",
          options: ["Sí, muchas", "Algunas", "Una en particular", "Solo curiosidad"]
        },
        {
          question: "¿Qué quieres hacer?",
          options: ["Despertar mi intuición", "Descubrir secretos ocultos", "Conectar con mi sabiduría interior", "Entender señales"]
        },
        {
          question: "¿Sientes que algo te está llamando?",
          options: ["Sí, fuertemente", "A veces", "No estoy seguro/a", "No"]
        },
        {
          question: "¿Confías en tu intuición?",
          options: ["Totalmente", "Algo", "Poco", "Quiero aprender"]
        }
      ];
    }
    
    // Preguntas genéricas si no hay match específico
    return [
      {
        question: "¿Esta situación es urgente para ti?",
        options: ["Muy urgente", "Urgente", "Moderada", "Exploración"]
      },
      {
        question: "¿Qué quieres hacer?",
        options: ["Resolver un problema", "Encontrar claridad", "Sanar", "Crecer espiritualmente"]
      },
      {
        question: "¿Desde cuándo tienes esta inquietud?",
        options: ["Recientemente", "Semanas", "Meses", "Mucho tiempo"]
      },
      {
        question: "¿Has buscado ayuda antes?",
        options: ["Sí, varias veces", "Una vez", "No", "Primera vez"]
      }
    ];
  };

  const questions = getQuestions();

  const handleAnswer = (answer: string) => {
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
              {questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={option}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAnswer(option)}
                  className="w-full px-6 py-4 rounded-xl bg-card/50 border border-gold/20 text-foreground hover:border-gold/50 hover:bg-card/70 transition-all text-left group"
                  style={{
                    boxShadow: "0 0 20px hsl(var(--gold) / 0.1)",
                  }}
                >
                  <span className="text-base md:text-lg group-hover:text-gold transition-colors">
                    {option}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}