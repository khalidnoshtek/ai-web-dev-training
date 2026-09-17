// Who counts as an admin / trainer.
//
// This list controls the UI only — whether the Trainer link is shown and whether
// the dashboard bothers querying. The real enforcement is server-side in
// firestore.rules (`trainers()`), which is what actually stops a learner reading
// anyone else's progress. Hiding a link is not security.
//
// Keep this list and trainers() in firestore.rules in sync, then redeploy:
//   firebase deploy --only firestore:rules

export const ADMIN_EMAILS = [
  'xdrkzx@gmail.com'
];

export const isAdmin = email =>
  !!email && ADMIN_EMAILS.includes(String(email).trim().toLowerCase());
