// Gate de apresentação: um cálculo matemático não é, por si, uma proposta homologada.
// O endpoint legado ainda não fornece o bloco publication, portanto fica fail-closed.
const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;
const finiteDate = (value) => nonEmpty(value) && Number.isFinite(Date.parse(value));
const validOrderedRange = ({ minimum, likely, maximum } = {}) =>
  [minimum, likely, maximum].every((n) => typeof n === 'number' && Number.isFinite(n) && n > 0) &&
  minimum <= likely && likely <= maximum;

export const canPublishWGEasyEstimate = (payload, now = new Date()) => {
  const proof = payload?.publication;
  if (payload?.ok !== true || proof?.status !== 'homologated') return false;
  if (!nonEmpty(proof.approvalReference) || !nonEmpty(proof.calibrationReference)) return false;
  if (!nonEmpty(proof.scopeVersion) || proof.unit !== 'BRL/m2') return false;
  if (proof.sourceProjectRef !== 'xkvuhixxpfonfcwrvknm') return false;
  if (!finiteDate(proof.validUntil) || !finiteDate(proof.approvedAt) || !finiteDate(payload.referenceDate)) return false;
  const today = new Date(now);
  if (!Number.isFinite(today.getTime()) || Date.parse(proof.approvedAt) > today.getTime()) return false;
  if (Date.parse(proof.validUntil) < today.getTime()) return false;
  return validOrderedRange(payload.perSquareMeter) && validOrderedRange(payload.total);
};
