export function validateRegistrationForm(data: any) {
  let errors: Record<string, string> = {};

  if (!data.firstName || data.firstName.trim() === '') {
    errors.firstName = 'First name is required';
  }

  if (!data.lastName || data.lastName.trim() === '') {
    errors.lastName = 'Last name is required';
  }

  if (!data.email || !/^[\w-.]+@[\w-]+\.[a-z]{2,}$/i.test(data.email)) {
    errors.email = 'Valid email is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}