import bcrypt from "bcrypt";

export async function seed(knex) {
  // Xóa users cũ nếu có
  await knex("users").where({ email: "admin@gym.com" }).del();
  await knex("users").where({ email: "member@gym.com" }).del();

  // Tạo mật khẩu hash
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const memberPasswordHash = await bcrypt.hash("member123", 10);

  // Insert admin
  await knex("users").insert({
    email: "admin@gym.com",
    name: "Super Admin",
    password_hash: adminPasswordHash,
    role: "admin",
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Insert member test
  await knex("users").insert({
    email: "member@gym.com",
    name: "Test Member",
    password_hash: memberPasswordHash,
    role: "member",
    created_at: new Date(),
    updated_at: new Date(),
  });
}
