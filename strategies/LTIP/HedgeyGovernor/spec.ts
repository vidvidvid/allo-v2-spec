import {
  Address,
  BeforeAll,
  Event,
  LiveTable,
  OnEvent,
  Property,
  Spec,
} from "@spec.dev/core";

import {
  decodeGenericRegistrationData,
  decodeLTIPHedgeyGovernorInitializedData,
} from "../../../shared/decoders.ts";
import { getStatusFromInt } from "../../../shared/status.ts";
import LTIPBase from "../Base/spec.ts";

/**
 * LTIP Hedgey Governor
 */
@Spec({
  uniqueBy: ["chainId", "poolId"],
})
class LTIPHedgeyGovernor extends LiveTable {
  @Property()
  strategy: Address;

  @Property()
  poolId: string;

  @Property()
  registryGating: boolean;

  @Property()
  metadataRequired: boolean;

  @Property()
  votingThreshold: number;

  @Property()
  registrationStartTime: number;

  @Property()
  registrationEndTime: number;

  @Property()
  reviewStartTime: number;

  @Property()
  reviewEndTime: number;

  @Property()
  allocationStartTime: number;

  @Property()
  allocationEndTime: number;

  @Property()
  distributionStartTime: number;

  @Property()
  distributionEndTime: number;

  @Property()
  vestingPeriod: number;

  @Property()
  active: boolean;

  @Property()
  hedgeyContract: Address;

  @Property()
  vestingAdmin: Address;

  @Property()
  adminTransferOBO: boolean;

  @Property()
  governorContract: Address;

  @Property()
  votingBlock: number;

  // ====================
  // =  Event Handlers  =
  // ====================

  @BeforeAll()
  async setCommonProperties(event: Event) {
    const poolId = await this.contract.getPoolId();

    this.poolId = poolId.toString();
    this.strategy = event.origin.contractAddress;
  }

  @OnEvent("allov2.LTIPHedgeyGovernorStrategy.Initialized")
  onInitialized(event: Event) {
    // Decode InitializeParamsGovernor
    const {
      governorContract,
      votingBlock,
      hedgeyContract,
      vestingAdmin,
      adminTransferOBO,
      registryGating,
      metadataRequired,
      votingThreshold,
      registrationStartTime,
      registrationEndTime,
      reviewStartTime,
      reviewEndTime,
      allocationStartTime,
      allocationEndTime,
      distributionStartTime,
      distributionEndTime,
      vestingPeriod,
    } = decodeLTIPHedgeyGovernorInitializedData(event.data.data);
  
    // Assign values to the Live Object properties
    this.registryGating = registryGating;
    this.metadataRequired = metadataRequired;
    this.votingThreshold = votingThreshold;
    this.registrationStartTime = registrationStartTime;
    this.registrationEndTime = registrationEndTime;
    this.reviewStartTime = reviewStartTime;
    this.reviewEndTime = reviewEndTime;
    this.allocationStartTime = allocationStartTime;
    this.allocationEndTime = allocationEndTime;
    this.distributionStartTime = distributionStartTime;
    this.distributionEndTime = distributionEndTime;
    this.vestingPeriod = vestingPeriod;
    this.hedgeyContract = hedgeyContract;
    this.vestingAdmin = vestingAdmin;
    this.adminTransferOBO = adminTransferOBO;
    this.governorContract = governorContract;
    this.votingBlock = votingBlock;
  }

  @OnEvent("allov2.LTIPHedgeyGovernorStrategy.PoolActive")
  onPoolStatusUpdate(event: Event) {
    this.active = event.data.active;
  }

  @OnEvent("allov2.LTIPHedgeyGovernorStrategy.AllocationPeriodExtended")
  onAllocationPeriodExtended(event: Event) {
    this.allocationEndTime = event.data.allocationEndTime;
  }

