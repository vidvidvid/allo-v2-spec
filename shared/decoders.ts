import { decodeAbi } from "@spec.dev/core";

import { formatMetadataAsStruct } from "./formatter";

// ====================
// =   RFP Decoder    =
// ====================
export function decodeRFPSimpleInitializedData(
  data: any
) {
  const [maxBid, useRegistryAnchor, metadataRequired] = decodeAbi(data, [
      "uint256",
      "bool",
      "bool",
  ]);

  return {
    maxBid,
    useRegistryAnchor,
    metadataRequired,
  };
}

export function decodeRFPCommitteeInitializedData(
  data: any
) {
  const [voteThreshold, rfpData ] = decodeAbi(data, [
      "uint256",
      "tuple(uint256, bool, bool)"
  ]);

  const [maxBid, useRegistryAnchor, metadataRequired] = rfpData;

  return {
    voteThreshold,
    maxBid,
    useRegistryAnchor,
    metadataRequired,
  };
}


export function decodeRFPRegistrationData(
  useRegistryAnchor: boolean,
  data: any
) {
  if (useRegistryAnchor) {
    const [, proposalBid, metadata] = decodeAbi(data, [
        "address",
        "uint256",
        "tuple(uint256, string)",
    ]);

    return {
      proposalBid,
      metatdata: formatMetadataAsStruct(metadata),
    };
  } else {
    const [, , proposalBid, metadata] = decodeAbi(data, [
        "address",
        "address",
        "uint256",
        "tuple(uint256, string)",
    ]);

    return {
      proposalBid,
      metadata: formatMetadataAsStruct(metadata),
    };
  }
}

// ================================================
// =   DonationVotingMerkleDistribution Decoder   =
// ================================================

export function decodeDonationVotingMerkleDistributionInitializedData(
  data: any
) {
  const [
    useRegistryAnchor,
    metadataRequired,
    registrationStartTime,
    registrationEndTime,
    allocationStartTime,
    allocationEndTime,
    allowedTokens,
  ] = decodeAbi(data, [
      "bool",
      "bool",
      "uint64",
      "uint64",
      "uint64",
      "uint64",
      "address[]"
  ]);

  return {
    useRegistryAnchor,
    metadataRequired,
    registrationStartTime,
    registrationEndTime,
    allocationStartTime,
    allocationEndTime,
    allowedTokens
  };
}

export function decodeMerkleRegistrationData(
  useRegistryAnchor: boolean,
  data: any
) {
  if (useRegistryAnchor) {
    const [, , metadata] = decodeAbi(data, [
        "address",
        "uint256",
        "tuple(uint256, string)",
    ]);

    return {
      metatdata: formatMetadataAsStruct(metadata),
    };
  } else {
    const [, , metadata] = decodeAbi(data, [
        "address",
        "address",
        "tuple(uint256, string)",
    ]);

    return {
      metadata: formatMetadataAsStruct(metadata),
    };
  }
}
