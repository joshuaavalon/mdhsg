import { LoggableError } from "@mdhsg/core/error";

/**
 * Extract value from string by group
 *
 * @param regex `/(?<value>.+)/u`
 * @param groupName value
 * @returns Selected group
 */
export function extractRegex(regex: RegExp, input: string, groupName = "value"): string {
  const value = regex.exec(input)?.groups?.[groupName];
  if (!value) {
    throw new LoggableError({ groupName, input, regex }, "Cannot extract value from input with regex");
  }
  return value;
}
