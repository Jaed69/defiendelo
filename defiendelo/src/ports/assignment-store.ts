import type { Assignment } from "@/domain/types";

export interface AssignmentStore {
  get(id: string): Promise<Assignment | null>;
  save(assignment: Assignment): Promise<void>;
}
