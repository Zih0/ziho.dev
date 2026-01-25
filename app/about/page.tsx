import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About the author and this blog",
};

const CAREER = [
  {
    company: "Viva Republica(Toss)",
    role: "Frontend Developer",
    period: "2025 —",
  },
  {
    company: "Tosspayments",
    role: "Frontend Developer",
    period: "2022 — 2025",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 md:px-6 py-12 md:py-20 animate-fadeIn">
      <h1 className="text-2xl font-bold text-zinc-200 mb-6">ziho</h1>

      <p className="text-zinc-400 leading-relaxed mb-12">
        Everything for the funzies
      </p>

      <section className="mb-12">
        <h2 className="text-sm text-zinc-500 mb-4">Experience</h2>
        <ul className="space-y-4">
          {CAREER.map((item, idx) => (
            <li key={idx} className="flex items-baseline justify-between gap-4">
              <div>
                <span className="text-zinc-300">{item.company}</span>
                <span className="text-zinc-500 ml-2 text-sm">{item.role}</span>
              </div>
              <span className="text-sm text-zinc-600 shrink-0">
                {item.period}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm text-zinc-500 mb-4">Links</h2>
        <ul className="space-y-2">
          <li>
            <a
              href="https://github.com/zih0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/%EC%A7%80%ED%98%B8-%EC%8B%A0-73783b24b"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              href="mailto:ziho.dev@gmail.com"
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              ziho.dev@gmail.com
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
