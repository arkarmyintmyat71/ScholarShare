import { isAdmin, isStudent } from "../utils/roles";

/**
 * WHO MAY DO WHAT - the one place for every permission rule in the UI.
 *
 * Roles: STUDENT and ADMIN. A "guest" is simply nobody signed in (user = null).
 * Ask like this in a component:   can.rate(user)   ->  true / false
 * Need a new rule? Add one line here. (The backend still enforces every rule; this only shows or hides buttons.)
 */
export const can = {
  // Everyone (guests too) can read approved research descriptions and browse categories.
  download: (user) => Boolean(user),
  comment: (user) => Boolean(user), // read the comments window
  writeComment: (user) => isStudent(user),
  rate: (user) => isStudent(user),
  save: (user) => isStudent(user),
  upload: (user) => isStudent(user),
  createTopic: (user) => isStudent(user),
  writeTopicComment: (user) => isStudent(user),
  moderateTopics: (user) => isAdmin(user),
  moderateComments: (user) => isAdmin(user),
  reviewResearch: (user) => isAdmin(user),
  /** Owner or administrator. `ownerId` is the id of the person who created the thing. */
  deleteResearch: (user, ownerId) => Boolean(user) && (isAdmin(user) || user.id === ownerId),
  editResearch: (user, ownerId) => isStudent(user) && user.id === ownerId,
};
