# LTIP Strategy

Strategies indexed by LTIP Live Objects:
- [LTIPHedgeyGovernorStrategy](https://github.com/allo-protocol/allo-v2/blob/main/contracts/strategies/ltip-hedgey-governor/LTIPHedgeyGovernorStrategy.sol)

## Live Objects

This section captures the live objects and the events which would be used to index this

### LTIPHedgeyGovernor

This Live Object is responsible for tracking the LTIP strategy using Hedgey and a Governor contract.  It includes all the relevant events and data fields.

- `event Initialized()`
- `event PoolActive(bool active);`
- `event AllocationPeriodExtended(uint64 allocationEndTime);`
- `event AdminAddressUpdated(address adminAddress, address sender);`
- `event AdminTransferOBOUpdated(bool adminTransferOBO, address sender);`
- `event VotingBlockUpdated(address adminAddress, uint256 blockNumber);`
- `event Registered(address indexed recipientId, bytes data, address sender);`
- `event UpdatedRegistration(address indexed recipientId, bytes data, address sender);`
- `event VestingPlanCreated(address indexed recipientId, address vestingContract, uint256 tokenId);`
- `event RecipientStatusUpdated(address indexed recipientId, uint256 applicationId, enum IStrategy.Status status, address sender);`
- `event VotesRevoked(address recipient, address sender);`
- `event Voted(address indexed recipientId, address voter);`
- `event Distributed(address sender, int96 flowRate);`

### LTIPBase

This Live Object tracks the core LTIP events. It's used in conjunction with `LTIPHedgeyGovernor` to provide a unified view of LTIP recipient data and status.  

- `event Allocated(address indexed recipientId, uint256 amount, address token, address sender);`
- `event AllocationRevoked(address indexed recipientId, address sender);`
- `event Canceled(address indexed recipientId, address sender);`
- `event Distributed(address sender, int96 flowRate);`