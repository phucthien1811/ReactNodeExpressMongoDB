// api/repositories/token.repo.js
import { db } from "../config/database.js";

export const tokenRepo = {
  create: (data) => db("refresh_tokens").insert(data),
  findValid: (token) =>
    db("refresh_tokens")
      .where({ token, revoked: false })
      .andWhere("expires_at", ">", db.raw("NOW()"))
      .first(),
  revoke: (token) => db("refresh_tokens").where({ token }).update({ revoked: true }),
  revokeAllForUser: (user_id) => db("refresh_tokens").where({ user_id, revoked: false }).update({ revoked: true }),
};
