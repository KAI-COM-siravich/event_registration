import { validateRegistrationForm } from '../lib/validation';

async function saveRegistration(formData: any) {
  return formData;
}

export async function registerCustomer(formData: any) {
  // Validate the form data
  const { isValid, errors } = validateRegistrationForm(formData);
  if (!isValid) {
    throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
  }

  // Attempt to save the registration
  try {
    const registration = await saveRegistration(formData);
    return registration;
  } catch (error: any) {
    throw new Error(`Registration failed: ${error.message}`);
  }
}