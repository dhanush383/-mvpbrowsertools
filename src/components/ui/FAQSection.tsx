import type { FAQ } from "../../types";

interface FAQSectionProps {
  faqs: FAQ[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  return (
    <section className="space-y-4" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-semibold text-slate-950">
        Frequently asked questions
      </h2>
      <div className="grid gap-3">
        {faqs.map((faq) => (
          <details key={faq.question} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <summary className="cursor-pointer font-semibold text-slate-900">{faq.question}</summary>
            <p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
