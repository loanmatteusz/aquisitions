import { ZodError } from "zod";

export const formatValidationError = (errors: ZodError): string => {
    if (!errors?.issues?.length) return 'Validation failed';
    return errors.issues.map(issue => issue.message).join(', ');
};
