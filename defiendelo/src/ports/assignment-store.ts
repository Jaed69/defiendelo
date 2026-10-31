import type { Account, Assignment } from "@/domain/types";

export interface AssignmentStore {
  get(id: string): Promise<Assignment | null>;
  save(assignment: Assignment): Promise<void>;
  getAccount(code: string): Promise<Account | null>;
  saveAccount(account: Account): Promise<void>;
}
