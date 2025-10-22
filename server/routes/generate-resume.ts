import { RequestHandler } from "express";

interface ResumeForm {
  name: string;
  title: string;
  email: string;
  phone: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  photoUrl?: string;
}

export const handleGenerateResume: RequestHandler = async (req, res) => {
  try {
    const { persona, data, template } = req.body as {
      persona?: string;
      data?: ResumeForm;
      template?: "modern" | "classic" | string;
    };

    if (!data) {
      return res.status(400).json({ ok: false, error: "Missing data" });
    }

    // Very simple transformation to a structured resume shape.
    const skillsArr = Array.isArray(data.skills)
      ? (data.skills as unknown as string[])
      : String(data.skills)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    const openai = {
      header: {
        name: data.name,
        title: data.title,
        contact: `${data.email} • ${data.phone}`,
      },
      summary: data.summary,
      experience: [
        {
          company: data.experience.split(":")[0] || "",
          role: data.title,
          period: "",
          details: data.experience,
        },
      ],
      education: [
        { school: data.education },
      ],
      skills: skillsArr,
      meta: { persona: persona ?? "concise_resume", template: template ?? "modern" },
    };

    res.json({ ok: true, openai });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || "Server error" });
  }
};
