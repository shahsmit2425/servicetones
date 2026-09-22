export function fail(status: number, message: string): never {
  throw Object.assign(new Error(message), { status });
}
export function requireValue(
  value: unknown,
  message = "This integration is not configured.",
): asserts value {
  if (!value) fail(503, message);
}
