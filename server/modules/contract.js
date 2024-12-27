import Joi from "joi";

export const getBooksContract = Joi.object({
  key: Joi.string().required(),
  q: Joi.string().optional(),
  startIndex: Joi.number().optional(),
  maxResults: Joi.number().optional(),
});
