import { describe, expect, it } from "vitest";
import { objectKey, parseObjectFolder, parseObjectPath } from "./storage-rules";

const owner = "11111111-1111-4111-8111-111111111111";
const inv = "22222222-2222-4222-8222-222222222222";

describe("parseObjectPath", () => {
  it("accepts owner/invitation/file", () => {
    expect(parseObjectPath(`${owner}/${inv}/123-0-photo.jpg`)).toEqual({
      ownerId: owner,
      invitationId: inv,
    });
  });

  it("rejects traversal, extra segments, and bad ids", () => {
    expect(parseObjectPath(`${owner}/${inv}/..`)).toBeNull();
    expect(parseObjectPath(`${owner}/${inv}/a/b.jpg`)).toBeNull();
    expect(parseObjectPath(`${owner}/../${inv}`)).toBeNull();
    expect(parseObjectPath(`not-a-uuid/${inv}/a.jpg`)).toBeNull();
    expect(parseObjectPath(`${owner}/${inv}/bad name.jpg`)).toBeNull();
  });
});

describe("parseObjectFolder", () => {
  it("accepts owner/invitation only", () => {
    expect(parseObjectFolder(`${owner}/${inv}`)).toEqual({ ownerId: owner, invitationId: inv });
    expect(parseObjectFolder(`${owner}`)).toBeNull();
    expect(parseObjectFolder(`${owner}/${inv}/x`)).toBeNull();
  });
});

describe("objectKey", () => {
  it("prefixes the logical bucket", () => {
    expect(objectKey("invitation-music", `${owner}/${inv}/m.mp3`)).toBe(
      `invitation-music/${owner}/${inv}/m.mp3`,
    );
  });
});
