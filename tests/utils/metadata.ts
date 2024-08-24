import { TokenMetadata } from './types';

type SerializedYours = [string[], string, string];
type SerializedMetadata = [
  string,
  string,
  SerializedYours,
  string | null,
  string | null,
  string | null,
];

export function serializeTokenMetadata(
  metadata: TokenMetadata
): SerializedMetadata {
  const yours: SerializedYours = [
    metadata.yours.modules,
    metadata.yours.project,
    metadata.yours.collection,
  ];

  const result: SerializedMetadata = [
    metadata.name,
    JSON.stringify(metadata.properties),
    yours,
    metadata.description ?? null,
    metadata.image ?? null,
    metadata.animation_url ?? null,
  ];

  return result;
}
