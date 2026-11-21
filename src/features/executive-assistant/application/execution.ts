import {
  ExecutiveRequestSchema,
  ExecutiveReceiptSchema,
  type ExecutiveAssistantGateway,
} from "./contracts";
import {
  canUseExecutive,
  validateActionDependencies,
  classifyActionRisk,
  type ActionStep,
} from "../domain";
import type { z } from "zod";
export class ExecutiveExecutionCoordinator {
  private pending = new Set<string>();
  constructor(private gateway: ExecutiveAssistantGateway) {}
  async request(
    input: z.infer<typeof ExecutiveRequestSchema>,
    viewer: { actorId: string; organizationId: string; roles: string[] },
    objective: string,
    steps: ActionStep[],
    stepId: string,
  ) {
    const command = ExecutiveRequestSchema.parse(input);
    if (
      !canUseExecutive(viewer.roles, viewer.actorId) ||
      viewer.actorId !== command.actorId ||
      viewer.organizationId !== command.organizationId
    )
      throw new Error("FORBIDDEN");
    if (classifyActionRisk(objective) >= 5) throw new Error("ACTION_PROHIBITED");
    if (!command.approvalReference) throw new Error("APPROVAL_REQUIRED");
    if (!validateActionDependencies(steps, stepId)) throw new Error("MISSING_INFORMATION");
    if (this.pending.has(command.idempotencyKey)) throw new Error("EXECUTION_CONFLICT");
    this.pending.add(command.idempotencyKey);
    try {
      const receipt = ExecutiveReceiptSchema.parse(
        await this.gateway.invoke("requestExecutiveExecution", command),
      );
      if (
        receipt.entityId !== command.entityId ||
        receipt.correlationId !== command.correlationId ||
        receipt.version < command.expectedVersion
      )
        throw new Error("EXECUTION_CONFLICT");
      return receipt;
    } finally {
      this.pending.delete(command.idempotencyKey);
    }
  }
}
