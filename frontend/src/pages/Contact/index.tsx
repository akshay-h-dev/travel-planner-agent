import React, { useState } from "react";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTrip } from "../../context/TripContext";

export const Contact: React.FC = () => {
  const { showToast } = useTrip();

  // state for form submit
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !msg) return;
    showToast("Support ticket launched. We'll reply within 4 hours!", "success");
    setName("");
    setEmail("");
    setMsg("");
  };

  // FAQ states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does the AI dynamic budget replanner work?",
      a: "Our AI scans rooms and schedules. If you input a lower budget on the results page, the planner switches staying properties and downgrades private cabs to shared buses until the total cost falls below the new threshold."
    },
    {
      q: "Does TripWay take a commission tax from local operator bookings?",
      a: "No. TripWay is built as a zero-tax direct settlement registry. Homestays and native guides collect 100% of price listings."
    },
    {
      q: "Are the operators verified for safety and quality metrics?",
      a: "Yes. All regional hosts, guides, and taxi collectives must clear auditing checks, upload tourism credentials, and maintain minimum user ratings above 4.2."
    },
    {
      q: "Can I connect the frontend with external APIs later?",
      a: "Absolutely. The frontend is built on structured JSON model states matching standard REST payloads."
    }
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      
      <div className="space-y-1">
        <Breadcrumb items={[{ name: "Contact & FAQs" }]} />
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-805 dark:text-white pt-1">
          Support Center & FAQ Desk
        </h1>
        <p className="text-xs text-slate-500 font-medium">Find immediate answers or launch a direct host coordinator ticket.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMN LEFT: FAQ listing Accordions (col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-heading font-extrabold text-lg text-slate-800 dark:text-white mb-2">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="glass-card rounded-2xl border border-slate-205 dark:border-slate-800 overflow-hidden bg-white dark:bg-dark-card transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex justify-between items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/10"
                  >
                    <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                      {faq.q}
                    </span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN RIGHT: Ticket Forms (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-850 p-6 bg-white dark:bg-dark-card/95 space-y-4">
            <h2 className="font-heading font-extrabold text-sm text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Submit Support Ticket
            </h2>

            <form onSubmit={handleTicketSubmit} className="space-y-3.5">
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-405 block">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Insert name"
                  className="input-premium py-2 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-405 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@student.in"
                  className="input-premium py-2 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-405 block">Message detail</label>
                <textarea
                  rows={4}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Explain issue..."
                  className="input-premium py-2 text-xs h-28"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-2 text-xs font-bold rounded-xl"
              >
                Launch Direct Ticket
              </button>

            </form>
          </div>
        </div>

      </div>

    </div>
  );
};
