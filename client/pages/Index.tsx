import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  GenerateResumePayload,
  GenerateResumeResponse,
  GeneratedResumeData,
  ResumeFormData,
  ResumeTemplate,
} from "@shared/api";

const apiBaseUrl = "/api";

export default function Index() {
  const [form, setForm] = useState<ResumeFormData>({
    name: "Jane Doe",
    title: "Senior Product Designer",
    email: "jane@example.com",
    phone: "+1 555 555 5555",
    summary: "Product designer with 8+ years building delightful experiences.",
    experience:
      "Lead Designer at Acme Corp (2020-2024): Led redesign of core product increasing engagement by 24%. Mentored a team of 5 designers and built scalable design systems.",
    education: "B.Des — University of Design",
    skills: "Figma, React, Design Systems, Prototyping, UX Research",
  });
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<GeneratedResumeData | { error: string } | null>(null);
  const [template, setTemplate] = useState<ResumeTemplate>("modern");

  async function handleGenerate() {
    setLoading(true);
    setGenerated(null);
    const payload: GenerateResumePayload = {
      persona: "concise_resume",
      data: form,
      template,
    };
    try {
      const res = await fetch(`${apiBaseUrl}/generate-resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json: GenerateResumeResponse = await res.json();
      setGenerated(json.ok ? json.openai ?? null : { error: json.error || "Failed" });
    } catch (err: any) {
      setGenerated({ error: err.message });
    }
    setLoading(false);
  }

  async function handleExportPdf() {
    const element = document.getElementById("resume-preview");
    if (!element) return;
    const mod = await import("html2pdf.js");
    const html2pdf = (mod as any).default ?? (mod as any);
    html2pdf()
      .from(element)
      .save(`${form.name.replace(/\s+/g, "_")}_resume.pdf`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-600 to-violet-600" />
            <span className="font-semibold text-slate-800">ResumeCraft</span>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">Build a polished resume in minutes</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid gap-6 lg:grid-cols-2">
        <section className="bg-white/90 backdrop-blur border rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Your details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              "name",
              "title",
              "email",
              "phone",
            ] as (keyof ResumeFormData)[]).map((key) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                <Input
                  id={key}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                rows={3}
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="experience">Experience</Label>
              <Textarea
                id="experience"
                rows={4}
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                value={form.education}
                onChange={(e) => setForm({ ...form, education: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input
                id="skills"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <Select value={template} onValueChange={(v) => setTemplate(v as ResumeTemplate)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleGenerate} disabled={loading} className="w-full sm:w-auto">
              {loading ? "Generating…" : "Generate"}
            </Button>
            <Button variant="secondary" onClick={handleExportPdf} className="w-full sm:w-auto">
              Export PDF
            </Button>
          </div>
        </section>

        <section className="bg-white/90 backdrop-blur border rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Preview</h2>
          <div id="resume-preview" className="bg-white border rounded-lg p-6 sm:p-8">
            {generated ? (
              "error" in generated ? (
                <div className="text-red-600">{generated.error}</div>
              ) : (
                <ResumeRenderer data={generated} template={template} form={form} />
              )
            ) : (
              <div className="text-slate-500">No resume yet. Click Generate.</div>
            )}
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-xs text-slate-500">
        Crafted with ❤️ — ResumeCraft
      </footer>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-semibold tracking-wide text-slate-700 mb-2">{children}</h4>;
}

function ResumeRenderer({
  data,
  template,
  form,
}: {
  data: GeneratedResumeData;
  template: ResumeTemplate;
  form: ResumeFormData;
}) {
  if ((data as any).raw) return (
    <pre className="text-xs whitespace-pre-wrap text-slate-700">{(data as any).raw}</pre>
  );

  const r = data;
  const header = r.header || {
    name: form.name,
    title: form.title,
    contact: `${form.email} • ${form.phone}`,
  };
  const summary = r.summary || form.summary;
  const experience = r.experience || [
    { company: "—", role: form.title, period: "", details: form.experience },
  ];
  const education = r.education || [{ school: form.education }];
  const skills = r.skills || form.skills.split(",").map((s) => s.trim());

  if (template === "modern") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{header.name}</h1>
          <div className="text-slate-700">{header.title}</div>
          <div className="text-slate-500 text-sm">{header.contact}</div>
        </div>

        <section>
          <SectionTitle>Summary</SectionTitle>
          <p className="text-slate-700 leading-relaxed">{summary}</p>
        </section>

        <section className="space-y-3">
          <SectionTitle>Experience</SectionTitle>
          {experience.map((ex, i) => (
            <div key={i} className="border-l-2 border-slate-200 pl-3">
              <div className="flex flex-wrap items-baseline gap-x-2 text-slate-800">
                <span className="font-medium">{ex.role}</span>
                <span className="text-slate-500">— {ex.company}</span>
                {ex.period ? (
                  <span className="ml-auto text-xs text-slate-500">{ex.period}</span>
                ) : null}
              </div>
              <div className="text-slate-700 text-sm mt-1">{ex.details}</div>
            </div>
          ))}
        </section>

        <section className="space-y-2">
          <SectionTitle>Education</SectionTitle>
          {education.map((ed, i) => (
            <div key={i} className="text-slate-700">{ed.school}</div>
          ))}
        </section>

        <section className="space-y-2">
          <SectionTitle>Skills</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(skills) ? skills : String(skills).split(",")).map((s, i) => (
              <span
                key={i}
                className={cn(
                  "text-xs px-2 py-1 rounded-md border",
                  "bg-gradient-to-br from-blue-50 to-violet-50 border-blue-200 text-blue-800"
                )}
              >
                {String(s).trim()}
              </span>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{header.name}</h1>
        <div className="text-slate-700">
          {header.title} — <span className="text-slate-500">{header.contact}</span>
        </div>
      </div>
      <section>
        <SectionTitle>Profile</SectionTitle>
        <p className="text-slate-700 leading-relaxed">{summary}</p>
      </section>
      <section className="space-y-3">
        <SectionTitle>Work Experience</SectionTitle>
        {experience.map((ex, i) => (
          <div key={i}>
            <div className="font-medium text-slate-800">
              {ex.role} — {ex.company} {ex.period ? (<span className="text-xs text-slate-500">{ex.period}</span>) : null}
            </div>
            <div className="text-slate-700 text-sm">{ex.details}</div>
          </div>
        ))}
      </section>
      <section className="space-y-2">
        <SectionTitle>Education</SectionTitle>
        {education.map((ed, i) => (
          <div key={i} className="text-slate-700">{ed.school}</div>
        ))}
      </section>
      <section className="space-y-2">
        <SectionTitle>Skills</SectionTitle>
        <div className="text-slate-700">
          {Array.isArray(skills) ? (skills as string[]).join(", ") : skills}
        </div>
      </section>
    </div>
  );
}
