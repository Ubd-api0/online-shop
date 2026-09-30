// Mongoose documents (ObjectId, Date wrappers, $__ internals) aren't plain
// objects, so they can't cross the Server Component -> Client Component
// boundary as props. Call this on any data-layer result before handing it
// to a "use client" component.
export function serialize(data) {
  return JSON.parse(JSON.stringify(data));
}
