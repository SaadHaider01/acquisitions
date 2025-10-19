export const formatValidationError = (errors) => {
  if (!errors || !errors.issue) return 'Validation Failed';

  if(Array.isArray(errors.issue)) return errors.issues.map(i => i.message).join(', ');

  return JSON.stringify(errors);
};