import type { Assignment } from "@/domain/types";
import type { AssignmentStore } from "@/ports/assignment-store";

const TTL_SECONDS = 60 * 60 * 24 * 30;

/** Upstash Redis over its REST API, so deployed serverless instances share state. */
export class UpstashAssignmentStore implements AssignmentStore {
  constructor(
    private readonly url: string,
    private readonly token: string,
  ) {}

  private async command(args: (string | number)[]): Promise<unknown> {
    const response = await fetch(this.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Upstash request failed with ${response.status}`);
    const body = (await response.json()) as { result?: unknown; error?: string };
    if (body.error) throw new Error(`Upstash error: ${body.error}`);
    return body.result;
  }

  async get(id: string): Promise<Assignment | null> {
    const raw = await this.command(["GET", `assignment:${id}`]);
    return typeof raw === "string" ? (JSON.parse(raw) as Assignment) : null;
  }

  async save(assignment: Assignment): Promise<void> {
    await this.command(["SET", `assignment:${assignment.id}`, JSON.stringify(assignment), "EX", TTL_SECONDS]);
  }
}
