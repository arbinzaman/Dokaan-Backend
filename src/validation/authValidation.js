import vine from '@vinejs/vine'
import {CustomErrorReporter} from './customErrorReporter.js';

// custom error reporter
vine.errorReporter = () => new CustomErrorReporter();

export const registerSchema = vine.object({
    name: vine.string().minLength(3).maxLength(150),
    email: vine.string().email(),
    password: vine.string().minLength(6).maxLength(20),
    role: vine.string().optional(),
});
export const updatePasswordSchema = vine.object({
    oldPassword: vine.string().minLength(6).maxLength(20),
    newPassword: vine.string().minLength(6).maxLength(20),

});

export const loginSchema = vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(6).maxLength(20),
});