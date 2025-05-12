import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "E-mail é obrigatório" })
    .email({ message: "E-mail inválido" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "E-mail é obrigatório" })
      .email({ message: "E-mail inválido" }),
    password: z
      .string()
      .min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirmação de senha é obrigatória" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const conversionSchema = z.object({
  cryptoId: z.string().min(1, {
    message: "Selecione uma criptomoeda",
  }),
  amount: z.number().optional(),
});

export type ConversionFormValues = z.infer<typeof conversionSchema>;

export const searchSchema = z.object({
  query: z.string().min(2, {
    message: "Digite pelo menos 2 caracteres",
  }),
});

export type SearchFormValues = z.infer<typeof searchSchema>;
