export type ScoutEnvelope<TPayload = unknown> = {
  version: "scout-protocol/0.1";
  id: string;
  type: string;
  sender: string;
  recipient: string;
  timestamp: string;
  payload: TPayload;
  signature: null;
};

type EnvelopeParams<TPayload> = {
  type: string;
  sender: string;
  recipient: string;
  payload: TPayload;
};

export function createScoutEnvelope<TPayload>(
  params: EnvelopeParams<TPayload>
): ScoutEnvelope<TPayload> {
  return {
    version: "scout-protocol/0.1",
    id: crypto.randomUUID(),
    type: params.type,
    sender: params.sender,
    recipient: params.recipient,
    timestamp: new Date().toISOString(),
    payload: params.payload,
    signature: null,
  };
}
