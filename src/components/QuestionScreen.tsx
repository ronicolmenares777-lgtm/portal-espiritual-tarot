"use client";

import { useState } from "react";

interface QuestionScreenProps {
  question: string;
  options: string[];
  onAnswer?: (answer: string) => void;
}

export function QuestionScreen({ question, options, onAnswer }: QuestionScreenProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    setTimeout(() => {
      onAnswer?.(option);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-in fade-in duration-1000">
      <div className="max-w-2xl w-full space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex justify-center gap-1 text-gold/60 text-sm tracking-[0.3em]">
            <span>━━━</span>
            <span>PRECISIÓN ENERGÉTICA</span>
            <span>━━━</span>
          </div>
        </div>

        {/* Pregunta */}
        <div className="text-center animate-in fade-in duration-1000 delay-300">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-12">
            {question}
          </h2>
        </div>

        {/* Opciones */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              className={`group w-full px-8 py-5 rounded-2xl border-2 transition-all duration-500 ${
                selectedOption === option
                  ? "bg-gold/20 border-gold shadow-[0_0_30px_rgba(212,175,55,0.4)] scale-105"
                  : "bg-card/50 border-purple-border hover:border-gold/50 hover:bg-card hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className={`text-lg transition-colors duration-300 ${
                  selectedOption === option ? "text-gold font-semibold" : "text-foreground group-hover:text-gold/80"
                }`}>
                  {option}
                </span>
                
                <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                  selectedOption === option 
                    ? "border-gold bg-gold" 
                    : "border-purple-border group-hover:border-gold/50"
                }`}>
                  {selectedOption === option && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-purple-deep rounded-full" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}