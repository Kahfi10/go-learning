"use client";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { type QuizOption } from "@/lib/api";

interface Props {
  questions: QuizOption[];
  lang: "id" | "en";
  topicSlug: string;
  lessonId: string;
  onComplete?: (score: number, total: number) => void;
  onOpen?: () => void;
}

export default function Quiz({ questions, lang, topicSlug, lessonId, onComplete, onOpen }: Props) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  const q = questions[current];
  const question = lang === "id" ? q.question_id : q.question_en;
  const options = lang === "id" ? q.options_id : q.options_en;
  const isAnswered = answers[current] !== null;
  const isCorrect = answers[current] === q.correct;

  useEffect(() => {
    onOpen?.();
  }, [onOpen]);

  function handleSelect(idx: number) {
    if (isAnswered) return;
    const newAnswers = [...answers];
    newAnswers[current] = idx;
    setAnswers(newAnswers);
    setSelected(idx);

    // GSAP feedback
    import("gsap").then(({ gsap }) => {
      if (idx === q.correct) {
        gsap.fromTo(feedbackRef.current, { scale: 0.97, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" });
      } else {
        gsap.to(`[data-option="${idx}"]`, {
          keyframes: [
            { x: 0 },
            { x: -8 },
            { x: 8 },
            { x: -6 },
            { x: 6 },
            { x: 0 },
          ],
          duration: 0.4,
          ease: "power2.inOut",
        });
      }
    });
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      const score = answers.filter((a, i) => a === questions[i].correct).length;
      setShowResult(true);
      onComplete?.(score, questions.length);
    }
  }

  function restart() {
    setCurrent(0);
    setSelected(null);
    setAnswers(Array(questions.length).fill(null));
    setShowResult(false);
  }

  if (showResult) {
    const score = answers.filter((a, i) => a === questions[i].correct).length;
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[18px] p-6 text-center border border-[#D2D2D7]/40 dark:border-white/8 shadow-sm">
        <div className={cn("text-[48px] font-display font-semibold mb-2", pct === 100 ? "text-[#34C759]" : pct >= 60 ? "text-[#0071E3]" : "text-[#FF453A]")}>
          {pct}%
        </div>
        <p className="text-foreground font-medium mb-1">{score}/{questions.length} jawaban benar</p>
        <p className="text-[#86868B] text-[13px] mb-6">
          {pct === 100 ? "Sempurna! +25 XP bonus 🎉" : pct >= 60 ? "Bagus! Kamu paham materinya." : "Coba pelajari ulang materinya."}
        </p>
        <button onClick={restart}
          className="inline-flex items-center gap-2 text-[#0071E3] text-[14px] font-medium hover:underline">
          <RotateCcw className="w-3.5 h-3.5" /> Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5F7] dark:bg-[#1C1C1E] rounded-[18px] p-6 border border-[#D2D2D7]/40 dark:border-white/8 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-[12px] text-[#86868B] font-medium">
          Soal {current + 1} / {questions.length}
        </p>
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div key={i} className={cn("w-2 h-2 rounded-full transition-colors",
              i === current ? "bg-[#0071E3]" :
              answers[i] === null ? "bg-[#D2D2D7]" :
              answers[i] === questions[i].correct ? "bg-[#34C759]" : "bg-[#FF453A]"
            )} />
          ))}
        </div>
      </div>

      {/* Question */}
      <p className="font-medium text-[16px] text-foreground mb-5 leading-relaxed">{question}</p>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {options.map((opt, idx) => (
          <button key={idx} data-option={idx} onClick={() => handleSelect(idx)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-[12px] text-[14px] font-medium transition-all border",
              !isAnswered
                ? "border-[#D2D2D7] dark:border-white/10 hover:border-[#0071E3]/50 hover:bg-[#0071E3]/5 text-foreground"
                : idx === q.correct
                  ? "border-[#34C759] bg-[#34C759]/10 text-[#34C759]"
                  : idx === answers[current]
                    ? "border-[#FF453A] bg-[#FF453A]/10 text-[#FF453A]"
                    : "border-[#D2D2D7]/50 dark:border-white/5 text-[#86868B]"
            )}>
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[11px] flex-shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              {opt}
              {isAnswered && idx === q.correct && <CheckCircle2 className="w-4 h-4 ml-auto flex-shrink-0" />}
              {isAnswered && idx === answers[current] && idx !== q.correct && <XCircle className="w-4 h-4 ml-auto flex-shrink-0" />}
            </div>
          </button>
        ))}
      </div>

      {/* Feedback */}
      {isAnswered && (
        <div ref={feedbackRef} className={cn("rounded-[12px] px-4 py-3 mb-4 text-[13px]",
          isCorrect ? "bg-[#34C759]/10 text-[#34C759]" : "bg-[#FF453A]/10 text-[#FF453A]")}>
          {isCorrect ? "✓ Benar! Lanjut ke soal berikutnya." : `✗ Kurang tepat. Jawaban benar: ${String.fromCharCode(65 + q.correct)}`}
        </div>
      )}

      {/* Next */}
      {isAnswered && (
        <button onClick={handleNext}
          className="flex items-center gap-2 bg-[#0071E3] text-white text-[14px] font-medium px-5 py-2.5 rounded-full hover:bg-[#0077ED] transition-colors">
          {current < questions.length - 1 ? "Soal Berikutnya" : "Lihat Hasil"}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
