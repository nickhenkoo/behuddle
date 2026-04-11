import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface SparkInput {
  builder: { bio?: string | null; full_name?: string | null };
  project: { title: string; what_needed?: string | null; description?: string | null };
  contributor: { bio?: string | null; full_name?: string | null; motivation?: string | null };
  skills: string[];
}

export async function generateSpark(input: SparkInput): Promise<string> {
  const { builder, project, contributor, skills } = input;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 120,
    system: `You help people find collaborators for their projects.
Write in English, warm and specific. No filler. No generic praise.
One or two sentences max. Explain WHY exactly these two people could build something meaningful together — be concrete about the combination of their skills, context, and goals.`,
    messages: [
      {
        role: "user",
        content: `Builder: ${builder.full_name ?? "someone"} — ${builder.bio ?? "no bio"}
Project: ${project.title} — ${project.what_needed ?? project.description ?? "looking for collaborators"}
Contributor: ${contributor.full_name ?? "someone"} — ${contributor.bio ?? "no bio"}
Skills: ${skills.join(", ")}
Motivation: ${contributor.motivation ?? "wants to contribute"}

Write the Spark text.`,
      },
    ],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text.trim() : "";
}
