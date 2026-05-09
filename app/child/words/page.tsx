import { PageHeader, Panel } from "@/components/ui";
import { BookOpen, CalendarCheck, Headphones, RotateCcw, Sparkles, Tags } from "lucide-react";
import Link from "next/link";

const modes = [
  { href: "/child/practice", title: "Занятие дня", text: "Смешанная короткая тренировка", icon: CalendarCheck, className: "bg-berry text-white" },
  { href: "/child/words/new", title: "Учить новые слова", text: "Посмотреть, послушать, выбрать", icon: Sparkles, className: "bg-mint text-ink" },
  { href: "/child/words/review", title: "Повторить слова", text: "Слова, которые пора повторить", icon: RotateCcw, className: "bg-skysoft text-ink" },
  { href: "/child/words/mistakes", title: "Повторить ошибки", text: "Потренировать трудные слова", icon: BookOpen, className: "bg-peach text-ink" },
  { href: "/child/words/topics", title: "Слова по темам", text: "Food, Animals, School и другие", icon: Tags, className: "bg-white text-ink" },
  { href: "/child/texts", title: "Читать и слушать тексты", text: "Маленькие истории с вопросами", icon: Headphones, className: "bg-white text-ink" }
];

export default function ChildWordsPage() {
  return (
    <>
      <PageHeader title="Как учить слова" subtitle="Выбери режим. Здесь нет огромного списка: только короткие понятные занятия." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modes.map(({ href, title, text, icon: Icon, className }) => (
          <Link className={`rounded-lg border border-sky-100 p-5 shadow-soft ${className}`} href={href} key={href}>
            <Icon size={34} />
            <span className="mt-4 block text-2xl font-bold">{title}</span>
            <span className="mt-2 block text-sm opacity-80">{text}</span>
          </Link>
        ))}
      </div>
      <Panel className="mt-5">
        <p className="text-slate-600">Карточки редактирует родитель. Ребенок учит слова через маленькие режимы, а тексты помогают увидеть эти слова в коротких историях.</p>
      </Panel>
    </>
  );
}
