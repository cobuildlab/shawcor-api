import * as yup from 'yup';
import { ValidationError } from 'yup';
import { FetchStatusBody } from '../../shared/apis/types';
import { ParamFilterValidationError } from './invoices-types';

const invoiceSchema = yup.object().shape({
  environment: yup
    .string()
    .required('environment is required')
    .typeError('environment must be a string type'),
  invoiceId: yup
    .string()
    .required('invoiceId is required')
    .typeError('invoiceId must be a string type'),
  nameApi: yup
    .string()
    .required('nameApi is required')
    .typeError('nameApi must be a string type'),
  dunsBuyer: yup
    .string()
    .required('dunsBuyer is required')
    .typeError('dunsBuyer must be a string type'),
  submittedDate: yup
    .string()
    .required('submittedDate is required')
    .typeError('submittedDate must be a string type'),
});

export const validateParamFilter = async (
  paramFilter: FetchStatusBody,
): Promise<ParamFilterValidationError> => {
  let invoiceErrors: ParamFilterValidationError = [];
  try {
    await invoiceSchema.validate(paramFilter, { abortEarly: false });
  } catch (err) {
    if (err instanceof ValidationError) {
      invoiceErrors = err.inner.map((objError) => ({
        [objError.path as string]: objError.message,
      }));
    }
  }
  return invoiceErrors;
};