  @OnEvent("allov2.LTIPHedgeyGovernorStrategy.AdminAddressUpdated")
  onAdminAddressUpdated(event: Event) {
    this.vestingAdmin = event.data.adminAddress;
  }

  @OnEvent("allov2.LTIPHedgeyGovernorStrategy.AdminTransferOBOUpdated")
  onAdminTransferOBOUpdated(event: Event) {
    this.adminTransferOBO = event.data.adminTransferOBO;
  }

  @OnEvent("allov2.LTIPHedgeyGovernorStrategy.VotingBlockUpdated")
  onVotingBlockUpdated(event: Event) {
    this.votingBlock = event.data.blockNumber;
  }

  @OnEvent("allov2.LTIPHedgeyGovernorStrategy.Registered")
  @OnEvent("allov2.LTIPHedgeyGovernorStrategy.UpdatedRegistration")
  async onRegistration(event: Event) {
    const useRegistryAnchor = await this.contract.registryGating();

    // decode to get
    const { recipientAddress, isUsingRegistryAnchor, metadata } =
      decodeGenericRegistrationData(useRegistryAnchor, event.data.data);

    // Create or update the recipient record in LTIPBase
    const baseLtip = this.findOne(LTIPBase, {
      poolId: this.poolId,
      chainId: this.chainId,
      recipientId: event.data.recipientId,
    });

    if (baseLtip) {
      baseLtip.upsertRecipientOnRegistration(
        useRegistryAnchor,
        recipientAddress,
        metadata,
        event.data.allocationAmount
      );
      baseLtip.status = getStatusFromInt(1); // Pending
      baseLtip.sender = event.data.sender;
      baseLtip.save();
    } else {
      // If the recipient doesn't exist, create a new record in LTIPBase
      const newBaseLtip = this.new(LTIPBase, {
        recipientId: event.data.recipientId,
        strategy: this.strategy,
        poolId: this.poolId,
        recipientAddress,
        allocationAmount: event.data.allocationAmount,
        isUsingRegistryAnchor,
        status: getStatusFromInt(1), // Pending
        metadataProtocol: metadata.protocol,
        metadataPointer: metadata.pointer,
        sender: event.data.sender,
      });
      await newBaseLtip.save();
    }
  }

  @OnEvent("allov2.LTIPHedgeyGovernorStrategy.VestingPlanCreated")
  onVestingPlanCreated(event: Event) {
    // Update recipient record with vesting plan details in LTIPBase
    const baseLtip = this.findOne(LTIPBase, {
      poolId: this.poolId,
      chainId: this.chainId,
      recipientId: event.data.recipientId,
    });
    if (baseLtip) {
      baseLtip.vestingContract = event.data.vestingContract;
      baseLtip.tokenId = event.data.tokenId;
      baseLtip.save();
    }
  }

  @OnEvent("allov2.LTIPHedgeyGovernorStrategy.RecipientStatusUpdated")
  async onRecipientStatusUpdated(event: Event) {
    // Update recipient status based on the event in LTIPBase
    const baseLtip = this.findOne(LTIPBase, {
      poolId: this.poolId,
      chainId: this.chainId,
      recipientId: event.data.recipientId,
    });
    if (baseLtip) {
      baseLtip.status = getStatusFromInt(event.data.status);
      baseLtip.save();
    }
  }

  @OnEvent("allov2.LTIPHedgeyGovernorStrategy.VotesRevoked")
  onVotesRevoked(event: Event) {
    // Update recipient's votes in the LTIPBase object.
    const baseLtip = this.findOne(LTIPBase, {
      poolId: this.poolId,
      chainId: this.chainId,
      recipientId: event.data.recipient,
    });
    if (baseLtip) {
      baseLtip.votes = event.data.votes;
      baseLtip.status =
        baseLtip.votes >= this.contract.votingThreshold
          ? getStatusFromInt(2) // Accepted
          : getStatusFromInt(1); // Pending
      baseLtip.save();
    }
  }
}

export default LTIPHedgeyGovernor;