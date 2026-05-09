"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChartNoAxesColumn, GraduationCap, Home, Languages, LogIn, Sparkles, UserRound } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

const parentLinks = [
  { href: "/parent/dashboard", label: "Дашборд", icon: Home },
  { href: "/parent/children", label: "Дети", icon: UserRound },
  { href: "/child/select", label: "Детский режим", icon: Sparkles },
  { href: "/parent/cards", label: "Карточки", icon: BookOpen },
  { href: "/parent/progress", label: "Прогресс", icon: ChartNoAxesColumn }
];

const childLinks = [
  { href: "/child/select", label: "Профиль", icon: Sparkles },
  { href: "/child/dashboard", label: "Домик", icon: Home },
  { href: "/child/practice", label: "Занятие", icon: GraduationCap }
];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, setLang } = useI18n();
  const links = pathname.startsWith("/child") ? childLinks : parentLinks;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-sky-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/login" className="flex items-center gap-2 font-bold text-ink">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-mint text-xl">ABC</span>
            <span className="hidden sm:inline">Kids English Trainer</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === href ? "bg-skysoft text-ink" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}
            <Link href="/grammar" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Грамматика
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <button
              className="focus-ring flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm"
              onClick={() => setLang(lang === "ru" ? "en" : "ru")}
              type="button"
              title="Language"
            >
              <Languages size={17} />
              {lang.toUpperCase()}
            </button>
            <Link className="focus-ring grid h-10 w-10 place-items-center rounded-lg bg-ink text-white" href="/login" title="Вход">
              <LogIn size={18} />
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-3 border-t border-sky-100 bg-white md:hidden">
        {links.slice(0, 3).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-1 px-2 py-2 text-xs">
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
