import Joi from "joi";

export const createPostSchema = Joi.object({
  caption: Joi.string().max(500).allow("").optional().messages({
    "string.max": `"caption" must be at most 500 characters long`,
  }),
});

export const getPostsSchema = Joi.object({
  limit: Joi.number().integer().min(1).optional().default(10),
  cursor: Joi.string().allow("").optional(),
}).unknown(true);

export const postIdParamSchema = Joi.object({
  postId: Joi.number().integer().positive().required().messages({
    "number.base": `"postId" must be a number`,
    "number.integer": `"postId" must be an integer`,
    "number.positive": `"postId" must be a positive number`,
    "any.required": `"postId" is required`,
  }),
});
