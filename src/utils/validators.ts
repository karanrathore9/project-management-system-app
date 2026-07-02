

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRequired(value: string, fieldLabel: string): string | undefined {
  if (!value || !value.trim()) return `${fieldLabel} is required`;
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(value.trim())) return 'Enter a valid email address';
  return undefined;
}

export function validateMinLength(value: string, min: number, fieldLabel: string): string | undefined {
  if (value.trim().length < min) return `${fieldLabel} must be at least ${min} characters`;
  return undefined;
}

export function validateMaxLength(value: string, max: number, fieldLabel: string): string | undefined {
  if (value.trim().length > max) return `${fieldLabel} must be under ${max} characters`;
  return undefined;
}

export function firstError(...validators: Array<string | undefined>): string | undefined {
  return validators.find(Boolean);
}

export function isValid(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).every((v) => !v);
}


export interface LoginFormValues {
  email: string;
  password: string;
}

export function validateLoginForm(values: LoginFormValues) {
  return {
    email: validateEmail(values.email),
    password: validateRequired(values.password, 'Password'),
  };
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
}

export function validateRegisterForm(values: RegisterFormValues) {
  return {
    name: firstError(
      validateRequired(values.name, 'Name'),
      validateMinLength(values.name, 2, 'Name'),
      validateMaxLength(values.name, 80, 'Name')
    ),
    email: validateEmail(values.email),
    password: validateMinLength(values.password, 6, 'Password'),
  };
}

export interface ProjectFormValues {
  name: string;
  description: string;
}

export function validateProjectForm(values: ProjectFormValues) {
  return {
    name: firstError(
      validateRequired(values.name, 'Project name'),
      validateMinLength(values.name, 2, 'Project name'),
      validateMaxLength(values.name, 100, 'Project name')
    ),
    description: validateMaxLength(values.description, 500, 'Description'),
  };
}

export interface TaskFormValues {
  title: string;
  description: string;
}

export function validateTaskForm(values: TaskFormValues) {
  return {
    title: firstError(
      validateRequired(values.title, 'Title'),
      validateMaxLength(values.title, 200, 'Title')
    ),
    description: validateMaxLength(values.description, 2000, 'Description'),
  };
}

export interface AddMemberFormValues {
  userId: string;
}

export function validateAddMemberForm(values: AddMemberFormValues) {
  return {
    userId: validateRequired(values.userId, 'A user selection'),
  };
}
