import { z } from 'zod';

// ─── Shared primitives ────────────────────────────────────────────────────────

const emailSchema = z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address');

const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long');

const slugSchema = z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug must be 50 characters or less')
    .regex(
        /^[a-z0-9_]+(?:[_-][a-z0-9_]+)*$/,
        'Only lowercase letters, numbers, hyphens, and underscores (no leading/trailing separators)',
    );

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
    tenantSlug: slugSchema,
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
    .object({
        displayName: z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(80, 'Name is too long')
            .regex(/\S/, 'Name cannot be blank'),
        email: emailSchema,
        password: passwordSchema,
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type SignupFormValues = z.infer<typeof signupSchema>;

// ─── Board ────────────────────────────────────────────────────────────────────

export const createBoardSchema = z.object({
    name: z
        .string()
        .min(1, 'Board name is required')
        .max(60, 'Board name must be 60 characters or less'),
    description: z
        .string()
        .max(200, 'Description must be 200 characters or less')
        .optional(),
    color: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color')
        .default('#6366f1'),
});

export type CreateBoardFormValues = z.infer<typeof createBoardSchema>;

// ─── Todo ─────────────────────────────────────────────────────────────────────

const todoStatusEnum = z.enum(['todo', 'in-progress', 'done'], {
    message: 'Select a valid status',
});


export const createTodoSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(120, 'Title must be 120 characters or less'),
    description: z
        .string()
        .max(1000, 'Description must be 1000 characters or less')
        .optional(),
    status: todoStatusEnum,
    assigneeId: z.string().optional(),
});

export type CreateTodoFormValues = z.infer<typeof createTodoSchema>;

// Update reuses the same shape but all fields are optional except it must have
// at least one key — enforced at call-site, not the schema level.
export const updateTodoSchema = createTodoSchema.partial();
export type UpdateTodoFormValues = z.infer<typeof updateTodoSchema>;