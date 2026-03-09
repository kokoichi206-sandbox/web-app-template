import { RuleTester } from "eslint";
import rule from "./index.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

ruleTester.run("no-magic-strings-in-sql", rule, {
  valid: [
    // Using constant
    {
      code: `
            const USER_STATUS_ACTIVE = 'active';
            db.select().from(users).where(eq(users.status, USER_STATUS_ACTIVE));
          `,
    },
    // Using typed variable
    {
      code: `
            const status = getStatus();
            db.select().from(users).where(eq(users.status, status));
          `,
    },
    // Email is allowed
    {
      code: `
            db.select().from(users).where(eq(users.email, 'user@example.com'));
          `,
    },
    // UUID is allowed
    {
      code: `
            db.select().from(users).where(eq(users.id, 'a8ce71ab-7671-4aaa-a52d-8dbf8519e01d'));
          `,
    },
    // Not an ORM condition function
    {
      code: `
            someOtherFunction('active');
          `,
    },
  ],

  invalid: [
    // Magic string in eq
    {
      code: `
            db.select().from(users).where(eq(users.status, 'active'));
          `,
      errors: [
        {
          messageId: "noMagicStringInSQL",
          data: { value: "active" },
        },
      ],
    },
    // Magic string in ne
    {
      code: `
            db.select().from(users).where(ne(users.role, 'admin'));
          `,
      errors: [
        {
          messageId: "noMagicStringInSQL",
          data: { value: "admin" },
        },
      ],
    },
    // Magic string in like
    {
      code: `
            db.select().from(users).where(like(users.name, 'John%'));
          `,
      errors: [
        {
          messageId: "noMagicStringInSQL",
          data: { value: "John%" },
        },
      ],
    },
    // Multiple magic strings
    {
      code: `
            db.select().from(users).where(
              and(
                eq(users.status, 'active'),
                eq(users.role, 'admin')
              )
            );
          `,
      errors: [
        {
          messageId: "noMagicStringInSQL",
          data: { value: "active" },
        },
        {
          messageId: "noMagicStringInSQL",
          data: { value: "admin" },
        },
      ],
    },
  ],
});
