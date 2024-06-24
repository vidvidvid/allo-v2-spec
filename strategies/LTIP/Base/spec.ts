import {
  Address,
  BeforeAll,
  Event,
  LiveTable,
  OnEvent,
  Property,
  Spec,
} from "@spec.dev/core";

import { getStatusFromInt } from "../../../shared/status.ts";

/**
 * LTIP Base Live Object
 */
@Spec({
  uniqueBy: ["chainId", "poolId", "recipientId"],
})
class LTIPBase extends LiveTable {
  @Property()
  recipientId: Address;

  @Property()
  strategy: Address;

  @Property()
  poolId: string;

  @Property()
  recipientAddress: Address;

  @Property()
  allocationAmount: number;

  @Property()
  isUsingRegistryAnchor: boolean;

  @Property()
  status: string;

  @Property()
  metadataProtocol: number;

  @Property()
  metadataPointer: string;

  @Property()
  sender: Address;

  @Property()
  vestingContract: Address;

  @Property()
  tokenId: number;

  @Property()
  votes: number;

  // ====================
  // =  Event Handlers  =
  // ====================

  @BeforeAll()
  async setCommonProperties(event: Event) {
    const poolId = await this.contract.getPoolId();

    this.poolId = poolId.toString();
    this.strategy = event.origin.contractAddress;
    this.recipientId = event.data.recipientId;
  }

  @OnEvent("allov2.LTIPHedgeyGovernorStrategy.Allocated")
  onAllocated(event: Event) {
    this.status = getStatusFromInt(2); // Accepted
    this.allocationAmount = event.data.amount;
    this.votes = event.data.votes;
  }

  @OnEvent("allov2.LTIPHedgeyGovernorStrategy.AllocationRevoked")
  onAllocationRevoked(event: Event) {
    this.status = getStatusFromInt(6); // Canceled
  }

  @OnEvent("allov2.LTIPHedgeyGovernorStrategy.Canceled")
  onCanceled(event: Event) {
    this.status = getStatusFromInt(6); // Canceled
  }

  @OnEvent("allov2.LTIPHedgeyGovernorStrategy.Distributed")
  onDistributed(event: Event) {
    this.status = getStatusFromInt(3); // Rejected
  }

  upsertRecipientOnRegistration(
    useRegistryAnchor: boolean,
    recipientAddress: Address,
    metadata: { protocol: number; pointer: string },
    allocationAmount: number,
  ) {
    this.isUsingRegistryAnchor = useRegistryAnchor;
    this.recipientAddress = recipientAddress;
    this.metadataProtocol = metadata.protocol;
    this.metadataPointer = metadata.pointer;
    this.allocationAmount = allocationAmount;
  }
}

export default LTIPBase;