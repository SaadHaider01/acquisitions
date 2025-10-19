import logger from '#config/logger.js';
import { createUser, authenticateUser } from '#services/auth.service.js';
import { cookies } from '#utils/cookies.js';
import { formatValidationError } from '#utils/format.js';
import { jwttoken } from '#utils/jwt.js';
import { signupSchema, signinSchema } from '#validations/auth.validation.js';


export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error)
      });
    }

    const {name, email, password, role} = validationResult.data;

    //AUTH SERVICE
    const user = await createUser({name, email, password, role});

    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });

    cookies.set(res, 'token', token);

    logger.info(`User signed up: ${email} with role ${role}`);
    return res.status(201).json({ 
      message: 'User registered', 
      user: {
        id: user.id,name:user.name,email:user.email,role:user.role} });
    
  } catch (e) {
    logger.error('Signup error', e);
    if(e.message=== 'User with this email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    next(e);
  }
};

export const signin = async (req, res, next) => {
  try {
    const validationResult = signinSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error)
      });
    }

    const { email, password } = validationResult.data;

    // AUTH SERVICE
    const user = await authenticateUser({ email, password });

    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });

    cookies.set(res, 'token', token);

    logger.info(`User signed in: ${email}`);
    return res.status(200).json({ 
      message: 'User signed in successfully', 
      user: {
        id: user.id, name: user.name, email: user.email, role: user.role
      }
    });
    
  } catch (e) {
    logger.error('Signin error', e);
    if (e.message === 'User not found' || e.message === 'Invalid password') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    next(e);
  }
};

export const signout = async (req, res, next) => {
  try {
    const token = cookies.get(req, 'token');
    let userEmail = 'unknown';

    // Try to get user email from token for logging
    if (token) {
      try {
        const decoded = jwttoken.verify(token);
        userEmail = decoded.email || 'unknown';
      } catch (e) {
        // Token might be invalid, but we still want to clear the cookie
        logger.warn('Invalid token during signout', e);
      }
    }

    cookies.clear(res, 'token');

    logger.info(`User signed out: ${userEmail}`);
    return res.status(200).json({ message: 'User signed out successfully' });
    
  } catch (e) {
    logger.error('Signout error', e);
    next(e);
  }
};
