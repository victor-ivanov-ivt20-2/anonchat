import { SeekerModel } from "../models/user.model";

export function searchCriteria(
  candidate: SeekerModel | undefined,
  interlocutor: SeekerModel | undefined
): boolean {
  if (!candidate || !interlocutor) return true;
  if (
    candidate.himself.age < interlocutor.opponent.age.from ||
    candidate.himself.age > interlocutor.opponent.age.to ||
    interlocutor.himself.age < candidate.opponent.age.from ||
    interlocutor.himself.age > candidate.opponent.age.to
  )
    return true;

  if (
    candidate.opponent.sex !== interlocutor.himself.sex ||
    candidate.himself.sex !== interlocutor.opponent.sex
  )
    return true;
  return false;
}
